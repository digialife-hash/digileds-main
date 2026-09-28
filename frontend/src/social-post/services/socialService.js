export const socialService = {
  platforms: ["Instagram", "LinkedIn", "Twitter"],
  async connect(platform) {
    return { platform, connected: true };
  },
  async disconnect(platform) {
    return { platform, connected: false };
  },
};
