import { createReport } from "./utils/createReport";
import { getGithubTrend } from "./utils/getGithubTrend";

export default (async () => {
  try {
    const trendData = await getGithubTrend();
    await createReport(trendData);
  } catch (error) {
    console.log(error);
  }
})();
