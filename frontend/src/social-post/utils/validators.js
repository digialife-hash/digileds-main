export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export const required = (value) => Boolean(String(value || "").trim());
export const validatePost = ({ caption, platforms }) => ({
  caption: required(caption),
  platforms: platforms?.length > 0,
});
