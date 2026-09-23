import type { ErrorResponse } from "@commit-quest/types";
import { Hono } from "hono";
import { githubRoutes } from "./routes/github";
import { AppError } from "./lib/errors";

export const app = new Hono<{ Bindings: Env }>();

app.route("/api/github", githubRoutes);

app.notFound((c) => {
  const body: ErrorResponse = {
    error: { code: "GITHUB_NOT_FOUND", message: "The requested API endpoint does not exist." },
  };
  return c.json(body, 404);
});

app.onError((err, c) => {
  if (err instanceof AppError) {
    const body: ErrorResponse = { error: { code: err.code, message: err.message } };
    return c.json(body, err.status);
  }
  console.error(err);
  const body: ErrorResponse = {
    error: { code: "INTERNAL_ERROR", message: "Internal server error." },
  };
  return c.json(body, 500);
});
