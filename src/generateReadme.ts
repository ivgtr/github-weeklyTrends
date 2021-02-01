import fs from 'fs'
import dotenv from 'dotenv'
import axios from 'axios'

dotenv.config()

const url = 'https://api.github.com/graphql'

const headers = {
  Authorization: `bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
  Accept: 'application/vnd.github.v4.idl'
}

const createReadme = (newIssueData: { number: number }, title: string) => {
  const body = `<div align="center">
  <h3 align="center">github-weekly-trends</h3>
  <p align="center">Get Github weekly trends, and output Issue in this repository.</p>
  <a align="center" href="https://github.com/ivgtr/github-weeklyTrends/issues/${(newIssueData.number += 1)}" target="_brank">${title}</a>
</div>\n
## License\n
MIT ©[ivgtr](https://github.com/ivgtr)\n
[![Github Follow](https://img.shields.io/github/followers/ivgtr?style=social)](https://github.com/ivgtr) [![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE) [![Donate](https://img.shields.io/badge/%EF%BC%84-support-green.svg?style=flat-square)](https://www.buymeacoffee.com/ivgtr)`

  fs.writeFileSync('README.md', body)
}

export const generateReadme = async (title: string) => {
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
                number
              }
            }
          }
        }`
      }
    }).then((response) => {
      return response.data.data.repository.issues.nodes
    })

    createReadme(newIssueData[0], title)
  } catch (error) {
    console.log(error)
  }
}
