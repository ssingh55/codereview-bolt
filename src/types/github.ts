export interface GitHubRepo {
  owner: string;
  name: string;
  branch?: string;
  path?: string;
}

export interface GitHubFile {
  name: string;
  path: string;
  content: string;
  language: string;
  size: number;
  url: string;
}

export interface GitHubPullRequest {
  number: number;
  title: string;
  description: string;
  author: string;
  files: GitHubFile[];
  additions: number;
  deletions: number;
  changedFiles: number;
}

export interface GitHubRepoInfo {
  name: string;
  fullName: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  url: string;
  defaultBranch: string;
}