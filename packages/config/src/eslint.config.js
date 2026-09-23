// @ts-check
import js from "@eslint/js";
import tseslint from "typescript-eslint";

/** Base flat ESLint config shared by all packages. */
export const base = tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ["dist/**", "node_modules/**", ".turbo/**", ".wrangler/**"],
  },
);
