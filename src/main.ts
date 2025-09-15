import { writeFile } from "node:fs/promises";
import consola from "consola";
import { colorize } from "consola/utils";
import { fetchStoriesFromApi } from "./repositories/fetch-stories-from-api";
import { getCommits } from "./repositories/get-commits";
import { combineAllInformation } from "./utils/combine-all-information";
import { extractGitCommits } from "./utils/extract-git-commits";
import { generateMarkdown } from "./utils/generate-markdown";
import { parseOptions } from "./utils/parse-options";
import { showHelp } from "./utils/show-help";

export async function main(args: string[]) {
  try {
    const options = parseOptions(args);

    if (options.help) {
      showHelp();
      process.exit(0);
    }

    consola.log(colorize("dim", `tb-changelog v${options.version}`));
    consola.debug({ badge: true, message: options });
    consola.info(`Generating changelog: ${colorize("blue", options.from)} → ${colorize("green", options.to)}`);

    const commits = await getCommits(options);
    consola.success(`Found ${colorize("blue", `${commits.length} commits`)}`);

    const { gitStories, nonStoryCommits } = extractGitCommits(commits);
    consola.success(
      `Found ${colorize("blue", `${gitStories.length} stories`)}:`,
      colorize("dim", gitStories.map(({ id }) => id).join(",")),
    );

    consola.debug({ badge: true, message: "Fetching stories from TrackerBoot API..." });
    const tbStories = await fetchStoriesFromApi(
      options.tbProjectId,
      options.apiKey,
      gitStories.map((story) => story.id),
    );
    consola.debug({ message: `Found ${tbStories.length} stories in TrackerBoot` });

    const { acceptedStories, needsAttentionStories, notFinishedStories, chores } = combineAllInformation(
      gitStories,
      nonStoryCommits,
      tbStories,
    );

    const markdown = generateMarkdown({
      githubRepoUrl: options.githubRepo,
      projectId: options.tbProjectId,
      acceptedStories,
      needsAttentionStories,
      notFinishedStories,
      chores,
      nonStoryCommits,
      totalCommits: commits.length,
    });

    if (options.output) {
      await writeFile(options.output, markdown, "utf-8");
      consola.success({ badge: true, message: `📦 Changelog written to: ${options.output}` });
    } else {
      consola.success({ badge: true, message: `📦 Changelog generated successfully.` });
      console.log(markdown);
    }
  } catch (error) {
    if (error instanceof Error) {
      consola.error(error.message);
    } else {
      consola.error(error);
    }

    process.exit(1);
  }
}
