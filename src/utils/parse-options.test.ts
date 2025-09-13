import { describe, expect, it, vi } from "vitest";
import { parseOptions } from "./parse-options";

describe("parseOptions", () => {
  it.each(["--help", "-h"])("returns help flag only when %s is provided", (arg) => {
    const result = parseOptions([arg]);
    expect(result).toEqual({ help: true });
  });

  describe("validates required inputs", () => {
    it("throws error when --github-repo option and TB_GITHUB_REPO environment variable are both missing", () => {
      vi.stubEnv("TB_API_KEY", "test-key");

      expect(() => parseOptions(["--from", "v1.0.0", "--tb-project-id", "123456"])).toThrow(
        "github-repo is required (use --github-repo or set TB_GITHUB_REPO)",
      );
    });

    it("throws error when --tb-project-id option and TB_PROJECT_ID environment variable are both missing", () => {
      vi.stubEnv("TB_API_KEY", "test-key");

      expect(() => parseOptions(["--from", "v1.0.0", "--github-repo", "https://github.com/test/repo"])).toThrow(
        "tb-project-id is required (use --tb-project-id or set TB_PROJECT_ID)",
      );
    });

    it("throws error when TB_API_KEY environment variable is missing", () => {
      expect(() =>
        parseOptions([
          "--from",
          "v1.0.0",
          "--github-repo",
          "https://github.com/test/repo",
          "--tb-project-id",
          "123456",
        ]),
      ).toThrow("TB_API_KEY environment variable is required");
    });

    it("throws error when --from option is missing", () => {
      vi.stubEnv("TB_API_KEY", "test-key");

      expect(() =>
        parseOptions(["--github-repo", "https://github.com/test/repo", "--tb-project-id", "123456"]),
      ).toThrow("--from option is required");
    });

    it("throws error when unknown options are provided", () => {
      vi.stubEnv("TB_API_KEY", "test-key");

      expect(() =>
        parseOptions([
          "--unknown",
          "value",
          "--from",
          "v1.0.0",
          "--github-repo",
          "https://github.com/test/repo",
          "--tb-project-id",
          "123456",
        ]),
      ).toThrow("Unknown option '--unknown'");
    });
  });

  describe("environment variable support", () => {
    it("uses both TB_GITHUB_REPO and TB_PROJECT_ID from environment variables when arguments are not provided", () => {
      vi.stubEnv("TB_API_KEY", "test-key");
      vi.stubEnv("TB_GITHUB_REPO", "https://github.com/env/repo");
      vi.stubEnv("TB_PROJECT_ID", "888888");

      const result = parseOptions(["--from", "v1.0.0"]);

      expect(result).toMatchObject({
        githubRepo: "https://github.com/env/repo",
        tbProjectId: "888888",
        apiKey: "test-key",
        from: "v1.0.0",
      });
    });

    it("CLI arguments override environment variables", () => {
      vi.stubEnv("TB_API_KEY", "test-key");
      vi.stubEnv("TB_GITHUB_REPO", "https://github.com/env/repo");
      vi.stubEnv("TB_PROJECT_ID", "999999");

      const result = parseOptions([
        "--from",
        "v1.0.0",
        "--github-repo",
        "https://github.com/cli/repo",
        "--tb-project-id",
        "123456",
      ]);

      expect(result).toMatchObject({
        githubRepo: "https://github.com/cli/repo",
        tbProjectId: "123456",
      });
    });
  });

  describe("parses and builds configuration object", () => {
    it("applies default values for optional parameters", () => {
      vi.stubEnv("TB_API_KEY", "test-key");

      const result = parseOptions([
        "--from",
        "v1.0.0",
        "--github-repo",
        "https://github.com/test/repo",
        "--tb-project-id",
        "123456",
      ]);

      expect(result).toMatchObject({
        to: "HEAD",
        help: false,
        output: undefined,
      });
    });

    it("combines all provided options with environment variables", () => {
      vi.stubEnv("TB_API_KEY", "test-key");

      const result = parseOptions([
        "--from",
        "v1.0.0",
        "--to",
        "v2.0.0",
        "--github-repo",
        "https://github.com/test/repo",
        "--tb-project-id",
        "123456",
        "--output",
        "./path/to/file.md",
      ]);

      expect(result).toEqual({
        apiKey: "test-key",
        from: "v1.0.0",
        to: "v2.0.0",
        githubRepo: "https://github.com/test/repo",
        tbProjectId: "123456",
        help: false,
        output: "./path/to/file.md",
      } satisfies Required<ReturnType<typeof parseOptions>>);
    });
  });
});
