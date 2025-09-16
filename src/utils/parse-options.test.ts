import { describe, expect, it, vi } from "vitest";
import { parseOptions } from "./parse-options";

vi.mock("../../package.json", () => ({
  default: {
    version: "1.2.3",
  },
}));

describe("parseOptions", () => {
  it.each(["--help", "-h"])("returns help flag only when %s is provided", (arg) => {
    const result = parseOptions([arg]);
    expect(result).toEqual({ help: true });
  });

  describe("validates required inputs", () => {
    it("throws error when --tb-project-id option and TB_PROJECT_ID environment variable are both missing", () => {
      vi.stubEnv("TB_API_KEY", "test-key");

      expect(() => parseOptions(["--from", "v1.0.0"])).toThrow(
        "tb-project-id is required (use --tb-project-id or set TB_PROJECT_ID)",
      );
    });

    it("throws error when TB_API_KEY environment variable is missing", () => {
      expect(() => parseOptions(["--from", "v1.0.0", "--tb-project-id", "123456"])).toThrow(
        "TB_API_KEY environment variable is required",
      );
    });

    it("throws error when --from option is missing", () => {
      vi.stubEnv("TB_API_KEY", "test-key");

      expect(() => parseOptions(["--tb-project-id", "123456"])).toThrow("--from option is required");
    });

    it("throws error when unknown options are provided", () => {
      vi.stubEnv("TB_API_KEY", "test-key");

      expect(() => parseOptions(["--unknown", "value", "--from", "v1.0.0", "--tb-project-id", "123456"])).toThrow(
        "Unknown option '--unknown'",
      );
    });
  });

  describe("environment variable support", () => {
    it("uses TB_PROJECT_ID from environment variables when the argument is not provided", () => {
      vi.stubEnv("TB_API_KEY", "test-key");
      vi.stubEnv("TB_PROJECT_ID", "888888");

      const result = parseOptions(["--from", "v1.0.0"]);

      expect(result).toMatchObject({
        tbProjectId: "888888",
        apiKey: "test-key",
        from: "v1.0.0",
      });
    });

    it("CLI arguments override environment variables", () => {
      vi.stubEnv("TB_API_KEY", "test-key");
      vi.stubEnv("TB_PROJECT_ID", "999999");

      const result = parseOptions(["--from", "v1.0.0", "--tb-project-id", "123456"]);

      expect(result).toMatchObject({
        tbProjectId: "123456",
      });
    });
  });

  describe("parses and builds configuration object", () => {
    it("applies default values for optional parameters", () => {
      vi.stubEnv("TB_API_KEY", "test-key");

      const result = parseOptions(["--from", "v1.0.0", "--tb-project-id", "123456"]);

      expect(result).toMatchObject({
        to: "HEAD",
        help: false,
        output: undefined,
      });
    });

    it("includes version from package.json", () => {
      vi.stubEnv("TB_API_KEY", "test-key");

      const result = parseOptions(["--from", "v1.0.0", "--tb-project-id", "123456"]);

      expect(result).toMatchObject({
        version: "1.2.3",
      });
    });

    it("combines all provided options with environment variables", () => {
      vi.stubEnv("TB_API_KEY", "test-key");

      const result = parseOptions([
        "--from",
        "v1.0.0",
        "--to",
        "v2.0.0",
        "--tb-project-id",
        "123456",
        "--output",
        "./path/to/file.md",
      ]);

      expect(result).toEqual({
        apiKey: "test-key",
        from: "v1.0.0",
        to: "v2.0.0",
        tbProjectId: "123456",
        help: false,
        output: "./path/to/file.md",
        version: "1.2.3",
      } satisfies Required<ReturnType<typeof parseOptions>>);
    });
  });
});
