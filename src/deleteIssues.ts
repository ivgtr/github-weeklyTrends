import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const url = "https://api.github.com/graphql";

const headers = {
  Authorization: `bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
  Accept: "application/vnd.github.v4.idl",
};

export default (async () => {
  try {
    const issueIds: { id: string }[] = await axios({
      url,
      headers,
      method: "POST",
      data: {
        query: `query {
          repository(owner:"ivgtr",name:"github-weeklyTrends"){
            issues(first:100){
              nodes{
                id
              }
            }
          }
        }`,
      },
    }).then((response: any) => response.data.data.repository.issues.nodes);

    await Promise.all(
      issueIds.map(async ({ id }) => {
        await axios({
          url,
          headers,
          method: "POST",
          data: {
            query: `mutation { 
              deleteIssue(input:{issueId:"${id}"}) { 
                clientMutationId
              }
            }`,
          },
        });
      })
    );
  } catch (error) {
    console.log(error);
  }
})();
