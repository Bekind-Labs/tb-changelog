import { readFile, writeFile } from "node:fs/promises";
import { describe, expect, it, vi } from "vitest";
import { loadCacheIfExists, saveCache } from "./cache";
import type { CategorizedStories } from "./combine-all-information";

vi.mock("node:fs/promises");
vi.mock("consola");

describe("cache utilities", () => {
  const expectedKey = "12345::v1.0.0--v1.1.0";
  const expectedCacheKey = {
    from: "v1.0.0",
    to: "v1.1.0",
    projectId: "12345",
  } satisfies Parameters<typeof loadCacheIfExists>[0];

  const emptyCategorizedStories: CategorizedStories = {
    acceptedStories: [],
    needsAttentionStories: [],
    notFinishedStories: [],
    chores: [],
    nonStoryCommits: [],
    totalCommits: 0,
  };

  describe("loadCacheIfExists", () => {
    it("returns cached data when file exists and key matches", async () => {
      const matchedCacheEntry = { key: expectedKey, timestamp: "2024-01-01T00:00:00Z", data: emptyCategorizedStories };
      vi.mocked(readFile).mockResolvedValue(JSON.stringify(matchedCacheEntry));

      const result = await loadCacheIfExists(expectedCacheKey, "test-cache-file");

      expect(result).toEqual(matchedCacheEntry);
      expect(readFile).toHaveBeenCalledWith("test-cache-file", "utf-8");
    });

    it("returns null when cache key does not match", async () => {
      const notMatchedCacheEntry = {
        key: "different-key",
        timestamp: "2024-01-01T00:00:00Z",
        data: emptyCategorizedStories,
      };
      vi.mocked(readFile).mockResolvedValue(JSON.stringify(notMatchedCacheEntry));

      const result = await loadCacheIfExists(expectedCacheKey, "test-cache-file");

      expect(result).toBeNull();
    });

    it("returns null when file does not exist", async () => {
      vi.mocked(readFile).mockRejectedValue(new Error("ENOENT"));

      const result = await loadCacheIfExists(expectedCacheKey, "test-cache-file");

      expect(result).toBeNull();
    });

    it("returns null when file contains invalid JSON", async () => {
      vi.mocked(readFile).mockResolvedValue("invalid json");

      const result = await loadCacheIfExists(expectedCacheKey, "test-cache-file");

      expect(result).toBeNull();
    });
  });

  describe("saveCache", () => {
    it("writes cache data with correct key format", async () => {
      await saveCache(expectedCacheKey, emptyCategorizedStories, "test-cache-file");

      expect(writeFile).toHaveBeenCalledWith(
        "test-cache-file",
        expect.stringContaining(`"key": "${expectedKey}"`),
        "utf-8",
      );
    });
  });
});
