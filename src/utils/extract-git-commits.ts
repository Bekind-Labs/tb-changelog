import type { GitCommit, GitStory } from "../types";

export const extractGitCommits = (
  commits: GitCommit[],
): {
  gitStories: GitStory[];
  nonStoryCommits: GitCommit[];
} => {
  const gitStoryMap = new Map<string, GitStory>();
  const nonStoryCommits: GitCommit[] = [];

  for (const commit of commits) {
    const { isFinished, stories } = parseBracketContent(commit.message);

    if (stories.length === 0) {
      nonStoryCommits.push(commit);
      continue;
    }

    for (const storyId of stories) {
      const existing = gitStoryMap.get(storyId);
      if (existing) {
        existing.commits.push(commit);
        existing.isFinished = existing.isFinished || isFinished;
      } else {
        gitStoryMap.set(storyId, {
          id: storyId,
          commits: [commit],
          isFinished,
        });
      }
    }
  }

  return {
    gitStories: Array.from(gitStoryMap.values()),
    nonStoryCommits,
  };
};

const parseBracketContent = (message: string): { isFinished: boolean; stories: string[] } => {
  const match = message.match(/^\[([^\]]+)]/);
  if (!match) return { isFinished: false, stories: [] };

  const content = match[1];
  const isFinished = /\b(finish(es|ed)?|fix(es|ed)?)\s+#/i.test(content);
  const stories = Array.from(content.matchAll(/#(\d+)/g), (m) => m[1]);

  return { isFinished, stories };
};
