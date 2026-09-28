export const authService = {
  async login(email) {
    return { name: email.split("@")[0], email };
  },
  async register(name, email) {
    return { name, email };
  },
  async forgotPassword(email) {
    return { email, sent: true };
  },
};
