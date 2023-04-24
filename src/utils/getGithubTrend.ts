import axios from "axios";
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
const trendingGitHub = (period: string = "daily", language: string = "") =>
  new Promise<Repository[]>((resolve, reject) =>
    axios
      .get(`https://github.com/trending/${encodeURIComponent(language)}?since=${period}`, {
        headers: {
          Accept: "text/html",
        },
      })
      .then((response) => {
        const $ = cheerio.load(response.data);
        const repos: Repository[] = [];

        $("article").each((_index, repo) => {
          const title = $(repo).find("h2.h3 a").text().replace(/\s/g, "");

          const author = title.split("/")[0];
          const name = title.split("/")[1];

          const starLink = `/${title.replace(/ /g, "")}/stargazers`;
          const forkLink = `/${title.replace(/ /g, "")}/network/members.${name}`;

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
              0
            ),
            forks: parseInt(
              $(repo).find(`[href="${forkLink}"]`).text().trim().replace(",", "") || "0",
              0
            ),
            starsInPeriod: parseInt(
              $(repo)
                .find(`span.float-sm-right:contains('${text}')`)
                .text()
                .trim()
                .replace(text, "")
                .replace(",", "") || "0",
              0
            ),
          };

          repos.push(indexRepo);
        });

        resolve(repos);
      })
      .catch((err) => {
        reject(err);
      })
  );

export const getGithubTrend = () => trendingGitHub("weekly").then((responce) => responce);
