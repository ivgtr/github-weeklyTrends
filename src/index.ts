import dotenv from 'dotenv'
import axios from 'axios'
import trending from 'trending-github'

dotenv.config()

const getdate = () => {
  return trending('weekly').then((responce) => responce)
}

export default async function main() {
  const data = await getdate()
  axios({
    url: 'https://api.github.com/graphql',
    headers: {
      Authorization: `bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
      Accept: 'application/vnd.github.v4.idl'
    },
    method: 'POST',
    data: {
      query: `mutation { 
        createIssue(input:{title:"test2",repositoryId:"MDEwOlJlcG9zaXRvcnkzMzE4ODM4MTE=",body:"${data}"}) { 
          clientMutationId,
          issue {
            body,
            id
          }
        }
      }`
    }
  })
    .then((res) => res.data)
    .then(console.log)
}
