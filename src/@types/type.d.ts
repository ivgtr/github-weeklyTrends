type Repository = {
  author: string;
  name: string;
  href: string;
  description: string | null;
  language: string;
  stars: number;
  forks: number;
  starsInPeriod: number | null;
};

type shapeRepository = {
  language: string;
  repositorys: Repository[];
};
