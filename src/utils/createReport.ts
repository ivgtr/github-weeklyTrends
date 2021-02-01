import dotenv from 'dotenv'
import axios from 'axios'
import dayjs from 'dayjs'

dotenv.config()

const url = 'https://api.github.com/graphql'

const headers = {
  Authorization: `bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
  Accept: 'application/vnd.github.v4.idl'
}

const createCommentIssueBody = (repositorys: shapeRepository): string => {
  let body = `## ${repositorys.language || 'unknown'}\n`

  repositorys.repositorys.map((repo) => {
    body += `### [${repo.author}](https://github.com/${repo.author}) / [${repo.name}](${
      repo.href
    })\n${repo.description || 'Not description.'}\n\nFork:${repo.forks} / Star:${repo.stars} / +${
      repo.starsInPeriod
    } stars this week\n\n`
  })

  return body
}

const commentIssue = async (repositorys: shapeRepository[], issueId: string) => {
  for (const repo of repositorys) {
    const issueCommentBody = createCommentIssueBody(repo)
    await axios({
      url,
      headers,
      method: 'POST',
      data: {
        query: `mutation {
            addComment(input:{subjectId:"${issueId}",body:"${issueCommentBody}"}) {
              clientMutationId
            }
          }`
      }
    })
  }
  console.log('complete')
}

const createIssueBody = (repositorys: shapeRepository, title: string): string => {
  let body = `# ${title}\n`
  body += `## ${repositorys.language || 'unknown'} trending ${
    repositorys.repositorys.length
  }repo's\n`

  repositorys.repositorys.map((repo) => {
    body += `### [${repo.author}](https://github.com/${repo.author}) / [${repo.name}](${
      repo.href
    })\n${repo.description || 'Not description.'}\n\nFork:${repo.forks} / Star:${repo.stars} / +${
      repo.starsInPeriod
    } stars this week\n\n`
  })

  return body
}

const createIssue = (shapeDate: shapeRepository[]) => {
  const day = dayjs()
  const title = `Weekly GitHub Trending! (${day
    .subtract(1, 'week')
    .format('YYYY/MM/DD')} ~ ${day.format('YYYY/MM/DD')})`
  const issueBody = createIssueBody(shapeDate[0], title)

  return axios({
    url,
    headers,
    method: 'POST',
    data: {
      query: `mutation {
        createIssue(input:{title:"${title}",repositoryId:"MDEwOlJlcG9zaXRvcnkzMzE4ODM4MTE=",labelIds:"MDU6TGFiZWwyNjg3OTE1Nzgy",body:"${issueBody}"}) {
          issue {
            body,
            id
          }
        }
      }`
    }
  })
    .then((res) => {
      return res.data.data.createIssue.issue.id
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
  const shiftShapeData = shapeData.slice(1, 100)
  await commentIssue(shiftShapeData, issueId as string)
}
