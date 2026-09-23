export {};

// `wrangler types` only knows about bindings declared in wrangler.jsonc
// (ASSETS). GITHUB_TOKEN is a Worker secret (see .dev.vars.example /
// `wrangler secret put`), so it is declared here and merged into the
// generated global `Env` interface via declaration merging.
declare global {
  interface Env {
    GITHUB_TOKEN?: string;
  }
}
