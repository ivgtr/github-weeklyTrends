import * as cheerio from "cheerio";

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

// docs: https://github.com/ecrmnn/trending-github
const trendingGitHub = async (period: string = "daily", language: string = "") => {
  const response = await fetch(
    `https://github.com/trending/${encodeURIComponent(language)}?since=${period}`,
    { headers: { Accept: "text/html" } }
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch trending: ${response.status}`);
  }
  const html = await response.text();
  const $ = cheerio.load(html);
  const repos: Repository[] = [];

  $("article").each((_index, repo) => {
    const title = $(repo).find("h2.h3 a").text().replace(/\s/g, "");

    const author = title.split("/")[0];
    const name = title.split("/")[1];

    const starLink = `/${title.replace(/ /g, "")}/stargazers`;
    const forkLink = `/${title.replace(/ /g, "")}/forks`;

    let text = "";
    if (period === "daily") {
      text = "stars today";
    } else if (period === "weekly") {
      text = "stars this week";
    } else {
      text = "stars this month";
    }

    const indexRepo: Repository = {
      author,
      name,
      href: `https://github.com/${author}/${name}`,
      description: $(repo).find("p").text().trim() || null,
      language: $(repo).find("[itemprop=programmingLanguage]").text().trim(),
      stars: parseInt(
        $(repo).find(`[href="${starLink}"]`).text().trim().replace(",", "") || "0",
        10
      ),
      forks: parseInt(
        $(repo).find(`[href="${forkLink}"]`).text().trim().replace(",", "") || "0",
        10
      ),
      starsInPeriod: parseInt(
        $(repo)
          .find(`span.float-sm-right:contains('${text}')`)
          .text()
          .trim()
          .replace(text, "")
          .replace(",", "") || "0",
        10
      ),
    };

    repos.push(indexRepo);
  });

  return repos;
};

export const getGithubTrend = () => trendingGitHub("weekly");
