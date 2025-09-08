import { describe, expect, it } from "vitest";
import { buildGitCommit } from "../testUtils/builders";
import { extractGitCommits } from "./extract-git-commits";

describe("extractGitCommits", () => {
  it("handles empty commit list", () => {
    const result = extractGitCommits([]);

    expect(result.gitStories).toEqual([]);
    expect(result.nonStoryCommits).toEqual([]);
  });

  it("groups commits by story ID", () => {
    const commits = [
      buildGitCommit({ hash: "hash1", message: "[#123] First story work" }),
      buildGitCommit({ hash: "hash2", message: "[#123, #456] work on multiple stories" }),
      buildGitCommit({ hash: "hash3", message: "[#456] Second story only" }),
      buildGitCommit({ hash: "hash4", message: "[wip #123, #456] Has keywords in message" }),
      buildGitCommit({ hash: "hash5", message: "[abc] No story commit" }),
    ];

    const result = extractGitCommits(commits);

    expect(result.gitStories).toHaveLength(2);

    const story123 = result.gitStories.find((s) => s.id === "123");
    const story456 = result.gitStories.find((s) => s.id === "456");

    expect(story123?.commits).toHaveLength(3);
    expect(story123?.commits.map((c) => c.hash)).toEqual(["hash1", "hash2", "hash4"]);

    expect(story456?.commits).toHaveLength(3);
    expect(story456?.commits.map((c) => c.hash)).toEqual(["hash2", "hash3", "hash4"]);
  });

  it("correctly categorizes commits without story IDs", () => {
    const commits = [
      buildGitCommit({ hash: "hash1", message: "[#123] Story commit" }),
      buildGitCommit({ hash: "hash2", message: "Regular commit 1" }),
      buildGitCommit({ hash: "hash3", message: "[#456] Another story" }),
      buildGitCommit({ hash: "hash4", message: "[abc] Regular commit 2" }),
    ];

    const result = extractGitCommits(commits);

    expect(result.nonStoryCommits).toHaveLength(2);
    expect(result.nonStoryCommits.map((c) => c.hash)).toEqual(["hash2", "hash4"]);
  });

  it("marks story as finished when any commit contains keywords", () => {
    const commits = [
      buildGitCommit({ hash: "hash1", message: "[finish #111] Finished story 1" }),
      buildGitCommit({ hash: "hash2", message: "[finishes #222] Finished story 2" }),
      buildGitCommit({ hash: "hash3", message: "[finished #333] Finished story 3" }),
      buildGitCommit({ hash: "hash4", message: "[wip #444] Not finished story" }),
      buildGitCommit({ hash: "hash5", message: "[fix #555] Finished story" }),
      buildGitCommit({ hash: "hash6", message: "[fixes #666] Finished story" }),
      buildGitCommit({ hash: "hash7", message: "[fixed #777] Finished story" }),
      buildGitCommit({ hash: "hash8", message: "[#888] Not finished story" }),
    ];

    const result = extractGitCommits(commits);

    expect(result.gitStories).toHaveLength(8);

    expect(result.gitStories[0]).toMatchObject({ id: "111", isFinished: true });
    expect(result.gitStories[1]).toMatchObject({ id: "222", isFinished: true });
    expect(result.gitStories[2]).toMatchObject({ id: "333", isFinished: true });
    expect(result.gitStories[3]).toMatchObject({ id: "444", isFinished: false });
    expect(result.gitStories[4]).toMatchObject({ id: "555", isFinished: true });
    expect(result.gitStories[5]).toMatchObject({ id: "666", isFinished: true });
    expect(result.gitStories[6]).toMatchObject({ id: "777", isFinished: true });
    expect(result.gitStories[7]).toMatchObject({ id: "888", isFinished: false });
  });
});
