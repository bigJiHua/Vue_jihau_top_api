/* 这是一个关于文章的 路由【处理模块】 */
const config = require('../config')
const ExecuteFuncData = require('../Implement/ExecuteFunctionData')
/*
  article_id: "Y1YZ60"
  content: "<p>使用Java构建基于Spring的RESTful API"
  lable: "使用Java构建基于Spring的RESTful API"
  pub_date: "2023-06-13"
  pub_month: 6
  read_num: 0
  state: "已发布"
  title: "使用Java构建基于Spring的RESTful API"
  username: "JiHua"
*/
// 查找名下的文章
exports.spaceArt = async (req, res) => {
  const user = req.query.user
  const page = Number(req.query.page)
  if (!user) return res.cc('参数错误', 404)
  // 多表联查 查找名下的文章 数据 Get the current user's articles
  const GetALlNumSql = `SELECT
    a.*,
    (SELECT COUNT(goodnum) FROM ev_userartdata u1 WHERE u1.article_id = a.article_id) AS goodNum,
    (SELECT COUNT(collect) FROM ev_userartdata u2 WHERE u2.article_id = a.article_id) AS collectNum
    FROM ev_articles a WHERE a.username = ? AND a.is_delete = 0 AND a.state = 0`
  const GetTheCurrentUsersArticlesSql = `SELECT
    a.*,
    (SELECT COUNT(goodnum) FROM ev_userartdata u1 WHERE u1.article_id = a.article_id) AS goodNum,
    (SELECT COUNT(collect) FROM ev_userartdata u2 WHERE u2.article_id = a.article_id) AS collectNum
    FROM ev_articles a WHERE a.username = ? AND a.is_delete = 0 AND a.state = 0 limit 10 offset ?`
  const GetALlNum = await ExecuteFuncData(GetALlNumSql, user)
  let GetTheCurrentUsersArticles = []
  if (!isNaN(page)) {
    GetTheCurrentUsersArticles = await ExecuteFuncData(GetTheCurrentUsersArticlesSql, [user, page])
    if (GetTheCurrentUsersArticles.length === 0)
      return res.send({
        message: '暂无更多数据！',
        data: [],
        Num: 0,
        status: 204,
      })
  }
  if (GetALlNum.length === 0)
    return res.send({
      message: '空空如也！',
      data: [],
      Num: 0,
      status: 204,
    })
  res.status(200).send({
    status: 200,
    message: '获取用户文章成功',
    ismessage: false,
    data: !isNaN(page)
      ? config.SelectContent(GetTheCurrentUsersArticles, 80)
      : config.SelectContent(GetALlNum, 80),
    Num: GetALlNum.length,
  })
}

// 查找名下搜藏文章
exports.spaceCol = async (req, res) => {
  const user = req.query.user
  const page = Number(req.query.page)
  if (!user) return res.cc('参数错误', 404)
  const AllData = []
  // 查找收藏文章的索引获取id
  const SelectUserCollectIdSql = `Select article_id from ev_userartdata where collect = 1 AND username = ? limit 10 offset ?`
  const CollectNumSql = `Select article_id from ev_userartdata where collect = 1 AND username = ?`
  const SelectArtDataSql = `Select * from ev_articles where article_id = ?`
  const CollectNum =
    (await ExecuteFuncData(CollectNumSql, user)).length > 0
      ? (await ExecuteFuncData(CollectNumSql, user)).length
      : false
  const SelectUserCollectId = await ExecuteFuncData(SelectUserCollectIdSql, [user, page])
  // 根据获取索引id获取文章细则
  for (let i = 0; i < SelectUserCollectId.length; i++) {
    AllData.push(...(await ExecuteFuncData(SelectArtDataSql, SelectUserCollectId[i].article_id)))
  }
  // 归纳数据分发
  if (!CollectNum)
    return res.send({
      message: '空空如也！',
      data: [],
      Num: 0,
      status: 204,
    })
  res.status(200).send({
    status: 200,
    message: '获取用户收藏文章成功',
    ismessage: false,
    data: !isNaN(page) ? config.SelectContent(AllData, 80) : config.SelectContent(AllData, 80),
    Num: CollectNum,
  })
}

// 查找名下喜欢文章
exports.spaceLike = async (req, res) => {
  const user = req.query.user
  const page = Number(req.query.page)
  if (!user) return res.cc('参数错误', 404)
  const AllData = []
  // 查找收藏文章的索引获取id
  const SelectUserCollectIdSql = `Select article_id from ev_userartdata where goodnum = 1 AND username = ? limit 10 offset ?`
  const CollectNumSql = `Select article_id from ev_userartdata where goodnum = 1 AND username = ?`
  const SelectArtDataSql = `Select * from ev_articles where article_id = ?`
  const goodNum =
    (await ExecuteFuncData(CollectNumSql, user)).length > 0
      ? (await ExecuteFuncData(CollectNumSql, user)).length
      : false
  const SelectUserCollectId = await ExecuteFuncData(SelectUserCollectIdSql, [user, page])
  // 根据获取索引id获取文章细则
  for (let i = 0; i < SelectUserCollectId.length; i++) {
    AllData.push(...(await ExecuteFuncData(SelectArtDataSql, SelectUserCollectId[i].article_id)))
  }
  // 归纳数据分发
  if (!goodNum)
    return res.send({
      message: '空空如也！',
      data: [],
      Num: 0,
      status: 204,
    })
  res.status(200).send({
    status: 200,
    message: '获取用户喜欢文章成功',
    ismessage: false,
    data: !isNaN(page) ? config.SelectContent(AllData, 80) : config.SelectContent(AllData, 80),
    Num: goodNum,
  })
}

// 查找粉丝和关注列表
exports.getUserRelation = async (req, res) => {
  const { author, met } = req.query
  const Num = Number(req.query.Num)
  if (!author) return res.cc('参数异常', 404)
  let SelectUserRelationSql = ''
  let SelectUserRelation = []
  switch (met) {
    // 获取关注列表
    case 'conlist': {
      SelectUserRelationSql = `
          SELECT UD.username, UD.user_id, UD.user_pic, UD.user_content, UD.useridentity
          FROM ev_userrelation URL
          INNER JOIN ev_users UD ON URL.author = UD.username
          WHERE URL.username = ? AND URL.relation = 0
          LIMIT 10 OFFSET ?`
      break
    }
    // 获取粉丝列表
    case 'Beflist': {
      SelectUserRelationSql = `
          SELECT UD.username, UD.user_id, UD.user_pic, UD.user_content, UD.useridentity
          FROM ev_userrelation URL
          INNER JOIN ev_users UD ON URL.username = UD.username
          WHERE URL.author = ? AND URL.relation = 0
          LIMIT 10 OFFSET ?`
      break
    }
    default: {
      return res.cc('参数异常', 404)
    }
  }
  SelectUserRelation = await ExecuteFuncData(SelectUserRelationSql, [author, Num])
  return res.send({
    status: 200,
    message: '获取成功',
    ismessage: false,
    data: {
      conlist: met === 'conlist' ? SelectUserRelation : [],
      Beflist: met === 'Beflist' ? SelectUserRelation : [],
    },
  })
}
