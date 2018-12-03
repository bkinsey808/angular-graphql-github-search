export interface User {
  login: string;
  name: string;
  location: string;
  bio: string;
  avatarUrl: string;
  repositories: {
    totalCount: number;
  };
  followers: {
    totalCount: number;
  };
}

export interface GithubUserSearch {
  search: {
    pageInfo: {
      startCursor: string;
      hasNextPage?: boolean;
      endCursor: string;
      hasPreviousPage?: boolean;
    };
    userCount: number;
    nodes: User[];
  };
}

// tslint:disable-next-line:no-empty-interface
export interface Mutation {}
