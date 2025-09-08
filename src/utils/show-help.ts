import consola from "consola";

export function showHelp() {
  consola.log(
    `
Usage: tb-changelog [options]

Options:
  --from <tag>                     Start tag/branch/commit (required)
  --to <tag>                       End tag/branch/commit (default: HEAD)
  --github-repo <url>              GitHub repository URL (required)
                                   Example: https://github.com/your/repository
  --tb-project-id <id>             TrackerBoot project ID (required)
                                   Example: 123456789
  --output <file>, -o <file>       Output file path (optional)
  --help, -h                       Show this help message

Environment Variables:
  TB_API_KEY                       TrackerBoot API key (required)

Example:
  tb-changelog --from v1.0.0 --to v1.1.0 --github-repo https://github.com/your/repository --tb-project-id 123456789
  `.trim(),
  );
}
