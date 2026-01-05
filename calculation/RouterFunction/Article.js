const ExecuteFunc = require('../../Implement/ExecuteFunction')
/*
 * 文章统计图
  统计 所有已发布数量
  统计 点赞数 阅读数 评论数 收藏数 分享数
  统计 所有文章被举报量最多的 TODO 举报功能未开发
*/
// 简单的获取文章数据
const CountArticleDataByDeticle = async (req, res) => {
  // 获取未删除的文章总数
  const CountAllNum = await ExecuteFunc('SELECT COUNT(*) AS Num FROM ev_articles ')
  // 统计 已发布数量 被驳回数量 删除数量
  const CountArticleNum = await ExecuteFunc(`
            SELECT
            SUM(CASE WHEN is_delete = 0 AND state = 0 THEN 1 ELSE 0 END) AS ArNum, 
            SUM(CASE WHEN is_delete = 1 THEN 1 ELSE 0 END) AS DArNum,
            SUM(CASE WHEN is_delete = 0 AND state = 1 THEN 1 ELSE 0 END) AS RArNum 
        FROM ev_articles;`)
  return res.status(200).send({
    message: '获取成功/操作成功',
    status: 200,
    data: {
      CountAllNum: CountAllNum[0].Num,
      CountArticleNum,
    },
  })
}
// 展示前10名发布文章最多的作者
const ShowMostArticleUser = async (req, res) => {
  const User = await ExecuteFunc(`SELECT 
    username, COUNT(article_id) AS article_count
    FROM ev_articles
    GROUP BY username
    ORDER BY article_count DESC
    LIMIT 10;`)
  return res.status(200).send({
    message: '获取成功/操作成功',
    status: 200,
    data: User,
  })
}
// 展示阅读量前20
const ShowMostReadArticle = async (req, res) => {
  const ArtData = await ExecuteFunc(`SELECT 
    title, read_num, username ,pub_date, article_id
    FROM ev_articles
    ORDER BY read_num DESC
    LIMIT 20;`)
  return res.status(200).send({
    message: '获取成功/操作成功',
    status: 200,
    data: ArtData,
  })
}
module.exports = {
  CountArticleDataByDeticle,
  ShowMostArticleUser,
  ShowMostReadArticle,
}
