import { describe, expect, it, vi } from "vitest";
import { parseOptions } from "./parse-options";

describe("parseOptions", () => {
  it.each(["--help", "-h"])("returns help flag only when %s is provided", (arg) => {
    const result = parseOptions([arg]);
    expect(result).toEqual({ help: true });
  });

  describe("validates required inputs", () => {
    it("throws error when --github-repo option is missing", () => {
      vi.stubEnv("TB_API_KEY", "test-key");

      expect(() => parseOptions(["--from", "v1.0.0", "--tb-project-id", "123456"])).toThrow(
        "--github-repo option is required",
      );
    });

    it("throws error when --tb-project-id option is missing", () => {
      vi.stubEnv("TB_API_KEY", "test-key");

      expect(() => parseOptions(["--from", "v1.0.0", "--github-repo", "https://github.com/test/repo"])).toThrow(
        "--tb-project-id option is required",
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
