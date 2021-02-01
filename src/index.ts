import dayjs from 'dayjs'

import { getGithubTrend } from './utils/getGithubTrend'
import { createReport } from './utils/createReport'
import { generateReadme } from './generateReadme'

export default (async () => {
  try {
    const day = dayjs()
    const title = `Weekly GitHub Trending! (${day
      .subtract(1, 'week')
      .format('YYYY/MM/DD')} ~ ${day.format('YYYY/MM/DD')})`
    const trendData = await getGithubTrend()
    createReport(trendData, title)
    generateReadme(title)
  } catch (error) {
    console.log(error)
  }
})()
