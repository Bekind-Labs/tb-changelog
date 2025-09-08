import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli.ts"],
  format: ["esm"],
  shims: true,
  clean: true,
  dts: false,
  sourcemap: false,
  minify: process.env.DEBUG !== "true",
  target: "node22",
  splitting: false,
  treeshake: true,
});
