import type { GitCommit, GitStory, TBStory } from "../types";

export const buildGitCommit = (overrides: Partial<GitCommit>): GitCommit => ({
  hash: "",
  shortHash: "",
  message: "",
  date: new Date(),
  ...overrides,
});

export const buildTBStory = (overrides: Partial<TBStory> = {}): TBStory => ({
  id: "",
  title: "",
  storyType: "Feature",
  status: "Started",
  ...overrides,
});

export const buildGitStory = (overrides: Partial<GitStory> = {}): GitStory => ({
  id: "",
  commits: [],
  isFinished: false,
  ...overrides,
});
