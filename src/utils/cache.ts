import { readFile, writeFile } from "node:fs/promises";
import consola from "consola";
import { colorize } from "consola/utils";
import type { ReleaseInfo } from "./combine-all-information";

type CacheData = {
  key: string;
  timestamp: string;
  data: ReleaseInfo;
};
type CacheMeta = {
  from: string;
  to: string;
  tbProjectId: string;
};
export const loadCacheIfExists = async (meta: CacheMeta, cacheFile: string): Promise<CacheData | null> => {
  try {
    const content = await readFile(cacheFile, "utf-8");
    const data = JSON.parse(content) as CacheData;

    if (generateCacheKey(meta) !== data.key) {
      consola.info(colorize("dim", "Cache key does not match. Skipping cache."));
      return null;
    }

    return data;
  } catch {
    consola.info(colorize("dim", "Cache file not found or invalid. Skipping cache."));
    return null;
  }
};

export const saveCache = async (meta: CacheMeta, data: ReleaseInfo, cacheFile: string): Promise<void> => {
  const key = generateCacheKey(meta);
  await writeFile(
    cacheFile,
    JSON.stringify({ key, timestamp: new Date().toISOString(), data } satisfies CacheData, null, 2),
    "utf-8",
  );

  consola.success(`Saved cache file to ${cacheFile} (${key})`);
};

const generateCacheKey = ({ from, to, tbProjectId }: CacheMeta): string => {
  return `${tbProjectId}::${from}--${to}`;
};
