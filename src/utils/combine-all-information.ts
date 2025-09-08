import type { GitCommit, GitStory, Story, TBStory } from "../types";

type ReleaseInfo = {
  acceptedStories: Story[];
  needsAttentionStories: Story[];
  notFinishedStories: Story[];
  chores: Story[];
  nonStoryCommits: GitCommit[];
};
export function combineAllInformation(
  storiesWithCommits: GitStory[],
  nonStoryCommits: GitCommit[],
  tbStories: TBStory[],
): ReleaseInfo {
  const storyInfoMap = new Map(tbStories.map((story) => [story.id, story]));

  const acceptedStories: Story[] = [];
  const needsAttentionStories: Story[] = [];
  const notFinishedStories: Story[] = [];
  const chores: Story[] = [];

  for (const gitStory of storiesWithCommits) {
    const tbStory = storyInfoMap.get(gitStory.id);

    if (!tbStory) {
      nonStoryCommits.push(...gitStory.commits);
      continue;
    }

    const story: Story = {
      ...tbStory,
      commits: gitStory.commits,
    };

    if (tbStory.storyType === "Chore") {
      chores.push(story);
    } else if (tbStory.status === "Accepted" && gitStory.isFinished) {
      acceptedStories.push(story);
    } else if (tbStory.status === "Accepted" || gitStory.isFinished) {
      needsAttentionStories.push(story);
    } else {
      notFinishedStories.push(story);
    }
  }

  return {
    acceptedStories,
    needsAttentionStories,
    notFinishedStories,
    chores,
    nonStoryCommits,
  };
}
