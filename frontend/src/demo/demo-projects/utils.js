export const SITE_API = import.meta.env.VITE_SITE_API_URL || "";

export const IGNORED_UPLOAD_FOLDERS = new Set([
  "node_modules",
  ".git",
  ".github",
  "dist",
  "build",
  "coverage",
  ".cache",
  ".next",
  ".vite",
  ".turbo",
  ".vercel",
  ".idea",
  ".vscode",
]);

const ignoredUploadFoldersLower = new Set(
  [...IGNORED_UPLOAD_FOLDERS].map((folder) => folder.toLowerCase()),
);

export const PROJECT_TYPES = [
  { value: "auto", label: "Auto-detect (recommended)" },
  { value: "react", label: "React / Vite (frontend build)" },
  { value: "node", label: "Node.js Backend" },
  { value: "python", label: "Python (Flask / FastAPI / Django)" },
  { value: "php", label: "PHP" },
  { value: "java", label: "Java (Maven / Gradle)" },
  { value: "static", label: "Static HTML / CSS / JS" },
  { value: "fullstack", label: "Full Stack (frontend + backend + Mongo)" },
  { value: "docker", label: "Custom Dockerfile" },
];

export const PROJECT_TYPE_LABEL = Object.fromEntries(
  PROJECT_TYPES.map((type) => [type.value, type.label]),
);

export function isInsideIgnoredFolder(relativePath) {
  const parts = String(relativePath).replaceAll("\\", "/").split("/");
  return parts.some((part) =>
    ignoredUploadFoldersLower.has(part.toLowerCase()),
  );
}

export function filterUploadableFiles(fileList) {
  const allFiles = Array.from(fileList || []);
  const kept = [];
  let skippedCount = 0;
  for (const file of allFiles) {
    const relativePath = file.webkitRelativePath || file.name;
    if (isInsideIgnoredFolder(relativePath)) skippedCount += 1;
    else kept.push(file);
  }
  return { kept, skippedCount, totalCount: allFiles.length };
}

export function getUploadRelativePath(file, projectName) {
  const rawPath = String(file.webkitRelativePath || file.name || "").replaceAll(
    "\\",
    "/",
  );
  const parts = rawPath.split("/").filter(Boolean);
  if (
    parts[0]?.toLowerCase() === String(projectName).toLowerCase() &&
    parts.length > 1
  ) {
    return parts.slice(1).join("/");
  }
  return parts.join("/");
}

export function formatBytes(bytes) {
  if (!bytes) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function formatDate(dateString) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatRemaining(ms) {
  if (!ms || ms <= 0) return "Expired";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, "0")}m ${seconds
      .toString()
      .padStart(2, "0")}s`;
  }
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

export function getProjectType(type) {
  if (!type)
    return { label: "Web Application", icon: "◆", className: "type-default" };
  const value = type.toLowerCase();
  if (value === "react")
    return { label: "React Application", icon: "⚛", className: "type-react" };
  if (value === "fullstack")
    return { label: "Full Stack", icon: "◈", className: "type-fullstack" };
  if (value === "node")
    return { label: "Node.js Backend", icon: "JS", className: "type-node" };
  if (value === "static")
    return { label: "Static Website", icon: "◆", className: "type-static" };
  if (value === "python")
    return { label: "Python App", icon: "PY", className: "type-python" };
  if (value === "php")
    return { label: "PHP App", icon: "PHP", className: "type-php" };
  if (value === "java")
    return { label: "Java App", icon: "JV", className: "type-java" };
  if (value === "docker")
    return { label: "Custom Docker", icon: "🐳", className: "type-default" };
  return {
    label: type.charAt(0).toUpperCase() + type.slice(1),
    icon: "◇",
    className: "type-default",
  };
}
