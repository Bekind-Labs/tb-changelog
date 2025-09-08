import { writeFile } from "node:fs/promises";
import consola from "consola";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { main } from "./main";
import { fetchStoriesFromApi } from "./repositories/fetch-stories-from-api";
import { getCommits } from "./repositories/get-commits";
import { buildGitCommit, buildTBStory } from "./testUtils/builders";

vi.mock("consola");
vi.mock("node:fs/promises");
vi.mock("./repositories/get-commits");
vi.mock("./repositories/fetch-stories-from-api");

describe("main", () => {
  beforeEach(() => {
    vi.stubGlobal("console", { log: vi.fn() });
    vi.stubGlobal("process", { exit: vi.fn(), env: process.env });

    vi.mocked(getCommits).mockResolvedValue([
      buildGitCommit({ hash: "aaa", message: "[finishes #111] Commit 1" }),
      buildGitCommit({ hash: "bbb", message: "[fixed #222] Commit 2" }),
      buildGitCommit({ hash: "ccc", message: "[#333] Commit 3" }),
      buildGitCommit({ hash: "ddd", message: "[#444] Commit 4" }),
      buildGitCommit({ hash: "eee", message: "Commit 5" }),
    ]);
    vi.mocked(fetchStoriesFromApi).mockResolvedValue([
      buildTBStory({ id: "111", storyType: "Feature", status: "Accepted", title: "Feature 1" }),
      buildTBStory({ id: "222", storyType: "Feature", status: "Rejected", title: "Feature 2" }),
      buildTBStory({ id: "333", storyType: "Feature", status: "Started", title: "Feature 3" }),
      buildTBStory({ id: "444", storyType: "Chore", status: "Accepted", title: "Chore" }),
    ]);
  });

  it("displays help information when requested", () => {
    main(["--help"]);

    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining("Usage: tb-changelog [options]"));
    expect(process.exit).toHaveBeenCalledWith(0);
  });

  describe("terminates with error when validation fails", () => {
    it.each([
      {
        args: ["--github-repo", "https://github.com/test/repo", "--tb-project-id", "123456"],
        expected: "--from option is required",
      },
      {
        args: ["--from", "v1.0.0", "--tb-project-id", "123456"],
        expected: "--github-repo option is required",
      },
      {
        args: ["--from", "v1.0.0", "--github-repo", "https://github.com/test/repo"],
        expected: "--tb-project-id option is required",
      },
      {
        args: ["--from", "v1.0.0", "--github-repo", "https://github.com/test/repo", "--tb-project-id", "123456"],
        expected: "TB_API_KEY environment variable is required",
      },
    ])("exits with code 1 ($expected)", ({ args, expected }) => {
      main(args);

      expect(consola.error).toHaveBeenCalledWith(expected);
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  it("executes changelog generation when inputs are valid", () => {
    vi.stubEnv("TB_API_KEY", "test-key");
    main(["--from", "v1.0.0", "--github-repo", "https://github.com/test/repo", "--tb-project-id", "123456"]);

    expect(consola.log).toHaveBeenCalledWith("tb-changelog v0.1.0");
    expect(consola.info).toHaveBeenCalledWith("Generating changelog: v1.0.0 → HEAD");
    expect(process.exit).not.toHaveBeenCalled();
  });

  describe("outputs markdown content based on configuration", () => {
    beforeEach(async () => {
      vi.stubEnv("TB_API_KEY", "test-key");
    });

    it("outputs to console(stdout) when no output file is specified", async () => {
      await main(["--from", "v1.0.0", "--github-repo", "https://github.com/test/repo", "--tb-project-id", "123456"]);

      expect(consola.success).toHaveBeenCalledWith({ badge: true, message: "📦 Changelog generated successfully." });
      expect(console.log).toHaveBeenCalledTimes(1);
      expect(writeFile).not.toHaveBeenCalled();

      const actualOutput = vi.mocked(console.log).mock.lastCall![0];

      expect(actualOutput).toContain("## ✅ Accepted Stories (1)");
      expect(actualOutput).toContain("## 🚨 Needs Attention (1)");
      expect(actualOutput).toContain("## 🚧 Not Finished Stories (1)");
      expect(actualOutput).toContain("## 🛠️ Chores (1)");
      expect(actualOutput).toContain("## 🔍 Non-story Commits (1)");
    });

    it("saves to file when output path is provided with --output option", async () => {
      await main([
        "--from",
        "v1.0.0",
        "--github-repo",
        "https://github.com/test/repo",
        "--tb-project-id",
        "123456",
        "--output",
        "./docs/CHANGELOG.md",
      ]);

      expect(consola.success).toHaveBeenCalledWith({
        badge: true,
        message: "📦 Changelog written to: ./docs/CHANGELOG.md",
      });
      expect(console.log).not.toHaveBeenCalled();
      expect(writeFile).toHaveBeenCalledTimes(1);
      expect(writeFile).toHaveBeenCalledWith("./docs/CHANGELOG.md", expect.any(String), "utf-8");

      const actualOutput = vi.mocked(writeFile).mock.lastCall![1];

      expect(actualOutput).toContain("## ✅ Accepted Stories (1)");
      expect(actualOutput).toContain("## 🚨 Needs Attention (1)");
      expect(actualOutput).toContain("## 🚧 Not Finished Stories (1)");
      expect(actualOutput).toContain("## 🛠️ Chores (1)");
      expect(actualOutput).toContain("## 🔍 Non-story Commits (1)");
    });
  });
});
