import { execFile } from "child_process";
import { promisify } from "util";
import { setTimeout as wait } from "node:timers/promises";

import {
  fs,
  path,
  exists,
  findFirst,
  findFileCaseInsensitive,
  findFrontendPackage,
  ensureDockerignore,
} from "../utils/file-and-project-utils.js";

import {
  BASE_PORT,
  MAX_DEMO_PORTS,
  DEMO_CPUS,
  DEMO_MEMORY,
  DEMO_PIDS_LIMIT,
} from "../config/environment.js";

import * as store from "./data-repository.js";

const execFileAsync = promisify(execFile);

let nextPort = BASE_PORT;

const imageBuilds = new Map();

/* ============================================================
   DOCKER COMMAND
============================================================ */

export async function runDocker(args, { cwd } = {}) {
  console.log(
    "DOCKER:",
    ["docker", ...args].map((arg) => `"${arg}"`).join(" "),
  );

  try {
    const { stdout } = await execFileAsync("docker", args, {
      cwd,
      maxBuffer: 20 * 1024 * 1024,
    });

    return stdout.trim();
  } catch (error) {
    const details = `${error.message || ""}\n${error.stderr || ""}`;

    if (
      error.code === "ENOENT" ||
      /dockerDesktopLinuxEngine|failed to connect to the docker api|cannot connect to the docker daemon|is the docker daemon running|error during connect|docker_engine/i.test(
        details,
      )
    ) {
      const unavailable = new Error(
        "Docker is unavailable. Start Docker Desktop (Linux engine) or the Docker daemon, wait until it is running, then retry.",
      );

      unavailable.code = "DOCKER_UNAVAILABLE";
      unavailable.cause = error;

      throw unavailable;
    }

    throw error;
  }
}

/* ============================================================
   DOCKER RESOURCE HELPERS
============================================================ */

export function isAlreadyRemovedDockerResource(error) {
  return /no such (container|network)|not found/i.test(error?.message || "");
}

async function isDockerPortUsed(port) {
  try {
    const { stdout } = await execFileAsync(
      "docker",
      ["ps", "-q", "--filter", `publish=${port}`],
      {
        maxBuffer: 1024 * 1024,
      },
    );

    return Boolean(stdout.trim());
  } catch {
    return false;
  }
}

async function isHostPortUsed(port) {
  try {
    if (process.platform === "win32") {
      const { stdout } = await execFileAsync(
        "cmd",
        ["/c", `netstat -ano | findstr :${port}`],
        {
          maxBuffer: 1024 * 1024,
        },
      );

      return Boolean(stdout.trim());
    }

    const { stdout } = await execFileAsync(
      "sh",
      ["-c", `ss -ltn 2>/dev/null | grep -E '[:.]${port}[[:space:]]' || true`],
      {
        maxBuffer: 1024 * 1024,
      },
    );

    return Boolean(stdout.trim());
  } catch {
    return false;
  }
}

export async function getNextFreePort() {
  const dbUsedPorts = new Set(await store.getUsedPorts());

  for (let attempt = 0; attempt < MAX_DEMO_PORTS + 1; attempt += 1) {
    const port = nextPort;

    nextPort =
      nextPort + 1 > BASE_PORT + MAX_DEMO_PORTS ? BASE_PORT : nextPort + 1;

    if (dbUsedPorts.has(port)) continue;

    if (await isDockerPortUsed(port)) continue;

    if (await isHostPortUsed(port)) continue;

    return port;
  }

  throw new Error("No free demo port available");
}

/* ============================================================
   NGINX CONFIG
============================================================ */

const nginxConfig = `
RUN rm -f /etc/nginx/conf.d/default.conf

RUN printf '%s' '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="#e2e8f0"/><text x="600" y="410" text-anchor="middle" font-family="Arial,sans-serif" font-size="42" fill="#64748b">Image unavailable</text></svg>' > /usr/share/nginx/html/demo-placeholder.svg

RUN printf '%s\\n' \
'server {' \
'    listen 80;' \
'    server_name _;' \
'    root /usr/share/nginx/html;' \
'    index index.html;' \
'' \
'    location / {' \
'        try_files $uri $uri/ /index.html;' \
'    }' \
'' \
'    location ~* \\.(jpg|jpeg|png|gif|webp|svg)$ {' \
'        try_files $uri /demo-placeholder.svg;' \
'    }' \
'}' \
> /etc/nginx/conf.d/default.conf
`;

