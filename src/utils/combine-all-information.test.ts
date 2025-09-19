import { describe, expect, it } from "vitest";
import { buildGitCommit, buildGitStory, buildTBStory } from "../testUtils/builders";
import { combineAllInformation } from "./combine-all-information";

describe("combineAllInformation", () => {
  it("returns empty results when no data provided", () => {
    const result = combineAllInformation([], [], [], []);

    expect(result.acceptedStories).toHaveLength(0);
    expect(result.needsAttentionStories).toHaveLength(0);
    expect(result.notFinishedStories).toHaveLength(0);
    expect(result.chores).toHaveLength(0);
    expect(result.nonStoryCommits).toHaveLength(0);
    expect(result.totalCommits).toBe(0);
  });

  describe("categorizes accepted stories correctly", () => {
    it("includes stories that are both accepted and finished", () => {
      const result = combineAllInformation(
        [],
        [
          buildGitStory({
            id: "123",
            commits: [buildGitCommit({ message: "Finished & Accepted" })],
            isFinished: true,
          }),
          buildGitStory({
            id: "456",
            commits: [buildGitCommit({ message: "Not Finished & Accepted" })],
            isFinished: false,
          }),
          buildGitStory({
            id: "789",
            commits: [buildGitCommit({ message: "Finished & Not Accepted" })],
            isFinished: true,
          }),
        ],
        [],
        [
          buildTBStory({ id: "123", storyType: "Feature", status: "Accepted" }),
          buildTBStory({ id: "456", storyType: "Feature", status: "Accepted" }),
          buildTBStory({ id: "789", storyType: "Feature", status: "Rejected" }),
        ],
      );

      expect(result.acceptedStories).toHaveLength(1);
      expect(result.acceptedStories[0]).toMatchObject({
        id: "123",
        storyType: "Feature",
        status: "Accepted",
        commits: [expect.objectContaining({ message: "Finished & Accepted" })],
      });
    });

    it("excludes chore type stories from accepted stories even when conditions match", () => {
      const result = combineAllInformation(
        [],
        [
          buildGitStory({
            id: "123",
            commits: [buildGitCommit({ message: "Finished & Accepted chore" })],
            isFinished: true,
          }),
        ],
        [],
        [buildTBStory({ id: "123", storyType: "Chore", status: "Accepted" })],
      );

      expect(result.acceptedStories).toHaveLength(0);
    });
  });

  describe("categorizes stories needing attention", () => {
    it("flags stories that are finished but not accepted", () => {
      const result = combineAllInformation(
        [],
        [
          buildGitStory({
            id: "123",
            commits: [buildGitCommit({ message: "Finished but not accepted" })],
            isFinished: true,
          }),
        ],
        [],
        [buildTBStory({ id: "123", storyType: "Feature", status: "Rejected" })],
      );

      expect(result.acceptedStories).toHaveLength(0);
      expect(result.needsAttentionStories).toHaveLength(1);
      expect(result.needsAttentionStories[0]).toMatchObject({
        id: "123",
        storyType: "Feature",
        status: "Rejected",
        commits: [expect.objectContaining({ message: "Finished but not accepted" })],
      });
    });

    it("flags stories that are accepted but not finished", () => {
      const result = combineAllInformation(
        [],
        [
          buildGitStory({
            id: "123",
            commits: [buildGitCommit({ message: "Not finished but accepted" })],
            isFinished: false,
          }),
        ],
        [],
        [
          buildTBStory({
            id: "123",
            storyType: "Feature",
            status: "Accepted",
          }),
        ],
      );

      expect(result.acceptedStories).toHaveLength(0);
      expect(result.needsAttentionStories).toHaveLength(1);
      expect(result.needsAttentionStories[0]).toMatchObject({
        id: "123",
        storyType: "Feature",
        status: "Accepted",
        commits: [expect.objectContaining({ message: "Not finished but accepted" })],
      });
    });
  });

  it("categorizes stories that are unfinished correctly", () => {
    const result = combineAllInformation(
      [],
      [
        buildGitStory({
          id: "123",
          commits: [buildGitCommit({ message: "Not finished & not accepted" })],
          isFinished: false,
        }),
      ],
      [],
      [buildTBStory({ id: "123", storyType: "Feature", status: "Rejected" })],
    );

    expect(result.acceptedStories).toHaveLength(0);
    expect(result.needsAttentionStories).toHaveLength(0);
    expect(result.notFinishedStories).toHaveLength(1);
    expect(result.notFinishedStories[0]).toMatchObject({
      id: "123",
      storyType: "Feature",
      status: "Rejected",
      commits: [expect.objectContaining({ message: "Not finished & not accepted" })],
    });
  });

  it("categorizes all chores regardless of status", () => {
    const result = combineAllInformation(
      [],
      [
        buildGitStory({ id: "111" }),
        buildGitStory({ id: "222" }),
        buildGitStory({ id: "333" }),
        buildGitStory({ id: "444" }),
        buildGitStory({ id: "555" }),
        buildGitStory({ id: "666" }),
        buildGitStory({ id: "777", isFinished: true }),
        buildGitStory({ id: "888" }),
        buildGitStory({ id: "999" }),
      ],
      [],
      [
        buildTBStory({ id: "111", storyType: "Feature", status: "Accepted" }),
        buildTBStory({ id: "222", storyType: "Design", status: "Accepted" }),
        buildTBStory({ id: "333", storyType: "Chore", status: "Started" }),
        buildTBStory({ id: "444", storyType: "Chore", status: "Finished" }),
        buildTBStory({ id: "555", storyType: "Chore", status: "Delivered" }),
        buildTBStory({ id: "666", storyType: "Chore", status: "Accepted" }),
        buildTBStory({ id: "777", storyType: "Chore", status: "Accepted" }),
        buildTBStory({ id: "888", storyType: "Chore", status: "Rejected" }),
        buildTBStory({ id: "999", storyType: "Bug", status: "Accepted" }),
      ],
    );

    expect(result.chores).toHaveLength(6);
    expect(result.chores.map((c) => c.id)).toEqual(["333", "444", "555", "666", "777", "888"]);
  });

  it("categorizes commits without story references", () => {
    const result = combineAllInformation(
      [],
      [buildGitStory({ id: "123", commits: [buildGitCommit({})] })],
      [
        buildGitCommit({ message: "Regular commit without story", hash: "hash2", shortHash: "hash2" }),
        buildGitCommit({ message: "Another non-story commit", hash: "hash3", shortHash: "hash3" }),
      ],
      [buildTBStory({ id: "123" })],
    );

    expect(result.nonStoryCommits).toHaveLength(2);
    expect(result.nonStoryCommits.map((c) => c.hash)).toEqual(["hash2", "hash3"]);
  });

  it("returns correct total commit count", () => {
    const result = combineAllInformation(Array(10).fill(buildGitStory({})), [], [], []);

    expect(result.totalCommits).toEqual(10);
  });
});
