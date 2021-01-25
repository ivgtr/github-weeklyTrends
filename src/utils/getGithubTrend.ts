import trending from 'trending-github'

export const getGithubTrend = () => {
  return trending('weekly').then((responce) => {
    return responce
  })
}
