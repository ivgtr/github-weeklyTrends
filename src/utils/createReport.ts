import dotenv from 'dotenv'
import axios from 'axios'
import dayjs from 'dayjs'

dotenv.config()

const url = 'https://api.github.com/graphql'

const headers = {
  Authorization: `bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
  Accept: 'application/vnd.github.v4.idl'
}

const commentIssue = async (repositorys: shapeRepository[], issueId: string) => {
  await Promise.all(repositorys.map((repo) => {
    axios({
      url,
      headers,
      method: 'POST',
      data: {
        query: `mutation {
        createIssue(input:{title:"${title}",repositoryId:"MDEwOlJlcG9zaXRvcnkzMzE4ODM4MTE=",body:"${issueBody}"}) {
          clientMutationId,
          issue {
            body,
            id
          }
        }
      }`
      }
    })
      .then((res) => {
        return res.data.reateIssue.issue.id
      })
      .catch((err) => {
        console.log(err)
      })
  })
}


const createIssueBody = (repositorys: shapeRepository[], title: string): string => {
  let body = `# ${title}\n`
  body += `## ${repositorys[0].language || 'unknown'}\n`

  repositorys[0].repositorys.map((repo) => {
    body += `### [${repo.name}](${repo.href}) / [${repo.author}](https://github.com/${
      repo.author
    })\n${repo.description || 'Not description.'}\nFork:${repo.forks} / Star:${repo.stars}\n\n`
  })

  return body
}

const createIssue = (shapeDate: shapeRepository[]) => {
  const day = dayjs()
  const title = `Weekly GitHub Trending! (${day.format('YYYY/MM/DD')} ~ ${day
    .subtract(1, 'week')
    .format('YYYY/MM/DD')})`
  const issueBody = createIssueBody(shapeDate, title)

  console.log(issueBody)

  return axios({
    url,
    headers,
    method: 'POST',
    data: {
      query: `mutation {
        createIssue(input:{title:"${title}",repositoryId:"MDEwOlJlcG9zaXRvcnkzMzE4ODM4MTE=",body:"${issueBody}"}) {
          clientMutationId,
          issue {
            body,
            id
          }
        }
      }`
    }
  })
    .then((res) => {
      return res.data.reateIssue.issue.id
    })
    .catch((err) => {
      console.log(err)
    })
}

const getShapeData = (trendData: Repository[]) => {
  const languageData: { [key: string]: Repository[] } = {}
  const shapeData: shapeRepository[] = []
  trendData.map((repo) => {
    const language = repo.language || 'unknown'
    languageData[language]
      ? (languageData[language] = languageData[language].concat([repo]))
      : (languageData[language] = [repo])
  })
  Object.keys(languageData).map((r) => {
    shapeData.push({ language: r, repositorys: languageData[r] })
  })
  return shapeData.sort((a, b) => {
    return b.repositorys.length - a.repositorys.length
  })
}

export const createReport = async (trendData: Repository[]) => {
  const shapeData = await getShapeData(trendData)
  const issueId = await createIssue(shapeData)
  await commentIssue(shapeData.shift(), issueId as string)
}
