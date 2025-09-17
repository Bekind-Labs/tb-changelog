import { describe, expect, it } from "vitest";
import { buildGitCommit, buildTBStory } from "../testUtils/builders";
import { githubFormatExpected } from "./__fixtures__/github-format";
import { githubLightFormatExpected } from "./__fixtures__/github-light-format";
import { generateMarkdown, type MarkdownFormat, MarkdownFormats } from "./generate-markdown";

describe("generateMarkdown", () => {
  const expectedOutputs: Record<MarkdownFormat, { empty: string; full: string }> = {
    github: githubFormatExpected,
    "github-light": githubLightFormatExpected,
  };

  describe.each(MarkdownFormats)("format: %s", (format) => {
    const expected = expectedOutputs[format];

    it("handles empty data correctly", () => {
      const result = generateMarkdown({
        projectId: "90001111",
        acceptedStories: [],
        needsAttentionStories: [],
        notFinishedStories: [],
        chores: [],
        nonStoryCommits: [],
        totalCommits: 0,
        format,
      });

      expect(result).toBe(expected.empty);
    });

    it("handles full data correctly", () => {
      const result = generateMarkdown({
        projectId: "90001111",
        acceptedStories: [
          {
            ...buildTBStory({ id: "111", storyType: "Feature", title: "Feature story 1" }),
            commits: [
              buildGitCommit({ shortHash: "aaa111", message: "Feature commit 1" }),
              buildGitCommit({ shortHash: "aaa222", message: "Feature commit 2" }),
            ],
          },
          {
            ...buildTBStory({ id: "222", storyType: "Design", title: "Design story 1" }),
            commits: [buildGitCommit({ shortHash: "bbb111", message: "Design commit 1" })],
          },
        ],
        needsAttentionStories: [
          {
            ...buildTBStory({ id: "333", storyType: "Design", title: "Design story 2" }),
            commits: [buildGitCommit({ shortHash: "ccc111", message: "Design commit 2" })],
          },
        ],
        notFinishedStories: [
          {
            ...buildTBStory({ id: "444", storyType: "Bug", title: "Bug story 1" }),
            commits: [buildGitCommit({ shortHash: "ddd111", message: "Bug commit 1" })],
          },
        ],
        chores: [
          {
            ...buildTBStory({ id: "555", storyType: "Chore", status: "Accepted", title: "Chore story 1" }),
            commits: [buildGitCommit({ shortHash: "eee111", message: "Chore commit" })],
          },
          {
            ...buildTBStory({ id: "666", storyType: "Chore", status: "Started", title: "Chore story 2" }),
            commits: [buildGitCommit({ shortHash: "fff111", message: "Chore commit" })],
          },
        ],
        nonStoryCommits: [buildGitCommit({ shortHash: "ggg111", message: "Non-story commit" })],
        totalCommits: 8,
        format,
      });

      expect(result).toBe(expected.full);
    });
  });
});
