export type GitCommit = {
  hash: string;
  shortHash: string;
  message: string;
  date: Date;
};

export type GitStory = {
  id: string;
  commits: GitCommit[];
  isFinished: boolean;
};

export type TBStory = {
  id: string;
  title: string;
  storyType: "Feature" | "Design" | "Chore" | "Bug";
  status: "Rejected" | "Accepted" | "Delivered" | "Finished" | "Started";
};

export type Story = TBStory & {
  commits: GitCommit[];
};
