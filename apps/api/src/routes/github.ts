import { Hono } from "hono";
import * as githubService from "../services/github.service";
import { assertRepo, assertSha, assertUsername, parsePage, parsePerPage } from "../lib/validation";

export const githubRoutes = new Hono<{ Bindings: Env }>();

githubRoutes.get("/users/:username", async (c) => {
  const username = assertUsername(c.req.param("username"));
  const dto = await githubService.getUser(username, c.env);
  return c.json(dto);
});

githubRoutes.get("/users/:username/stats", async (c) => {
  const username = assertUsername(c.req.param("username"));
  const dto = await githubService.getUserStats(username, c.env);
  return c.json(dto);
});

githubRoutes.get("/users/:username/repos", async (c) => {
  const username = assertUsername(c.req.param("username"));
  const page = parsePage(c.req.query("page"));
  const perPage = parsePerPage(c.req.query("perPage"));
  const dto = await githubService.getRepositories(username, page, perPage, c.env);
  return c.json(dto);
});

githubRoutes.get("/repos/:owner/:repo", async (c) => {
  const owner = assertUsername(c.req.param("owner"), "owner");
  const repo = assertRepo(c.req.param("repo"));
  const authorParam = c.req.query("author");
  const author = authorParam !== undefined ? assertUsername(authorParam, "author") : undefined;
  const dto = await githubService.getRepository(owner, repo, author, c.env);
  return c.json(dto);
});

githubRoutes.get("/repos/:owner/:repo/commits", async (c) => {
  const owner = assertUsername(c.req.param("owner"), "owner");
  const repo = assertRepo(c.req.param("repo"));
  const page = parsePage(c.req.query("page"));
  const perPage = parsePerPage(c.req.query("perPage"));
  const authorParam = c.req.query("author");
  const author = authorParam !== undefined ? assertUsername(authorParam, "author") : undefined;
  const dto = await githubService.getCommits(owner, repo, page, perPage, author, c.env);
  return c.json(dto);
});

githubRoutes.get("/repos/:owner/:repo/commits/:sha", async (c) => {
  const owner = assertUsername(c.req.param("owner"), "owner");
  const repo = assertRepo(c.req.param("repo"));
  const sha = assertSha(c.req.param("sha"));
  const dto = await githubService.getCommitDetail(owner, repo, sha, c.env);
  return c.json(dto);
});
