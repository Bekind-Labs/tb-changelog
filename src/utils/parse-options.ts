import { parseArgs } from "node:util";
import packageJson from "../../package.json" with { type: "json" };
import { FORMATS, type Format } from "./generate-output";

type Options =
  | {
      help: false;
      from: string;
      to: string;
      apiKey: string;
      projectId: string;
      output?: string;
      format: Format;
      version: string;
      includeSignature: boolean;
      useCache: boolean;
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
      "no-signature": {
        type: "boolean",
      },
      "use-cache": {
        type: "boolean",
        default: false,
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

  const projectId = options.values["tb-project-id"] || process.env.TB_PROJECT_ID;

  if (!projectId) {
    throw new Error("tb-project-id is required (use --tb-project-id or set TB_PROJECT_ID)");
  }

  if (!options.values.from) {
    throw new Error("--from option is required");
  }

  const format = options.values.format as Format;
  if (!FORMATS.includes(format)) {
    throw new Error(`Invalid format: ${format}. Valid options are: ${FORMATS.join(", ")}`);
  }

  return {
    apiKey: process.env.TB_API_KEY,
    from: options.values.from,
    to: options.values.to,
    projectId,
    help: false,
    output: options.values.output,
    format,
    version: packageJson.version,
    includeSignature: !options.values["no-signature"],
    useCache: options.values["use-cache"],
  };
};
