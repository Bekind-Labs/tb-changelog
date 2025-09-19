import type { TBStory } from "../types";

export const fetchStoriesFromApi = async (projectId: string, apiKey: string): Promise<TBStory[]> => {
  const res = await fetch("https://trackerboot.com/analytics/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": apiKey,
    },
    body: JSON.stringify({
      query,
      variables: { projectId },
    }),
  });

  // biome-ignore lint/suspicious/noExplicitAny: Sorry...
  const json = (await res.json()) as any;
  return [
    ...json.data.rejected,
    ...json.data.accepted,
    ...json.data.delivered,
    ...json.data.finished,
    ...json.data.started,
  ];
};

const query = `
  query getStories($projectId: ID!) {
    rejected: stories(projectId: $projectId, status: Rejected) {
      id
      title
      storyType
      status
    }
    accepted: stories(projectId: $projectId, status: Accepted) {
      id
      title
      storyType
      status
    }
    delivered: stories(projectId: $projectId, status: Delivered) {
      id
      title
      storyType
      status
    }
    finished: stories(projectId: $projectId, status: Finished) {
      id
      title
      storyType
      status
    }
    started: stories(projectId: $projectId, status: Started) {
      id
      title
      storyType
      status
    }
  }
`;
