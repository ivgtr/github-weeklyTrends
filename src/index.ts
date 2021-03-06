import { getGithubTrend } from './utils/getGithubTrend'
import { createReport } from './utils/createReport'

export default (async () => {
  try {
    const trendData = await getGithubTrend()
    createReport(trendData)
  } catch (error) {
    console.log(error)
  }
})()
