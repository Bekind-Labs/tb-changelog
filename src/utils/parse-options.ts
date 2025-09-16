import { parseArgs } from "node:util";
import packageJson from "../../package.json" with { type: "json" };

type Options =
  | {
      help: false;
      from: string;
      to: string;
      apiKey: string;
      tbProjectId: string;
      output?: string;
      version: string;
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

  if (!process.env.TB_API_KEY) {
    throw new Error("TB_API_KEY environment variable is required");
  }

  const tbProjectId = options.values["tb-project-id"] || process.env.TB_PROJECT_ID;

  if (!tbProjectId) {
    throw new Error("tb-project-id is required (use --tb-project-id or set TB_PROJECT_ID)");
  }

  if (!options.values.from) {
    throw new Error("--from option is required");
  }

  return {
    apiKey: process.env.TB_API_KEY,
    from: options.values.from,
    to: options.values.to,
    tbProjectId,
    help: false,
    output: options.values.output,
    version: packageJson.version,
  };
};
