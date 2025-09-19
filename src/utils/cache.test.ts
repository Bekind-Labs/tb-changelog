import { readFile, writeFile } from "node:fs/promises";
import { describe, expect, it, vi } from "vitest";
import { loadCacheIfExists, saveCache } from "./cache";
import type { ReleaseInfo } from "./combine-all-information";

vi.mock("node:fs/promises");
vi.mock("consola");

describe("cache utilities", () => {
  const expectedKey = "12345::v1.0.0--v1.1.0";
  const expectedMeta = {
    from: "v1.0.0",
    to: "v1.1.0",
    tbProjectId: "12345",
  } satisfies Parameters<typeof loadCacheIfExists>[0];

  const emptyInfo: ReleaseInfo = {
    acceptedStories: [],
    needsAttentionStories: [],
    notFinishedStories: [],
    chores: [],
    nonStoryCommits: [],
    totalCommits: 0,
  };

  describe("loadCacheIfExists", () => {
    it("returns cached data when file exists and key matches", async () => {
      const matchedCacheData = { key: expectedKey, timestamp: "2024-01-01T00:00:00Z", data: emptyInfo };
      vi.mocked(readFile).mockResolvedValue(JSON.stringify(matchedCacheData));

      const result = await loadCacheIfExists(expectedMeta, "test-cache-file");

      expect(result).toEqual(matchedCacheData);
      expect(readFile).toHaveBeenCalledWith("test-cache-file", "utf-8");
    });

    it("returns null when cache key does not match", async () => {
      const notMatchedCacheData = { key: "different-key", timestamp: "2024-01-01T00:00:00Z", data: emptyInfo };
      vi.mocked(readFile).mockResolvedValue(JSON.stringify(notMatchedCacheData));

      const result = await loadCacheIfExists(expectedMeta, "test-cache-file");

      expect(result).toBeNull();
    });

    it("returns null when file does not exist", async () => {
      vi.mocked(readFile).mockRejectedValue(new Error("ENOENT"));

      const result = await loadCacheIfExists(expectedMeta, "test-cache-file");

      expect(result).toBeNull();
    });

    it("returns null when file contains invalid JSON", async () => {
      vi.mocked(readFile).mockResolvedValue("invalid json");

      const result = await loadCacheIfExists(expectedMeta, "test-cache-file");

      expect(result).toBeNull();
    });
  });

  describe("saveCache", () => {
    it("writes cache data with correct key format", async () => {
      await saveCache(expectedMeta, emptyInfo, "test-cache-file");

      expect(writeFile).toHaveBeenCalledWith(
        "test-cache-file",
        expect.stringContaining(`"key": "${expectedKey}"`),
        "utf-8",
      );
    });
  });
});
