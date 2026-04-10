import dayjs from "dayjs";
import dotenv from "dotenv";

dotenv.config();

const url = "https://api.github.com/graphql";

const headers = {
  Authorization: `bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
  Accept: "application/vnd.github.v4.idl",
  "Content-Type": "application/json",
};

const translateDescription = async (description: string | null): Promise<string> => {
  if (!description) return "";
  const params = new URLSearchParams({ text: description, source: "", target: "ja" });
  const response = await fetch(`${process.env.TRANSLATE_API}?${params}`);
  if (!response.ok) {
    console.error(`Translation failed: ${response.status}`);
    return description;
  }
  const data = await response.json();
  return (data as any).text ?? description;
};

const createCommentIssueBody = async (repositorys: shapeRepository): Promise<string> => {
  const tranlateDescription: string[] = [];
  for (let i = 0; i < repositorys.repositorys.length; i++) {
    const text = await translateDescription(repositorys.repositorys[i].description);
    tranlateDescription.push(text);
  }
  let body = `## ${repositorys.language || "unknown"}\n`;

  repositorys.repositorys.map((repo, index) => {
    body += `### [${repo.author}](https://github.com/${repo.author}) / [${repo.name}](${
      repo.href
    })\n${tranlateDescription[index] || "Not description."}\n\nFork:${repo.forks} / Star:${
      repo.stars
    } / +${repo.starsInPeriod} stars this week\n\n`;
  });

  return body;
};

const commentIssue = async (repositorys: shapeRepository[], issueId: string) => {
  for (const repo of repositorys) {
    const issueCommentBody = await createCommentIssueBody(repo);
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: `mutation($input: AddCommentInput!) {
          addComment(input: $input) {
            clientMutationId
          }
        }`,
        variables: {
          input: {
            subjectId: issueId,
            body: issueCommentBody,
          },
        },
      }),
    });
    const data = await response.json();
    if (data.errors) {
      console.error(`Failed to add comment for ${repo.language}:`, JSON.stringify(data.errors));
    }
  }
  console.log("complete");
};

const createIssueBody = async (repositorys: shapeRepository, title: string): Promise<string> => {
  const tranlateDescription: string[] = [];
  for (let i = 0; i < repositorys.repositorys.length; i++) {
    const text = await translateDescription(repositorys.repositorys[i].description);
    tranlateDescription.push(text);
  }
  let body = `# ${title}\n`;
  body += `## ${repositorys.language || "unknown"} trending ${
    repositorys.repositorys.length
  }repo's\n`;

  repositorys.repositorys.map((repo, index) => {
    body += `### [${repo.author}](https://github.com/${repo.author}) / [${repo.name}](${
      repo.href
    })\n${tranlateDescription[index] || "Not description."}\n\nFork:${repo.forks} / Star:${
      repo.stars
    } / +${repo.starsInPeriod} stars this week\n\n`;
  });

  return body;
};

const createIssue = async (shapeDate: shapeRepository[]): Promise<string> => {
  const day = dayjs();
  const title = `Weekly GitHub Trending! (${day
    .subtract(1, "week")
    .format("YYYY/MM/DD")} ~ ${day.format("YYYY/MM/DD")})`;
  const issueBody = await createIssueBody(shapeDate[0], title);

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query: `mutation($input: CreateIssueInput!) {
        createIssue(input: $input) {
          issue {
            id
          }
        }
      }`,
      variables: {
        input: {
          title,
          repositoryId: "MDEwOlJlcG9zaXRvcnkzMzE4ODM4MTE=",
          labelIds: ["MDU6TGFiZWwyNjg3OTE1Nzgy"],
          body: issueBody,
        },
      },
    }),
  });

  const data = await response.json();
  if (data.errors) {
    throw new Error(`Failed to create issue: ${JSON.stringify(data.errors)}`);
  }
  return data.data.createIssue.issue.id;
};

const getShapeData = (trendData: Repository[]) => {
  const languageData: { [key: string]: Repository[] } = {};
  const shapeData: shapeRepository[] = [];
  trendData.map((repo) => {
    const language = repo.language || "unknown";
    languageData[language]
      ? (languageData[language] = languageData[language].concat([repo]))
      : (languageData[language] = [repo]);
  });
  Object.keys(languageData).map((r) => {
    shapeData.push({ language: r, repositorys: languageData[r] });
  });
  return shapeData.sort((a, b) => b.repositorys.length - a.repositorys.length);
};

export const createReport = async (trendData: Repository[]) => {
  if (trendData.length === 0) {
    throw new Error("No trending data fetched");
  }
  const shapeData = getShapeData(trendData);
  const issueId = await createIssue(shapeData);
  const shiftShapeData = shapeData.slice(1, 100);
  await commentIssue(shiftShapeData, issueId);
};
