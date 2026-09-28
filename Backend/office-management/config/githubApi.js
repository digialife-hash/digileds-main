import axios from "axios";

const githubApi = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    Accept: "application/vnd.github+json",
  },
});

githubApi.interceptors.request.use((config) => {
  const token = process.env.GITHUB_TOKEN;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn(
      "[GitHub] GITHUB_TOKEN is not set. GitHub API calls will be unauthenticated and rate-limited.",
    );
  }

  return config;
});

export default githubApi;
