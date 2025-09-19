import { readFile, writeFile } from "node:fs/promises";
import consola from "consola";
import { colorize } from "consola/utils";
import type { CategorizedStories } from "./combine-all-information";

type CacheEntry = {
  key: string;
  timestamp: string;
  data: CategorizedStories;
};
type CacheKey = {
  from: string;
  to: string;
  projectId: string;
};
export const loadCacheIfExists = async (cacheKey: CacheKey, cacheFile: string): Promise<CacheEntry | null> => {
  try {
    const content = await readFile(cacheFile, "utf-8");
    const data = JSON.parse(content) as CacheEntry;

    if (generateCacheKey(cacheKey) !== data.key) {
      consola.info(colorize("dim", "Cache key does not match. Skipping cache."));
      return null;
    }

    return data;
  } catch {
    consola.info(colorize("dim", "Cache file not found or invalid. Skipping cache."));
    return null;
  }
};

export const saveCache = async (cacheKey: CacheKey, data: CategorizedStories, cacheFile: string): Promise<void> => {
  const key = generateCacheKey(cacheKey);
  await writeFile(
    cacheFile,
    JSON.stringify({ key, timestamp: new Date().toISOString(), data } satisfies CacheEntry, null, 2),
    "utf-8",
  );

  consola.success(`Saved cache file to ${cacheFile} (${key})`);
};

const generateCacheKey = ({ from, to, projectId }: CacheKey): string => {
  return `${projectId}::${from}--${to}`;
};
