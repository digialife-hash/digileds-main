import path from "path";

export const projectRoot = () =>
  path.resolve(process.cwd(), "storage", "projects");
export const joinProjectPath = (...segments) =>
  path.join(projectRoot(), ...segments);
