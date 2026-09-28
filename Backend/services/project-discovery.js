import {
  fs,
  path,
  exists,
  hasAny,
  findFileCaseInsensitive,
  findFrontendPackage,
  normalizedIgnoredFolders,
  slugify,
} from "../utils/file-and-project-utils.js";

import {
  PROJECT_META_FILE,
  PROJECT_ROOT,
  STORAGE_ROOT,
  VALID_PROJECT_TYPES,
} from "../config/environment.js";

export async function readProjectMeta(projectPath) {
  try {
    const raw = await fs.readFile(
      path.join(projectPath, PROJECT_META_FILE),
      "utf8",
    );

    const parsed = JSON.parse(raw);

    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export async function writeProjectMeta(projectPath, meta) {
  await fs.mkdir(projectPath, {
    recursive: true,
  });

  await fs.writeFile(
    path.join(projectPath, PROJECT_META_FILE),
    JSON.stringify(meta, null, 2) + "\n",
    "utf8",
  );
}

export function detectProjectType({
  hasFrontend,
  hasBackend,
  hasRootPackage,
  rootPackage,
  hasPython,
  hasPhp,
  hasJava,
  hasStaticHtml,
  hasDockerfile,
  hasViteConfig,
}) {
  if (hasFrontend && hasBackend) {
    return "fullstack";
  }

  if (hasFrontend) {
    return "react";
  }

  if (hasBackend) {
    return "node";
  }

  if (
    hasRootPackage &&
    (hasViteConfig || (hasStaticHtml && rootPackage?.scripts?.build))
  ) {
    return "react";
  }

  if (hasRootPackage) {
    return "node";
  }

  if (hasPython) {
    return "python";
  }

  if (hasPhp) {
    return "php";
  }

  if (hasJava) {
    return "java";
  }

  if (hasStaticHtml) {
    return "static";
  }

  if (hasDockerfile) {
    return "docker";
  }

  return "unknown";
}

async function getProjectRoots() {
  await fs.mkdir(PROJECT_ROOT, { recursive: true });
  return [PROJECT_ROOT];
}

export async function findProjectDirectoryCaseInsensitive(projectName) {
  const roots = await getProjectRoots();
  for (const root of roots) {
    try {
      const entries = await fs.readdir(root, { withFileTypes: true });
      const entry = entries.find(
        (item) =>
          item.isDirectory() &&
          item.name.toLowerCase() === projectName.toLowerCase(),
      );
      if (entry) return path.join(root, entry.name);
    } catch {
      // continue to the next root
    }
  }
  return null;
}

export async function discoverProjects() {
  await fs.mkdir(STORAGE_ROOT, { recursive: true });
  await fs.mkdir(PROJECT_ROOT, { recursive: true });

  const roots = await getProjectRoots();
  const seenPaths = new Set();
  const seenIds = new Set();
  const projects = [];

  for (const root of roots) {
    let entries = [];
    try {
      entries = await fs.readdir(root, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (
        !entry.isDirectory() ||
        normalizedIgnoredFolders.has(entry.name.toLowerCase())
      ) {
        continue;
      }

      const projectPath = path.join(root, entry.name);
      if (seenPaths.has(projectPath)) continue;
      seenPaths.add(projectPath);

      const projectId = slugify(entry.name);
      if (seenIds.has(projectId)) continue;
      seenIds.add(projectId);

      const frontendPackage = await findFrontendPackage(projectPath);

      const hasFrontend = Boolean(frontendPackage);

      const hasBackend = await exists(
        path.join(projectPath, "backend", "package.json"),
      );

      const hasRootPackage = await exists(
        path.join(projectPath, "package.json"),
      );

      let rootPackage = null;

      if (hasRootPackage) {
        try {
          rootPackage = JSON.parse(
            await fs.readFile(path.join(projectPath, "package.json"), "utf8"),
          );
        } catch (error) {
          console.error(
            `Invalid package.json in ${entry.name}:`,
            error.message,
          );
        }
      }

      const hasDockerfile = Boolean(
        await findFileCaseInsensitive(projectPath, "Dockerfile"),
      );

      const hasPython = await hasAny(projectPath, [
        "requirements.txt",
        "pyproject.toml",
        "manage.py",
        "app.py",
        "main.py",
        "server.py",
      ]);

      const hasPhp = await hasAny(projectPath, ["composer.json", "index.php"]);

      const hasJava = await hasAny(projectPath, [
        "pom.xml",
        "build.gradle",
        "build.gradle.kts",
        "settings.gradle",
        "settings.gradle.kts",
      ]);

      const hasStaticHtml = await exists(path.join(projectPath, "index.html"));

      const hasViteConfig =
        (await exists(path.join(projectPath, "vite.config.js"))) ||
        (await exists(path.join(projectPath, "vite.config.ts")));

      if (
        !hasFrontend &&
        !hasBackend &&
        !hasRootPackage &&
        !hasDockerfile &&
        !hasPython &&
        !hasPhp &&
        !hasJava &&
        !hasStaticHtml
      ) {
        continue;
      }

      const meta = await readProjectMeta(projectPath);

      const manualType =
        meta?.type &&
        VALID_PROJECT_TYPES.includes(meta.type) &&
        meta.type !== "auto"
          ? meta.type
          : null;

      projects.push({
        id: slugify(entry.name),

        name: entry.name
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),

        folder: entry.name,

        path: projectPath,

        type:
          manualType ||
          detectProjectType({
            hasFrontend,
            hasBackend,
            hasRootPackage,
            rootPackage,
            hasPython,
            hasPhp,
            hasJava,
            hasStaticHtml,
            hasDockerfile,
            hasViteConfig,
          }),

        typeIsManual: Boolean(manualType),

        hasDockerfile,
        video: meta?.video || null,
      });
    }
  }

  return projects;
}

export async function findProject(projectId) {
  const normalizedId = String(projectId || "")
    .trim()
    .toLowerCase();

  const projects = await discoverProjects();

  return projects.find((project) => project.id.toLowerCase() === normalizedId);
}
