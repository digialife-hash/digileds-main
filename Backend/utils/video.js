export const getVideoMimeType = (filename = "") => {
  const lower = String(filename).toLowerCase();
  if (lower.endsWith(".mp4")) return "video/mp4";
  if (lower.endsWith(".webm")) return "video/webm";
  if (lower.endsWith(".ogg")) return "video/ogg";
  return "video/mp4";
};
