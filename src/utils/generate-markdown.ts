import type { GitCommit, Story } from "../types";

const SPACER = "<br />";

export const generateMarkdown = (args: {
  projectId: string;
  acceptedStories: Story[];
  needsAttentionStories: Story[];
  notFinishedStories: Story[];
  chores: Story[];
  nonStoryCommits: GitCommit[];
  totalCommits: number;
}): string => {
  return `
> [!NOTE]
> 📦 ${args.totalCommits} commits included, ✅ ${args.acceptedStories.length} stories delivered,
> 🚨 ${args.needsAttentionStories.length} stories need attention, 🚧 ${args.notFinishedStories.length} stories not finished, 🛠️ ${args.chores.length} chores included

## ✅ Accepted Stories (${args.acceptedStories.length})
${generateFromStories(args.projectId, args.acceptedStories)}

${SPACER}

## 🚨 Needs Attention (${args.needsAttentionStories.length})
${generateFromStories(
  args.projectId,
  args.needsAttentionStories,
  `
> [!WARNING]
> These stories show **mismatches**: finish commits and stort status do not align.  
> Please review and resolve before release.
`.trim(),
)}

${SPACER}

## 🚧 Not Finished Stories (${args.notFinishedStories.length})
${generateFromStories(
  args.projectId,
  args.notFinishedStories,
  `
> [!CAUTION]
> These stories are **not completed**: no finish commit and not accepted.  
> Please confirm whether they can be released as-is.
`.trim(),
)}

${SPACER}

## 🛠️ Chores (${args.chores.length})
${generateFromStories(args.projectId, args.chores)}

${SPACER}

## 🔍 Non-story Commits (${args.nonStoryCommits.length})
${args.nonStoryCommits.length ? generateCommitList(args.nonStoryCommits) : "No commits."}

  `.trim();
};

const generateFromStories = (projectId: string, stories: Story[], warning: string = ""): string => {
  if (!stories.length) {
    return "No stories.";
  }

  const content = stories
    .map(({ id, storyType, title, commits, status }) => {
      const url = createUrl(projectId, id);
      const header =
        storyType === "Chore"
          ? `#### [${title}](${url})${status !== "Accepted" ? " (Not finished)" : ""}`
          : `#### ${getStoryIcon(storyType)} [${title}](${url})`;
      const commitList = generateCommitList(commits);
      return `${header}\n${commitList}`;
    })
    .join("\n");

  return warning ? `${warning}\n${content}` : content;
};

const generateCommitList = (commits: GitCommit[]): string => {
  return commits.map((commit) => `- ${commit.message} ${commit.shortHash}`).join("\n");
};

const createUrl = (projectId: string, storyId: string) =>
  `https://trackerboot.com/projects/${projectId}/stories/${storyId}`;

const storyIcons = {
  Feature: "🧩",
  Design: "🎨",
  Bug: "🦋",
  Chore: "",
} as const;
const getStoryIcon = (type: Story["storyType"]) => storyIcons[type];
