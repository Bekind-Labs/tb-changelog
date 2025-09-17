import { describe, expect, it } from "vitest";
import { buildGitCommit, buildTBStory } from "../testUtils/builders";
import type { Story } from "../types";
import { generateMarkdown } from "./generate-markdown";

describe("generateMarkdown", () => {
  const stories: Story[] = [
    {
      ...buildTBStory({ id: "111", storyType: "Feature", title: "Feature story" }),
      commits: [buildGitCommit({ shortHash: "aaa", message: "Feature story commit" })],
    },
    {
      ...buildTBStory({ id: "222", storyType: "Design", title: "Design story" }),
      commits: [
        buildGitCommit({ shortHash: "bbb", message: "Design story commit 1" }),
        buildGitCommit({ shortHash: "ccc", message: "Design story commit 2" }),
      ],
    },
    {
      ...buildTBStory({ id: "333", storyType: "Bug", title: "Bug story" }),
      commits: [buildGitCommit({ shortHash: "ddd", message: "Bug story commit" })],
    },
  ];

  const build = (overrides: Partial<Parameters<typeof generateMarkdown>[0]>) => ({
    projectId: "",
    acceptedStories: [],
    needsAttentionStories: [],
    notFinishedStories: [],
    chores: [],
    nonStoryCommits: [],
    totalCommits: 0,
    ...overrides,
  });

  const sliceLinesFrom = (text: string, startLine: RegExp): string[] => {
    const lines = text.split("\n");
    const index = lines.findIndex((line) => line.match(startLine));
    return lines.slice(index);
  };

  const assertStoryList = (lines: string[]) => {
    expect(lines[0]).toEqual("#### 🧩 [Feature story](https://trackerboot.com/projects/999/stories/111)");
    expect(lines[1]).toEqual("- Feature story commit aaa");
    expect(lines[2]).toEqual("#### 🎨 [Design story](https://trackerboot.com/projects/999/stories/222)");
    expect(lines[3]).toEqual("- Design story commit 1 bbb");
    expect(lines[4]).toEqual("- Design story commit 2 ccc");
    expect(lines[5]).toEqual("#### 🦋 [Bug story](https://trackerboot.com/projects/999/stories/333)");
    expect(lines[6]).toEqual("- Bug story commit ddd");
  };

  it("starts with release stats section", () => {
    const result = generateMarkdown(
      build({
        acceptedStories: Array(1).fill({ ...buildTBStory(), commits: [] }),
        needsAttentionStories: Array(2).fill({ ...buildTBStory(), commits: [] }),
        notFinishedStories: Array(3).fill({ ...buildTBStory(), commits: [] }),
        chores: Array(4).fill({ ...buildTBStory(), commits: [] }),
        totalCommits: 999,
      }),
    );
    const lines = result.split("\n");

    expect(lines[0]).toEqual("> [!NOTE]");
    expect(lines[1]).toEqual("> 📦 999 commits included, ✅ 1 stories delivered,");
    expect(lines[2]).toEqual("> 🚨 2 stories need attention, 🚧 3 stories not finished, 🛠️ 4 chores included");
    expect(lines[3]).toEqual("");
  });

  describe("# Accepted Stories", () => {
    it("shows empty text when no stories are accepted", () => {
      const result = generateMarkdown(build({ acceptedStories: [] }));
      const lines = sliceLinesFrom(result, /^## ✅ Accepted Stories/);

      expect(lines[0]).toEqual("## ✅ Accepted Stories (0)");
      expect(lines[1]).toEqual("No stories.");
      expect(lines[2]).toEqual("");
      expect(lines[3]).toEqual("<br />");
    });

    it("shows story list when accepted stories exist", () => {
      const result = generateMarkdown(
        build({
          projectId: "999",
          acceptedStories: stories,
        }),
      );
      const lines = sliceLinesFrom(result, /^## ✅ Accepted Stories/);

      expect(lines[0]).toEqual("## ✅ Accepted Stories (3)");
      assertStoryList(lines.slice(1));
      expect(lines[8]).toEqual("");
      expect(lines[9]).toEqual("<br />");
    });
  });

  describe("# Needs Attention", () => {
    it("shows empty text when no needs-attention stories", () => {
      const result = generateMarkdown(build({ needsAttentionStories: [] }));
      const lines = sliceLinesFrom(result, /^## 🚨 Needs Attention/);

      expect(lines[0]).toEqual("## 🚨 Needs Attention (0)");
      expect(lines[1]).toEqual("No stories.");
      expect(lines[2]).toEqual("");
      expect(lines[3]).toEqual("<br />");
    });

    it("shows warning and story list when needs-attention stories exists", () => {
      const result = generateMarkdown(
        build({
          projectId: "999",
          needsAttentionStories: stories,
        }),
      );
      const lines = sliceLinesFrom(result, /^## 🚨 Needs Attention/);

      expect(lines[0]).toEqual("## 🚨 Needs Attention (3)");
      expect(lines[1]).toEqual("> [!WARNING]");
      expect(lines[2]).toEqual("> These stories show **mismatches**: finish commits and stort status do not align.  ");
      expect(lines[3]).toEqual("> Please review and resolve before release.");

      assertStoryList(lines.slice(4));

      expect(lines[11]).toEqual("");
      expect(lines[12]).toEqual("<br />");
    });
  });

  describe("# Not Finished Stories", () => {
    it("shows empty text when no not-finished stories", () => {
      const result = generateMarkdown(build({ notFinishedStories: [] }));
      const lines = sliceLinesFrom(result, /^## 🚧 Not Finished Stories/);

      expect(lines[0]).toEqual("## 🚧 Not Finished Stories (0)");
      expect(lines[1]).toEqual("No stories.");
      expect(lines[2]).toEqual("");
      expect(lines[3]).toEqual("<br />");
    });

    it("shows warning and story list when not-finished stories exists", () => {
      const result = generateMarkdown(
        build({
          projectId: "999",
          notFinishedStories: stories,
        }),
      );
      const lines = sliceLinesFrom(result, /^## 🚧 Not Finished Stories/);

      expect(lines[0]).toEqual("## 🚧 Not Finished Stories (3)");
      expect(lines[1]).toEqual("> [!CAUTION]");
      expect(lines[2]).toEqual("> These stories are **not completed**: no finish commit and not accepted.  ");
      expect(lines[3]).toEqual("> Please confirm whether they can be released as-is.");

      assertStoryList(lines.slice(4));

      expect(lines[11]).toEqual("");
      expect(lines[12]).toEqual("<br />");
    });
  });

  describe("# Chores", () => {
    it("shows empty text when no chores", () => {
      const result = generateMarkdown(build({ chores: [] }));
      const lines = sliceLinesFrom(result, /^## 🛠️ Chores/);

      expect(lines[0]).toEqual("## 🛠️ Chores (0)");
      expect(lines[1]).toEqual("No stories.");
      expect(lines[2]).toEqual("");
      expect(lines[3]).toEqual("<br />");
    });

    it("shows chore list when chores exists", () => {
      const result = generateMarkdown(
        build({
          projectId: "999",
          chores: [
            {
              ...buildTBStory({
                id: "111",
                storyType: "Chore",
                status: "Accepted",
                title: "Chore story 1",
              }),
              commits: [buildGitCommit({ shortHash: "aaa", message: "Chore commit 1" })],
            },
            {
              ...buildTBStory({
                id: "222",
                storyType: "Chore",
                status: "Started",
                title: "Chore story 2",
              }),
              commits: [buildGitCommit({ shortHash: "bbb", message: "Chore commit 2" })],
            },
          ],
        }),
      );
      const lines = sliceLinesFrom(result, /^## 🛠️ Chores/);

      expect(lines[0]).toEqual("## 🛠️ Chores (2)");
      expect(lines[1]).toEqual("#### [Chore story 1](https://trackerboot.com/projects/999/stories/111)");
      expect(lines[2]).toEqual("- Chore commit 1 aaa");
      expect(lines[3]).toEqual("#### [Chore story 2](https://trackerboot.com/projects/999/stories/222) (Not finished)");
      expect(lines[4]).toEqual("- Chore commit 2 bbb");
      expect(lines[5]).toEqual("");
      expect(lines[6]).toEqual("<br />");
    });
  });

  describe("# Non-story Commits", () => {
    it("shows empty text when no commits", () => {
      const result = generateMarkdown(build({ nonStoryCommits: [] }));
      const lines = sliceLinesFrom(result, /^## 🔍 Non-story Commits/);

      expect(lines).toHaveLength(2);

      expect(lines[0]).toEqual("## 🔍 Non-story Commits (0)");
      expect(lines[1]).toEqual("No commits.");
    });

    it("shows commit list when non-story commits exists", () => {
      const result = generateMarkdown(
        build({
          projectId: "999",
          nonStoryCommits: [
            buildGitCommit({ shortHash: "aaa", message: "Commit 1" }),
            buildGitCommit({ shortHash: "bbb", message: "Commit 2" }),
          ],
        }),
      );
      const lines = sliceLinesFrom(result, /^## 🔍 Non-story Commits/);

      expect(lines).toHaveLength(3);

      expect(lines[0]).toEqual("## 🔍 Non-story Commits (2)");
      expect(lines[1]).toEqual("- Commit 1 aaa");
      expect(lines[2]).toEqual("- Commit 2 bbb");
    });
  });
});