/* ============================================================
   HELPER
   Find actual Node package folder
============================================================ */

async function resolveNodeProjectDirectory(project) {
  const rootPackage = path.join(project.path, "package.json");

  if (await exists(rootPackage)) {
    return project.path;
  }

  /*
   * Detector may say:
   *
   * project.path = New folder (3)
   * nodeFolder   = Backend
   *
   * So check Backend/package.json.
   */

  const candidates = [
    project.nodeFolder,
    project.nodeDir,
    project.nodePath,
    project.backendFolder,
    project.backendDir,
    project.backendPath,
  ].filter(Boolean);

  for (const candidate of candidates) {
    const candidatePath = path.isAbsolute(candidate)
      ? candidate
      : path.join(project.path, candidate);

    if (await exists(path.join(candidatePath, "package.json"))) {
      return candidatePath;
    }
  }

  /*
   * Automatic one-level search.
   */

  try {
    const entries = await fs.readdir(project.path, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      /*
       * Skip common folders.
       */

      if (
        [
          "node_modules",
          ".git",
          "dist",
          "build",
          ".next",
          ".vite",
          "coverage",
        ].includes(entry.name)
      ) {
        continue;
      }

      const candidatePath = path.join(project.path, entry.name);

      if (await exists(path.join(candidatePath, "package.json"))) {
        return candidatePath;
      }
    }
  } catch {
    // Ignore directory scan errors.
  }

  throw new Error(
    `"${project.name}" me Node.js package.json nahi mila. Project root ya Backend folder me package.json hona chahiye.`,
  );
}

/* ============================================================
   REACT DOCKERFILE
============================================================ */

export async function ensureReactDockerfile(project) {
  const dockerfilePath = path.join(project.path, "Dockerfile");

  const frontendPackage = await findFrontendPackage(project.path);

  const frontendFolder = frontendPackage?.relative
    ? frontendPackage.relative.replaceAll("\\", "/")
    : null;

  const packageCopy = frontendFolder
    ? `COPY ["${frontendFolder}/package*.json", "./"]`
    : "COPY package*.json ./";

  const sourceCopy = frontendFolder
    ? `COPY ["${frontendFolder}/.", "."]`
    : "COPY . .";

  const dockerfile = `FROM node:22-alpine AS build

WORKDIR /app

${packageCopy}

RUN npm install

${sourceCopy}

RUN if node -e "const p=require('./package.json'); process.exit(p.dependencies?.vite || p.devDependencies?.vite ? 0 : 1)"; then npm run build -- --base=./; else PUBLIC_URL=./ npm run build; fi

RUN for root in dist build; do \
if [ -d "$root" ]; then \
for file in $(find "$root" -type f \\( -name "*.html" -o -name "*.css" -o -name "*.js" -o -name "*.mjs" \\)); do \
node -e 'const fs=require("fs");const p=process.argv[1];let s=fs.readFileSync(p,"utf8");const d="assets|uploads|images|videos|fonts|media";s=s.replace(new RegExp("(["+String.fromCharCode(34,39,40)+"])/("+d+")/","g"),"$1./$2/");const b=String.fromCharCode(96);s=s.replace(new RegExp(b+"/("+d+")/","g"),b+"./$1/");fs.writeFileSync(p,s)' "$file"; \
done; \
fi; \
done

RUN mkdir -p /app/output && \
if [ -f dist/index.html ]; then \
cp -r dist/. /app/output/; \
elif [ -f build/index.html ]; then \
cp -r build/. /app/output/; \
else \
found=0; \
for dir in dist/* build/*; do \
if [ -f "$dir/index.html" ]; then \
cp -r "$dir"/. /app/output/; \
found=1; \
break; \
fi; \
done; \
if [ "$found" = "0" ]; then \
echo "Build output with index.html not found"; \
exit 1; \
fi; \
fi

FROM nginx:alpine

${nginxConfig}

COPY --from=build /app/output /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
`;

  await fs.writeFile(dockerfilePath, dockerfile, "utf8");

  return dockerfilePath;
}

