import githubApi from "../config/githubApi.js";

const getAllowedRepositories = () =>
  new Set(
    (process.env.GITHUB_ALLOWED_REPOS || "")
      .split(",")
      .map((repository) => repository.trim().toLowerCase())
      .filter(Boolean),
  );

const assertAllowedRepository = (owner, repo) => {
  const repository = `${owner}/${repo}`.toLowerCase();
  if (!getAllowedRepositories().has(repository)) {
    const error = new Error("Repository is not allowed");
    error.statusCode = 403;
    throw error;
  }
};

const handleGithubError = (res, error) => {
  const status = error.statusCode || error.response?.status || 502;
  return res.status(status).json({
    success: false,
    message: status === 403 ? "Repository is not allowed" : "GitHub request failed",
  });
};

export const testGithub = async (req, res) => {
  try {
    const response = await githubApi.get("/user");

    res.json(response.data);
  } catch (error) {
    handleGithubError(res, error);
  }
};


export const getRepo = async (req, res) => {
  try {

    const { owner, repo } = req.params;
    assertAllowedRepository(owner, repo);

    const response = await githubApi.get(
      `/repos/${owner}/${repo}`
    );

    res.json(response.data);

  } catch (error) {
    handleGithubError(res, error);
  }
};



export const getCommits = async (req, res) => {
  try {

    const { owner, repo } = req.params;
    assertAllowedRepository(owner, repo);

    const response = await githubApi.get(
      `/repos/${owner}/${repo}/commits`
    );

    res.json(response.data);

  } catch (error) {
    handleGithubError(res, error);
  }
};

export const getCommit = async (req, res) => {
  try {

    const { owner, repo, sha } = req.params;
    assertAllowedRepository(owner, repo);

    const response = await githubApi.get(
      `/repos/${owner}/${repo}/commits/${sha}`
    );

    res.json(response.data);

  } catch (error) {
    handleGithubError(res, error);
  }
};