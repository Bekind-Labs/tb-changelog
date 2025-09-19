import { writeFile } from "node:fs/promises";
import consola from "consola";
import { colorize } from "consola/utils";
import { fetchStoriesFromApi } from "./repositories/fetch-stories-from-api";
import { getCommits } from "./repositories/get-commits";
import type { TBStory } from "./types";
import { loadCacheIfExists, saveCache } from "./utils/cache";
import { combineAllInformation, type ReleaseInfo } from "./utils/combine-all-information";
import { extractGitCommits } from "./utils/extract-git-commits";
import { generateOutput } from "./utils/generate-output";
import { parseOptions } from "./utils/parse-options";
import { showHelp } from "./utils/show-help";

const CACHE_FILE = "./.tb-changelog-cache";

export async function main(args: string[]) {
  try {
    const options = parseOptions(args);

    if (options.help) {
      showHelp();
      process.exit(0);
    }

    consola.log(colorize("dim", `tb-changelog v${options.version}\n`));

    consola.debug({ badge: true, message: options });
    consola.info(
      `Generating changelog: ${colorize("blue", options.from)} → ${colorize("green", options.to)}${options.useCache ? " (using cache)" : ""}`,
    );

    let releaseInfo: ReleaseInfo | null = null;

    if (options.useCache) {
      const cacheData = await loadCacheIfExists(options, CACHE_FILE);

      if (cacheData) {
        consola.success(`Found and matched cache (${cacheData.key}). Using cached data.`);
        releaseInfo = cacheData.data;
      }
    }

    if (!releaseInfo) {
      const commits = await getCommits(options);
      consola.success(`Found ${colorize("blue", `${commits.length} commits`)} from git`);

      const { gitStories, nonStoryCommits } = extractGitCommits(commits);
      consola.success(
        `Found ${colorize("blue", `${gitStories.length} stories`)} from git:`,
        colorize("dim", gitStories.map(({ id }) => id).join(",")),
      );

      let tbStories: TBStory[] = [];
      if (!gitStories.length) {
        consola.success({ message: "No stories to fetch from TrackerBoot. Skipping API call." });
      } else {
        consola.debug(colorize("dim", "Fetching stories from TrackerBoot API..."));
        tbStories = await fetchStoriesFromApi(options.tbProjectId, options.apiKey);
        consola.success({ message: `Retrieved ${colorize("blue", `${tbStories.length} stories`)} from TrackerBoot` });
      }

      releaseInfo = combineAllInformation(commits, gitStories, nonStoryCommits, tbStories);

      if (options.useCache) {
        await saveCache(options, releaseInfo, CACHE_FILE);
      }
    }

    if (!releaseInfo) {
      throw new Error("Failed to combine all information.");
    }

    const markdown = generateOutput({ ...options, releaseInfo });

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
