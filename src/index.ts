import dotenv from 'dotenv'
import axios from 'axios'

dotenv.config()

// const getdate = () => {
//   new Promise((_resolve, _reject) =>
//     axios
//       .get(`https://github.com/trending/?since='daily'`, {
//         headers: {
//           Accept: 'text/html'
//         }
//       })
//       .then((response) => {
//         console.log(response)
//       })
//   )
// }

export default (() => {
  axios({
    url: 'https://api.github.com/graphql',
    headers: {
      Authorization: `bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
      Accept: 'application/vnd.github.v4.idl'
    },
    method: 'POST',
    data: {
      query: `mutation { 
        createIssue(input:{title:"test2",repositoryId:"MDEwOlJlcG9zaXRvcnkzMzE4ODM4MTE=",body:"uooooooooooooo${new Date().getTime()}"}) { 
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
})()