/* ============================================================
   NODE DOCKERFILE
   IMPORTANT FIX:
   Dockerfile is generated INSIDE actual Node folder.
============================================================ */

export async function ensureNodeDockerfile(project) {
  const nodeProjectPath = await resolveNodeProjectDirectory(project);

  const dockerfilePath = path.join(nodeProjectPath, "Dockerfile");

  const packageJsonPath = path.join(nodeProjectPath, "package.json");

  let pkg;

  try {
    pkg = JSON.parse(await fs.readFile(packageJsonPath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(`package.json nahi mila: ${packageJsonPath}`);
    }

    throw new Error(
      `Invalid package.json: ${packageJsonPath}\n${error.message}`,
    );
  }

  if (!pkg.scripts?.start) {
    throw new Error(
      `"${project.name}" ke package.json me "start" script nahi mila.\n` +
        `Add karo, example:\n` +
        `"scripts": { "start": "node index.js" }`,
    );
  }

  /*
   * IMPORTANT:
   *
   * Build context = nodeProjectPath
   *
   * Therefore:
   *
   * COPY package*.json ./
   * COPY . .
   *
   * No more:
   *
   * COPY Backend/...
   */

  const dockerfile = `FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV NODE_ENV=production

ENV PORT=5000

EXPOSE 5000

USER node

CMD ["npm", "start"]
`;

  await fs.writeFile(dockerfilePath, dockerfile, "utf8");

  /*
   * Keep node_modules and unnecessary files
   * outside Docker build context.
   */

  await ensureDockerignore(
    {
      ...project,
      path: nodeProjectPath,
    },
    [
      "node_modules",
      "npm-debug.log",
      "yarn-error.log",
      "pnpm-debug.log",
      ".git",
      ".gitignore",
      ".env",
      ".env.*",
      "dist",
      "build",
      ".vite",
      ".next",
      "coverage",
      "*.db",
    ],
  );

  console.log(`[NODE DOCKER] Project: ${project.name}`);

  console.log(`[NODE DOCKER] Build context: ${nodeProjectPath}`);

  console.log(`[NODE DOCKER] package.json: ${packageJsonPath}`);

  return {
    dockerfilePath,
    buildContext: nodeProjectPath,
  };
}

/* ============================================================
   STATIC DOCKERFILE
============================================================ */

export async function ensureStaticDockerfile(project) {
  const dockerfilePath = path.join(project.path, "Dockerfile");

  await fs.writeFile(
    dockerfilePath,
    `FROM nginx:alpine

${nginxConfig}

COPY . /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
`,
    "utf8",
  );

  await ensureDockerignore(project);

  return {
    dockerfilePath,
    buildContext: project.path,
  };
}

/* ============================================================
   PYTHON DOCKERFILE
============================================================ */

export async function ensurePythonDockerfile(project) {
  const dockerfilePath = path.join(project.path, "Dockerfile");

  const hasRequirements = await exists(
    path.join(project.path, "requirements.txt"),
  );

  const entryFile = await findFirst(project.path, [
    "manage.py",
    "app.py",
    "main.py",
    "server.py",
    "wsgi.py",
  ]);

  if (!entryFile) {
    throw new Error(
      `"${project.name}" me koi Python entry file nahi mili (manage.py / app.py / main.py / server.py). App ko 0.0.0.0:$PORT (default 5000) par listen karna chahiye.`,
    );
  }

  const runCmd =
    entryFile === "manage.py"
      ? `CMD ["python", "manage.py", "runserver", "0.0.0.0:5000"]`
      : `CMD ["python", "${entryFile}"]`;

  await fs.writeFile(
    dockerfilePath,
    `FROM python:3.12-slim

WORKDIR /app

${
  hasRequirements
    ? "COPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt"
    : "RUN pip install --no-cache-dir flask"
}

COPY . .

ENV PORT=5000

EXPOSE 5000

${runCmd}
`,
    "utf8",
  );

  await ensureDockerignore(project, ["venv", "__pycache__", "*.pyc"]);

  return {
    dockerfilePath,
    buildContext: project.path,
  };
}

/* ============================================================
   PHP DOCKERFILE
============================================================ */

export async function ensurePhpDockerfile(project) {
  const dockerfilePath = path.join(project.path, "Dockerfile");

  const hasComposer = await exists(path.join(project.path, "composer.json"));

  await fs.writeFile(
    dockerfilePath,
    `FROM php:8.3-apache

${
  hasComposer
    ? "COPY --from=composer:2 /usr/bin/composer /usr/bin/composer"
    : ""
}

COPY . /var/www/html/

${
  hasComposer
    ? "RUN composer install --no-dev --no-interaction --optimize-autoloader"
    : ""
}

RUN a2enmod rewrite

EXPOSE 80
`,
    "utf8",
  );

  await ensureDockerignore(project, ["vendor"]);

  return {
    dockerfilePath,
    buildContext: project.path,
  };
}

/* ============================================================
   JAVA DOCKERFILE
============================================================ */

export async function ensureJavaDockerfile(project) {
  const dockerfilePath = path.join(project.path, "Dockerfile");

  const hasMaven = await exists(path.join(project.path, "pom.xml"));

  const dockerfile = hasMaven
    ? `
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

COPY pom.xml .

COPY . .

RUN mvn -q -DskipTests package

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/target/*.jar /app/app.jar

ENV SERVER_PORT=8080

EXPOSE 8080

CMD ["java", "-jar", "/app/app.jar"]
`
    : `
FROM gradle:8-jdk21 AS build

WORKDIR /app

COPY . .

RUN gradle bootJar --no-daemon

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/build/libs/*.jar /app/app.jar

ENV SERVER_PORT=8080

EXPOSE 8080

CMD ["java", "-jar", "/app/app.jar"]
`;

  await fs.writeFile(dockerfilePath, dockerfile, "utf8");

  await ensureDockerignore(project, ["target", "build", ".gradle"]);

  return {
    dockerfilePath,
    buildContext: project.path,
  };
}

/* ============================================================
   EXISTING DOCKERFILE
============================================================ */

export async function buildFromExistingDockerfile(
  project,
  imageName,
  { forceRebuild = false, dockerfilePath = null, buildContext = null } = {},
) {
  const actualDockerfile =
    dockerfilePath ||
    (await findFileCaseInsensitive(project.path, "Dockerfile")) ||
    path.join(project.path, "Dockerfile");

  if (!(await exists(actualDockerfile))) {
    throw new Error(
      `Dockerfile not found for ${project.type} project: ${project.name}`,
    );
  }

  if (!forceRebuild) {
    try {
      await runDocker(["image", "inspect", imageName]);

      return;
    } catch {
      // Image does not exist.
    }
  }

  /*
   * CRITICAL:
   *
   * Build context can now be different from project.path.
   *
   * For Node Backend:
   *
   * Dockerfile:
   * D:/.../New folder (3)/Backend/Dockerfile
   *
   * Context:
   * D:/.../New folder (3)/Backend
   *
   * This prevents:
   *
   * COPY Backend/. .
   *
   * problem.
   */

  const context = buildContext || project.path;

  const dockerfileForBuild = path.basename(actualDockerfile);

  console.log(`[DOCKER BUILD] project=${project.name}`);

  console.log(`[DOCKER BUILD] context=${context}`);

  console.log(`[DOCKER BUILD] dockerfile=${actualDockerfile}`);

  await runDocker(
    [
      "build",
      "--label",
      "demo-manager=true",
      "--tag",
      imageName,
      "--file",
      dockerfileForBuild,
      ".",
    ],
    {
      cwd: context,
    },
  );
}

/* ============================================================
   BUILD PROJECT IMAGE
============================================================ */

export async function buildProjectImageNow(project) {
  const imageName = `${project.id}-demo:latest`;

  /*
   * Base project ignore.
   */

  await ensureDockerignore(project, [
    "dist",
    "build",
    ".vite",
    ".next",
    "coverage",
    "*.db",
  ]);

  const generators = {
    react: ensureReactDockerfile,
    node: ensureNodeDockerfile,
    python: ensurePythonDockerfile,
    php: ensurePhpDockerfile,
    java: ensureJavaDockerfile,
    static: ensureStaticDockerfile,
  };

  /* ==========================================================
     FULLSTACK / CUSTOM DOCKER
  ========================================================== */

  if (project.type === "fullstack" || project.type === "docker") {
    await buildFromExistingDockerfile(project, imageName);

    return imageName;
  }

  /* ==========================================================
     GENERATED PROJECT TYPES
  ========================================================== */

  if (generators[project.type]) {
    const result = await generators[project.type](project);

    /*
     * Node generator returns:
     *
     * {
     *   dockerfilePath,
     *   buildContext
     * }
     *
     * Other generators also return same structure.
     */

    const dockerfilePath =
      typeof result === "string" ? result : result?.dockerfilePath;

    const buildContext =
      typeof result === "string"
        ? project.path
        : result?.buildContext || project.path;

    await buildFromExistingDockerfile(project, imageName, {
      forceRebuild: project.type === "react",
      dockerfilePath,
      buildContext,
    });

    return imageName;
  }

  throw new Error(`Unsupported project type: ${project.type}`);
}

/* ============================================================
   BUILD LOCK
============================================================ */

export function buildProjectImage(project) {
  const existingBuild = imageBuilds.get(project.id);

  if (existingBuild) {
    return existingBuild;
  }

  const build = (async () => {
    try {
      return await buildProjectImageNow(project);
    } finally {
      imageBuilds.delete(project.id);
    }
  })();

  imageBuilds.set(project.id, build);

  return build;
}

/* ============================================================
   WARM PROJECT IMAGES
============================================================ */

export async function warmProjectImages(discoverProjects) {
  for (const project of await discoverProjects()) {
    try {
      await buildProjectImage(project);

      console.log(`WARMED PROJECT IMAGE: ${project.name}`);
    } catch (error) {
      console.error(`PROJECT WARMUP FAILED (${project.name}):`, error.message);
    }
  }
}

/* ============================================================
   VERIFY CONTAINER
============================================================ */

export async function verifyContainerRunning(containerName) {
  await wait(1500);

  let state;

  try {
    state = JSON.parse(
      await runDocker([
        "inspect",
        "--format",
        "{{json .State}}",
        containerName,
      ]),
    );
  } catch (error) {
    throw new Error(
      `Container "${containerName}" ki state inspect nahi ho paayi: ${error.message}`,
    );
  }

  if (state?.Running === true) {
    return;
  }

  let logs = "";

  try {
    logs = await runDocker(["logs", "--tail", "50", containerName]);
  } catch (error) {
    logs = `Unable to read container logs: ${error.message}`;
  }

  throw new Error(
    `Container "${containerName}" start hone ke turant baad exit ho gaya.` +
      (logs ? `\n--- docker logs ---\n${logs}` : ""),
  );
}

/* ============================================================
   CONTAINER STATUS
============================================================ */

export async function inspectContainerStatus(containerName) {
  if (!containerName) {
    return {
      status: "unknown",
      health: "unknown",
    };
  }

  try {
    const raw = await runDocker([
      "inspect",
      "--format",
      "{{json .State}}",
      containerName,
    ]);

    const state = JSON.parse(raw);

    return {
      status: state.Status || (state.Running ? "running" : "unknown"),

      health: state.Health?.Status || (state.Running ? "healthy" : "unhealthy"),

      running: Boolean(state.Running),

      startedAt: state.StartedAt || null,

      exitCode: Number.isInteger(state.ExitCode) ? state.ExitCode : null,
    };
  } catch (error) {
    if (isAlreadyRemovedDockerResource(error)) {
      return {
        status: "missing",
        health: "missing",
        running: false,
      };
    }

    if (error.code === "DOCKER_UNAVAILABLE") {
      return {
        status: "unavailable",
        health: "unavailable",
        running: false,
      };
    }

    return {
      status: "error",
      health: "error",
      running: false,
      message: error.message,
    };
  }
}

/* ============================================================
   CONTAINER ISOLATION
============================================================ */

export function containerIsolationArgs() {
  return [
    "--memory",
    DEMO_MEMORY,

    "--cpus",
    DEMO_CPUS,

    "--pids-limit",
    String(DEMO_PIDS_LIMIT),

    "--cap-drop",
    "ALL",

    "--cap-add",
    "CHOWN",

    "--cap-add",
    "SETGID",

    "--cap-add",
    "SETUID",

    "--security-opt",
    "no-new-privileges:true",
  ];
}
