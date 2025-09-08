import { execa } from "execa";
import type { GitCommit } from "../types";

type Args = {
  from: string;
  to: string;
};
export const getCommits = async ({ from, to }: Args): Promise<GitCommit[]> => {
  // git log format: hash|shortHash|message|date
  const result = await execa("git", ["log", "--pretty=format:%H|%h|%s|%ai", `${from}..${to}`, "--no-merges"]);

  if (!result.stdout.trim()) {
    return [];
  }

  return result.stdout
    .trim()
    .split("\n")
    .map((line) => {
      const [hash, shortHash, message, dateString] = line.split("|");
      return {
        hash,
        shortHash,
        message,
        date: new Date(dateString),
      };
    })
    .toReversed();
};
