const db = require('../../DataBase/linkdb')
const ExecuteFunc = (sql) => {
  if (sql) {
    return new Promise((resolve, reject) => {
      db.query(sql, (err, results) => {
        if (err) return reject(err)
        return resolve(results)
      })
    })
  }
}

const ExecuteFuncData = (sql, data) => {
  return new Promise((resolve, reject) => {
    db.query(sql, data, (err, results) => {
      if (err) return reject(err)
      return resolve(results)
    })
  })
}

/*
 * 文章统计图
  统计 所有已发布数量
  统计 点赞数 阅读数 评论数 收藏数 分享数
  统计 所有文章被举报量最多的 TODO 举报功能未开发
*/
// 统计数量
const CountArticleDataByDeticle = async (req, res) => {
  await UpdateArticleData()
  // 获取未删除的文章总数
  const CountAllNum = await ExecuteFunc(
    'SELECT COUNT(*) AS Num FROM ev_articles where is_delete = 0;',
  )
  // 统计 已发布数量 被驳回数量 删除数量
  const CountArticleNum = await ExecuteFunc(`
            SELECT
            SUM(CASE WHEN is_delete = 0 AND state = 0 THEN 1 ELSE 0 END) AS ArNum,
            SUM(CASE WHEN is_delete = 1 THEN 1 ELSE 0 END) AS DArNum,
            SUM(CASE WHEN is_delete = 0 AND state = 1 THEN 1 ELSE 0 END) AS RArNum
        FROM ev_articles;`)
  
  const SelectArtCountData = await ExecuteFunc(`Select * from ev_articlecount Limit 10 offset 0`)

  res.status(200).send({
    message: '获取成功/操作成功',
    data: {
      CountAllNum: CountAllNum[0].Num,
      CountArticleNum,
      SelectArtCountData
    },
  })
}
// 获取统计 单篇 文章的点赞 收藏 评论 分享 数量
const CountNumData = () => {
  const CountNumDataSql = ``
}
/*
 * 发布年 月统计图
 * 标签分布图
 * 关键词分布图
 */

// 定时更新文章内容数据
const UpdateArticleData = async () => {
  // 统计 点赞数 阅读数 评论数 收藏数 分享数
  const CountArticleDataNum = await ExecuteFunc(`
            INSERT INTO ev_articlecount (username, user_id, article_id, pub_date, readnum, goodnum, collectnum, commentnum, sharenum, reportnum, state)
            SELECT A.username,
                   C.user_id,
                   A.article_id,
                   A.pub_date,
                   A.read_num AS readnum,
                   (
                       SELECT COUNT(goodnum)
                       FROM ev_userartdata E
                       WHERE E.article_id = A.article_id AND goodnum = 1
                   ) AS goodnum,
                   (
                       SELECT COUNT(collect)
                       FROM ev_userartdata F
                       WHERE F.article_id = A.article_id AND collect = 1
                   ) AS collectnum,
                   (
                       SELECT COUNT(*)
                       FROM ev_usercomment G
                       WHERE G.article_id = A.article_id
                   ) AS commentnum,
                   A.share_num AS sharenum,
                   A.report_num AS reportnum,
                   A.state
            FROM ev_articles A
            LEFT JOIN ev_userartdata B ON A.article_id = B.article_id
            LEFT JOIN ev_users C ON A.username = C.username
            WHERE A.is_delete = 0
            GROUP BY A.username, C.user_id, A.article_id, A.pub_date, A.share_num, A.read_num, A.report_num, A.state;`)
  if (CountArticleDataNum.affectedRows === 0) {
  }
}
module.exports = {
  CountArticleDataByDeticle,
}
