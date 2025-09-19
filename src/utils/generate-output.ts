import type { CategorizedStories } from "./combine-all-information";
import { generateGithubMarkdown } from "./generator/generate-github-markdown";
import { generateSlackPayload } from "./generator/generate-slack-payload";

export const FORMATS = ["github", "github-light", "slack-payload"] as const;
export type Format = (typeof FORMATS)[number];

export type OutputParameters = {
  projectId: string;
  categorizedStories: CategorizedStories;
  includeSignature: boolean;
  format: Format;
};
export type OutputGeneratorParameters = Omit<OutputParameters, "format">;

export const generateOutput = ({ format, ...args }: OutputParameters): string => {
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
