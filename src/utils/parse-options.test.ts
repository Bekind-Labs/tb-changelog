import { beforeEach, describe, expect, it, vi } from "vitest";
import { parseOptions } from "./parse-options";

vi.mock("../../package.json", () => ({
  default: {
    version: "1.2.3",
  },
}));

describe("parseOptions", () => {
  describe("help mode", () => {
    it.each([["--help"], ["-h"]])("returns only help flag when %s is provided", (arg) => {
      const result = parseOptions([arg]);
      expect(result).toEqual({ help: true });
    });
  });

  describe("required parameters", () => {
    describe("validation errors", () => {
      it.each([
        {
          name: "TB_API_KEY from environment",
          args: ["--from", "v1.0.0", "--tb-project-id", "123456"],
          env: {},
          error: "TB_API_KEY environment variable is required",
        },
        {
          name: "--from option",
          args: ["--tb-project-id", "123456"],
          env: { TB_API_KEY: "test-key" },
          error: "--from option is required",
        },
        {
          name: "tb-project-id from either CLI or environment",
          args: ["--from", "v1.0.0"],
          env: { TB_API_KEY: "test-key" },
          error: "tb-project-id is required (use --tb-project-id or set TB_PROJECT_ID)",
        },
      ])("requires $name", ({ args, env, error }) => {
        for (const [key, value] of Object.entries(env)) {
          vi.stubEnv(key, value);
        }
        expect(() => parseOptions(args)).toThrow(error);
      });
    });

    describe("tb-project-id resolution", () => {
      beforeEach(() => {
        vi.stubEnv("TB_API_KEY", "test-key");
      });

      it("uses TB_PROJECT_ID from environment when CLI option not provided", () => {
        vi.stubEnv("TB_PROJECT_ID", "env-project-id");
        const result = parseOptions(["--from", "v1.0.0"]);
        expect(result).toMatchObject({ tbProjectId: "env-project-id" });
      });

      it("prefers CLI --tb-project-id over environment TB_PROJECT_ID", () => {
        vi.stubEnv("TB_PROJECT_ID", "env-project-id");
        const result = parseOptions(["--from", "v1.0.0", "--tb-project-id", "cli-project-id"]);
        expect(result).toMatchObject({ tbProjectId: "cli-project-id" });
      });
    });
  });

  describe("optional parameters", () => {
    beforeEach(() => {
      vi.stubEnv("TB_API_KEY", "test-key");
    });

    const baseArgs = ["--from", "v1.0.0", "--tb-project-id", "123456"];

    describe("default values", () => {
      it.each([
        { param: "to", defaultValue: "HEAD" },
        { param: "format", defaultValue: "github" },
        { param: "output", defaultValue: undefined },
        { param: "signature", defaultValue: true },
      ])("defaults $param to $defaultValue when not specified", ({ param, defaultValue }) => {
        const result = parseOptions(baseArgs);
        expect(result).toMatchObject({ [param]: defaultValue });
      });
    });

    describe("custom values", () => {
      it.each([
        {
          name: "--to option",
          args: [...baseArgs, "--to", "v2.0.0"],
          expected: { to: "v2.0.0" },
        },
        {
          name: "--output with long form",
          args: [...baseArgs, "--output", "changelog.md"],
          expected: { output: "changelog.md" },
        },
        {
          name: "--output with short form",
          args: [...baseArgs, "-o", "out.md"],
          expected: { output: "out.md" },
        },
        {
          name: "--format github-light with long form",
          args: [...baseArgs, "--format", "github-light"],
          expected: { format: "github-light" },
        },
        {
          name: "--format github-light with short form",
          args: [...baseArgs, "-f", "github-light"],
          expected: { format: "github-light" },
        },
        {
          name: "--no-signature option",
          args: [...baseArgs, "--no-signature"],
          expected: { signature: false },
        },
      ])("accepts $name", ({ args, expected }) => {
        const result = parseOptions(args);
        expect(result).toMatchObject(expected);
      });
    });

    describe("validation", () => {
      it.each([
        {
          name: "invalid format",
          args: [...baseArgs, "--format", "invalid"],
          error: "Invalid format: invalid. Valid options are: github, github-light",
        },
        {
          name: "unknown options",
          args: ["--unknown", "value", ...baseArgs],
          error: "Unknown option '--unknown'",
        },
      ])("rejects $name", ({ args, error }) => {
        expect(() => parseOptions(args)).toThrowError(error);
      });
    });
  });

  describe("complete configuration", () => {
    it("builds full configuration with all options", () => {
      vi.stubEnv("TB_API_KEY", "test-key");

      const result = parseOptions([
        "--from",
        "v1.0.0",
        "--to",
        "v2.0.0",
        "--tb-project-id",
        "123456",
        "--output",
        "./changelog.md",
        "--format",
        "github-light",
      ]);

      expect(result).toEqual({
        apiKey: "test-key",
        from: "v1.0.0",
        to: "v2.0.0",
        tbProjectId: "123456",
        output: "./changelog.md",
        format: "github-light",
        help: false,
        version: "1.2.3",
        signature: true,
      });
    });
  });
});
