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

  const githubRepo = options.values["github-repo"] || process.env.TB_GITHUB_REPO;
  const tbProjectId = options.values["tb-project-id"] || process.env.TB_PROJECT_ID;

  if (!githubRepo) {
    throw new Error("github-repo is required (use --github-repo or set TB_GITHUB_REPO)");
  }

  if (!tbProjectId) {
    throw new Error("tb-project-id is required (use --tb-project-id or set TB_PROJECT_ID)");
  }

  if (!process.env.TB_API_KEY) {
    throw new Error("TB_API_KEY environment variable is required");
  }

  return {
    apiKey: process.env.TB_API_KEY,
    from: options.values.from,
    to: options.values.to,
    githubRepo,
    tbProjectId,
    help: false,
    output: options.values.output,
  };
};
