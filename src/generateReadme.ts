import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const url = "https://api.github.com/graphql";

const headers = {
  Authorization: `bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
  Accept: "application/vnd.github.v4.idl",
};

const closeIssue = (issueData: { id: string }) => {
  axios({
    url,
    headers,
    method: "POST",
    data: {
      query: `mutation { 
        closeIssue(input:{issueId:"${issueData.id}"}){
          clientMutationId
        }
      }`,
    },
  });
};

const createReadme = (newIssueData: { number: number; title: string }) => {
  const body = `<div align="center">
  <h3 align="center">github-weekly-trends</h3>
  <p align="center">Get Github weekly trends, and output Issue in this repository.</p>
  <a align="center" href="https://github.com/ivgtr/github-weeklyTrends/issues/${newIssueData.number}" target="_brank">${newIssueData.title}</a>
</div>\n
## License\n
MIT ©[ivgtr](https://github.com/ivgtr)\n
[![Github Follow](https://img.shields.io/github/followers/ivgtr?style=social)](https://github.com/ivgtr) [![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE) [![Donate](https://img.shields.io/badge/%EF%BC%84-support-green.svg?style=flat-square)](https://www.buymeacoffee.com/ivgtr)`;

  fs.writeFileSync("README.md", body);
};

export default (async () => {
  try {
    const issueData: { title: string; number: number; id: string }[] = await axios({
      url,
      headers,
      method: "POST",
      data: {
        query: `query {
          repository(owner:"ivgtr",name:"github-weeklyTrends"){
            issues(first:10,states:OPEN,orderBy:{field:CREATED_AT,direction:DESC}){
              nodes{
                number,
                title,
                id
              }
            }
          }
        }`,
      },
    }).then((response: any) => response.data.data.repository.issues.nodes);

    if (issueData.length) {
      createReadme(issueData[0]);
    }
    if (issueData.length > 2) {
      for (let i = 2; i < issueData.length; i++) {
        await closeIssue(issueData[i]);
      }
    }
  } catch (error) {
    console.log(error);
  }
})();
