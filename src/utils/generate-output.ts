import type { GitCommit, Story } from "../types";
import { generateGithubMarkdown } from "./generator/generate-github-markdown";
import { generateSlackPayload } from "./generator/generate-slack-payload";

export const MarkdownFormats = ["github", "github-light", "slack-payload"] as const;
export type MarkdownFormat = (typeof MarkdownFormats)[number];

export type GenerateOutputParameters = {
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
export type OutputGeneratorParameters = Omit<GenerateOutputParameters, "format">;

export const generateOutput = ({ format, ...args }: GenerateOutputParameters): string => {
  switch (format) {
    case "github":
      return generateGithubMarkdown(args, false);
    case "github-light":
      return generateGithubMarkdown(args, true);
    case "slack-payload":
      return generateSlackPayload(args);
    default: {
      throw new Error(`Unknown format: ${format}`);
    }
  }
};
