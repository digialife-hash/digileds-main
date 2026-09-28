  import githubApi from "../config/githubApi.js";
  import AppError from "../utils/AppError.js";

  const handleGithubError = (error, context) => {
    const status = error.response?.status;
    const detail =
      error.response?.data?.message || error.message || "Unknown error";

    console.error(`[GitHub] ${context} — HTTP ${status ?? "N/A"}: ${detail}`);

    if (status === 401) {
      return new AppError(
        "GitHub authentication failed. Check your GITHUB_TOKEN configuration.",
        401,
        "GITHUB_TOKEN_INVALID"
      );
    }

    if (status === 403) {
      return new AppError(
        detail,
        403,
        "GITHUB_FORBIDDEN"
      );
    }

    if (status === 404) {
      return new AppError(
        "GitHub repository not found. Verify the repository URL is correct and the repository is accessible.",
        404,
        "GITHUB_REPO_NOT_FOUND"
      );
    }

    if (status === 422) {
      return new AppError(
        "GitHub API validation error.",
        422,
        "GITHUB_VALIDATION_ERROR"
      );
    }

    if (status === 503) {
      return new AppError(
        "GitHub service is temporarily unavailable.",
        503,
        "GITHUB_SERVICE_UNAVAILABLE"
      );
    }

    if (
      error.code === "ECONNREFUSED" ||
      error.code === "ENOTFOUND" ||
      error.code === "ETIMEDOUT"
    ) {
      return new AppError(
        "Unable to reach GitHub API. Please check your network connection.",
        502,
        "GITHUB_NETWORK_ERROR"
      );
    }

    return new AppError(
      `${context} — ${detail}`,
      status || 500,
      "GITHUB_API_ERROR"
    );
  };

  export const getRepository = async (owner, repo) => {
    try {
      const { data } = await githubApi.get(`/repos/${owner}/${repo}`);
      return data;
    } catch (error) {
      throw handleGithubError(error, "Repository lookup failed");
    }
  };

  export const getBranches = async (owner, repo) => {
    try {
      const { data } = await githubApi.get(`/repos/${owner}/${repo}/branches`, {
        params: {
          per_page: 100,
        },
      });

      return data;
    } catch (error) {
      throw handleGithubError(error, "Branches fetch failed");
    }
  };

  export const getCommits = async (
    owner,
    repo,
    branch = undefined,
    page = 1
  ) => {
    try {
      const { data } = await githubApi.get(
        `/repos/${owner}/${repo}/commits`,
        {
          params: {
            sha: branch,
            page,
            per_page: 20,
          },
        }
      );

      return data;
    } catch (error) {
      throw handleGithubError(error, "Commits fetch failed");
    }
  };

  export const getLatestCommit = async (
    owner,
    repo,
    branch = undefined
  ) => {
    try {
      const { data } = await githubApi.get(
        `/repos/${owner}/${repo}/commits`,
        {
          params: {
            sha: branch,
            per_page: 1,
          },
        }
      );

      return data.length ? data[0] : null;
    } catch (error) {
      throw handleGithubError(error, "Latest commit fetch failed");
    }
  };

  export const getCommitCount = async (
    owner,
    repo,
    branch = undefined
  ) => {
    try {
      const response = await githubApi.get(
        `/repos/${owner}/${repo}/commits`,
        {
          params: {
            sha: branch,
            per_page: 1,
          },
        }
      );

      const link = response.headers.link;

      if (!link) {
        return response.data.length;
      }

      const match = link.match(/page=(\d+)>; rel="last"/);

      if (match) {
        return Number(match[1]);
      }

      return response.data.length;
    } catch (error) {
      throw handleGithubError(error, "Commit count fetch failed");
    }
  };

  export const getRepositoryData = async (
    owner,
    repo,
    branch = undefined
  ) => {
    const repository = await getRepository(owner, repo);

    const [
      branchesResult,
      latestCommitResult,
      commitCountResult,
    ] = await Promise.allSettled([
      getBranches(owner, repo),
      getLatestCommit(owner, repo, branch),
      getCommitCount(owner, repo, branch),
    ]);

    const branches =
      branchesResult.status === "fulfilled"
        ? branchesResult.value
        : [];

    const latestCommit =
      latestCommitResult.status === "fulfilled"
        ? latestCommitResult.value
        : null;

    const commitCount =
      commitCountResult.status === "fulfilled"
        ? commitCountResult.value
        : 0;

    if (branchesResult.status === "rejected") {
      console.error(
        `[GitHub] Branches fallback for ${owner}/${repo}:`,
        branchesResult.reason?.message
      );
    }

    if (latestCommitResult.status === "rejected") {
      console.error(
        `[GitHub] Latest commit fallback for ${owner}/${repo}:`,
        latestCommitResult.reason?.message
      );
    }

    if (commitCountResult.status === "rejected") {
      console.error(
        `[GitHub] Commit count fallback for ${owner}/${repo}:`,
        commitCountResult.reason?.message
      );
    }

    return {
      repository,
      defaultBranch: repository.default_branch,
      branches,
      latestCommit,
      commitCount,
    };
  };