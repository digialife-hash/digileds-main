export const mediaService = {
  validate(file) {
    return Boolean(
      file &&
      file.size <= 10 * 1024 * 1024 &&
      /^(image|video)\//.test(file.type),
    );
  },
  createPreview(file) {
    return URL.createObjectURL(file);
  },
};
