import trending from "trending-github";

export const getGithubTrend = () => trending("weekly").then((responce) => responce);
