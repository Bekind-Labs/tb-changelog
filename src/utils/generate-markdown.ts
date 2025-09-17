import type { GitCommit, Story } from "../types";
import { generateGithubLightMarkdown, generateGithubMarkdown } from "./markdown/generate-github-markdown";
import { generateSlackPayload } from "./markdown/generate-slack-payload";

export const MarkdownFormats = ["github", "github-light", "slack-payload"] as const;
export type MarkdownFormat = (typeof MarkdownFormats)[number];

export type GenerateMarkdownParameters = {
  projectId: string;
  acceptedStories: Story[];
  needsAttentionStories: Story[];
  notFinishedStories: Story[];
  chores: Story[];
  nonStoryCommits: GitCommit[];
  totalCommits: number;
  signature: boolean;
  format: MarkdownFormat;
};
export type MarkdownGeneratorParameters = Omit<GenerateMarkdownParameters, "format">;

export const generateMarkdown = ({ format, ...args }: GenerateMarkdownParameters): string => {
  switch (format) {
    case "github":
      return generateGithubMarkdown(args);
    case "github-light":
      return generateGithubLightMarkdown(args);
    case "slack-payload":
      return generateSlackPayload(args);
    default: {
      throw new Error(`Unknown format: ${format}`);
    }
  }
};
