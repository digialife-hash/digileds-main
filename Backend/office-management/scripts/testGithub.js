import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

const token = process.env.GITHUB_TOKEN;
console.log("Token:", token);

try {
  const { data } = await axios.get("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  console.log("Successfully authenticated to GitHub as user:", data.login);
} catch (error) {
  console.error(
    "GitHub authentication failed:",
    error.response?.status,
    error.response?.data || error.message
  );
}
