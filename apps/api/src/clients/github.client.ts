const GITHUB_API_BASE = "https://api.github.com";

/**
 * Thin fetch wrapper around the GitHub REST API. Always sets the headers
 * GitHub requires from server-side/Workers clients (no default User-Agent
 * is sent by the Workers runtime's fetch, and GitHub rejects requests
 * without one).
 */
export function githubFetch(path: string, env: Env): Promise<Response> {
  const headers: Record<string, string> = {
    "User-Agent": "commit-quest",
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;
  }
  return fetch(`${GITHUB_API_BASE}${path}`, { headers });
}
