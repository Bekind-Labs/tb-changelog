import { parseArgs } from "node:util";

type Options =
  | {
      help: false;
      from: string;
      to: string;
      apiKey: string;
      githubRepo: string;
      tbProjectId: string;
      output?: string;
    }
  | { help: true };
export const parseOptions = (args: string[]): Options => {
  const options = parseArgs({
    args,
    options: {
      from: {
        type: "string",
      },
      to: {
        type: "string",
        default: "HEAD",
      },
      "github-repo": {
        type: "string",
      },
      "tb-project-id": {
        type: "string",
      },
      output: {
        type: "string",
        short: "o",
      },
      help: {
        type: "boolean",
        short: "h",
      },
    },
    allowPositionals: false,
  });

  if (options.values.help) {
    return { help: true };
  }

  if (!options.values.from) {
    throw new Error("--from option is required");
  }

  if (!options.values["github-repo"]) {
    throw new Error("--github-repo option is required");
  }

  if (!options.values["tb-project-id"]) {
    throw new Error("--tb-project-id option is required");
  }

  if (!process.env.TB_API_KEY) {
    throw new Error("TB_API_KEY environment variable is required");
  }

  return {
    apiKey: process.env.TB_API_KEY,
    from: options.values.from,
    to: options.values.to,
    githubRepo: options.values["github-repo"],
    tbProjectId: options.values["tb-project-id"],
    help: false,
    output: options.values.output,
  };
};
