// Handle common GitHub API errors and return meaningful messages
function handleGitHubError(response) {
  if (response.status === 404) {
    throw new Error("Repository not found. Please check the URL.");
  }

  if (response.status === 403) {
    throw new Error("GitHub API rate limit exceeded. Please try again later.");
  }

  if (response.status === 401) {
    throw new Error("Unable to access this repository.");
  }

  throw new Error("GitHub API is unavailable. Please try again.");
}

export async function getRepoDetails(owner, repoName) {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repoName}`,
  );

  if (!response.ok) {
    handleGitHubError(response);
  }

  const data = await response.json();

  return {
    owner: data.owner.login,
    repoName: data.name,
    description: data.description,
    language: data.language,
    stars: data.stargazers_count,
    defaultBranch: data.default_branch,
  };
}

export async function getRepoTree(owner, repoName, branch) {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repoName}/git/trees/${branch}?recursive=1`,
  );

  if (!response.ok) {
    handleGitHubError(response);
  }

  const data = await response.json();

  return data.tree;
}
