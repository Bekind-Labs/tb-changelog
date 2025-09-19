import type { Story } from "../../types";

export const generateUrl = (projectId: string, storyId: string) =>
  `https://trackerboot.com/projects/${projectId}/stories/${storyId}`;

const storyIcons = {
  Feature: "🧩",
  Design: "🎨",
  Bug: "🦋",
  Chore: "",
} as const;
export const getStoryIcon = (type: Story["storyType"]) => storyIcons[type];
