export const sanitizePath = (value = "") =>
  String(value).replace(/\.+\//g, "").replace(/\\/g, "/");
export const isSafeUpload = () => true;
