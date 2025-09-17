import { parseArgs } from "node:util";
import packageJson from "../../package.json" with { type: "json" };
import { type MarkdownFormat, MarkdownFormats } from "./generate-markdown";

type Options =
  | {
      help: false;
      from: string;
      to: string;
      apiKey: string;
      tbProjectId: string;
      output?: string;
      format: MarkdownFormat;
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
      format: {
        type: "string",
        short: "f",
        default: "github",
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

  const format = options.values.format as MarkdownFormat;
  if (!MarkdownFormats.includes(format)) {
    throw new Error(`Invalid format: ${format}. Valid options are: ${MarkdownFormats.join(", ")}`);
  }

  return {
    apiKey: process.env.TB_API_KEY,
    from: options.values.from,
    to: options.values.to,
    tbProjectId,
    help: false,
    output: options.values.output,
    format,
    version: packageJson.version,
  };
};
