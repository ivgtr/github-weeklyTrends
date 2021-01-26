import fs from 'fs'
import dotenv from 'dotenv'
import axios from 'axios'

dotenv.config()

const url = 'https://api.github.com/graphql'

const headers = {
  Authorization: `bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
  Accept: 'application/vnd.github.v4.idl'
}

const createReadme = (newIssueData: { title: string; number: number }) => {
  const body = `<div align="center">
  <h3 align="center">github-weekly-trends</h3>
  <p align="center">Get Github weekly trens, and output Issue in this repository.</p>
  <a align="center" href="https://github.com/ivgtr/github-weeklyTrends/issues/${newIssueData.number}" target="_brank">${newIssueData.title}</a>
</div>\n
## License\n
MIT ©[ivgtr](https://github.com/ivgtr)\n
[![Twitter Follow](https://img.shields.io/twitter/follow/ivgtr?style=social)](https://twitter.com/mawaru_hana) [![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE) [![Donate](https://img.shields.io/badge/%EF%BC%84-support-green.svg?style=flat-square)](https://www.buymeacoffee.com/ivgtr)`

  fs.writeFileSync('README.md', body)
  return body
}

export default (async () => {
  try {
    const newIssueData: { title: string; number: number }[] = await axios({
      url,
      headers,
      method: 'POST',
      data: {
        query: `query {
          repository(owner:"ivgtr",name:"github-weeklyTrends"){
            issues(first:1){
              nodes{
                number,
                title
              }
            }
          }
        }`
      }
    }).then((response) => {
      return response.data.data.repository.issues.nodes
    })

    createReadme(newIssueData[0])
  } catch (error) {
    console.log(error)
  }
})()
