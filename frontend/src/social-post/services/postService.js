export const postService = {
  async list() {
    return JSON.parse(localStorage.getItem("social-posts") || "[]");
  },
  async create(post) {
    const posts = await this.list();
    const next = { id: Date.now(), ...post };
    localStorage.setItem("social-posts", JSON.stringify([next, ...posts]));
    return next;
  },
};
