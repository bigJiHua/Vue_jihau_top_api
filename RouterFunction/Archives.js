/* 这是一个关于文章的【路由模块】 */
const ExecuteFuncData = require('../Implement/ExecuteFunctionData')
const config = require('../config')
const ExecuteFunc = require('../Implement/ExecuteFunction')

// 获取文章内容
exports.getArticle = async (req, res) => {
  // 这个接口只读取文章，不对其它数据进行获取
  const AID = req.query.id
  const data = { article: {}, power: {} }
  // 查询文章是否删除 Query whether the article is deleted
  const QueryArticleIsDeleteSql = `select * from ev_articles where article_id=? and state = 0 and is_delete = 0`
  // 查询文章是否删除 Query whether the article is deleted
  const QueryArticleIsDelete = await ExecuteFuncData(
    QueryArticleIsDeleteSql,
    AID,
  )
  if (QueryArticleIsDelete.length === 0) return res.cc('404 NOT FOUNT', 404)
  const UN = QueryArticleIsDelete[0].username
  /* ================= 获取文章权限 ================= */
  const QueryArticlePowerSql = `select 
  allow_comment,allow_comhis,allow_like,
  allow_share,comment_review,is_clean_page, lastcag_at
  from ev_artpower where article_id = ? and username = ?`
  const QueryArticlePower = await ExecuteFuncData(QueryArticlePowerSql, [
    AID,
    UN,
  ])
  data.article = QueryArticleIsDelete[0]
  data.power = QueryArticlePower[0]
  res.status(200).send({
    status: 200,
    message: '获取文章成功',
    data,
  })
}
// 获取文章内容
exports.getArticleData = async (req, res) => {
  try {
    const articleId = req.query.id // 获取文章ID
    const loginUser = req.authData?.username || null
    if (!articleId) {
      return res.cc('参数错误！', 304)
    }
    // 返回的数据结构
    const data = {
      goodnum: 0,
      collect: 0,
      acgoodnum: false,
      accollect: false,
    }
    // SQL 语句
    const sqlUpdateReadNum = `
      UPDATE ev_articles SET read_num = read_num + 1
      WHERE article_id = ? AND is_delete = 0
    `
    const sqlArticleStats = `
      SELECT 
        SUM(goodnum) AS goodnum,
        SUM(collect) AS collect
      FROM ev_userartdata 
      WHERE article_id = ?
    `
    const sqlUserAction = `
      SELECT goodnum, collect
      FROM ev_userartdata 
      WHERE article_id = ? AND username = ?
    `
    // 执行并行查询 （提升性能）
    await ExecuteFuncData(sqlUpdateReadNum, articleId)

    const [stats] = await ExecuteFuncData(sqlArticleStats, articleId)
    data.goodnum = parseInt(stats?.goodnum || 0)
    data.collect = parseInt(stats?.collect || 0)

    // 用户行为判断
    if (loginUser) {
      const userAction = await ExecuteFuncData(sqlUserAction, [
        articleId,
        loginUser,
      ])
      if (userAction.length > 0) {
        data.acgoodnum = userAction[0].goodnum === '1'
        data.accollect = userAction[0].collect === '1'
      }
    }
    return res.status(200).send({
      status: 200,
      message: 'OK',
      data,
      ismessage: false,
    })
  } catch (err) {
    console.error('getArticleData error:', err)
    return res.cc('服务器内部错误', 500)
  }
}

// 获取文章评论（独立评论接口）
exports.getArticleComment = async (req, res) => {
  try {
    const articleId = req.query.id // 获取文章ID
    if (!articleId) {
      return res.cc('参数错误！', 304)
    }
    // 返回结构
    const data = {
      comment: [],
      iscom: true, // 是否能评论
      isshow: true, // 是否展示历史评论
    }
    // 查询评论列表 SQL
    const sqlComments = `SELECT * FROM ev_usercomment WHERE article_id = ? AND is_allow = 1`
    // 查询评论权限（文章级）
    const CheckisCommentSql = `
      SELECT allow_comment, allow_comhis 
      FROM ev_artpower 
      WHERE article_id = ?
    `
    // 查询权限
    const [power] = await ExecuteFuncData(CheckisCommentSql, articleId)

    // 如果数据库没有记录，默认允许评论 + 允许展示历史（安全 fallback）
    const allowComment = power ? parseInt(power.allow_comment) === 1 : true
    const allowHistory = power ? parseInt(power.allow_comhis) === 1 : true

    // 最终展示历史判断
    const showHistory = allowComment || allowHistory

    // 评论展示逻辑
    if (showHistory) {
      const comments = await ExecuteFuncData(sqlComments, articleId)
      data.comment = comments
    } else {
      data.comment = [] // 全禁止 → 返回空
    }

    // 如果不允许评论，则标记 iscom = false
    data.iscom = allowComment // true=可评论 false=不可评论
    data.isshow = allowHistory // true=展示历史 false=不展示历史
    return res.status(200).send({
      status: 200,
      message: 'OK',
      data,
      ismessage: false,
    })
  } catch (err) {
    console.error('getArticleComment Error:', err)
    return res.cc('服务器内部错误', 500)
  }
}

// 获取通知
exports.getPage = async (req, res) => {
  const UID = req.query.id
  const user = req.query.user
  // 查询文章是否删除 Query whether the article is deleted
  const SelectPageDataSql = `select * from ev_notify where notify_id=? and state = 0 and  is_delete=0`
  // 添加阅读数 Update Read Num TODO test 测试阶段 开放此接口 让数据量上涨
  const UpdateReadNumSql = `UPDATE ev_notify  SET read_num = read_num + 1  WHERE notify_id =? AND is_delete = 0; `
  await ExecuteFuncData(UpdateReadNumSql, UID)
  // 查询文章是否删除 Query whether the article is deleted
  const SelectPageData = await ExecuteFuncData(SelectPageDataSql, UID)
  if (SelectPageData.length === 0) return res.cc('404 NOT FOUNT', 404)
  if (user) {
    // 检查用户身份
    const CheckUserSql = `select useridentity from ev_users where username =?`
    const CheckUser = await ExecuteFuncData(CheckUserSql, user)
    if (
      SelectPageData[0].whosee === 1 &&
      CheckUser[0].useridentity !== 'manager'
    ) {
      return res.status(200).send({
        message: '您无权限查看!',
        status: 404,
      })
    }
  } else {
    if (SelectPageData[0].whosee === 1) return res.cc('您无权限查看！', 200)
  }
  const {
    content,
    keyword,
    lable,
    notify_id,
    pub_date,
    read_num,
    title,
    username,
  } = SelectPageData[0]
  const data = {
    content,
    keyword,
    lable,
    notify_id,
    pub_date,
    read_num,
    title,
    username,
  }
  res.status(200).send({
    status: 200,
    message: '获取通知成功',
    data: data,
  })
}

// 5秒后增加阅读数
exports.UpdateReadNum = async (req, res) => {
  const UID = req.query.id
  // 添加阅读数 Update Read Num
  const UpdateReadNumSql = `UPDATE ev_articles  SET read_num = read_num + 1  WHERE article_id =? AND is_delete = 0; `
  const UpdateReadNum = await ExecuteFuncData(UpdateReadNumSql, UID)
  if (UpdateReadNum.affectedRows === 0) return res.cc('操作错误', 205)
  res.status(200).send({
    message: '增增增 蒸蒸日上！',
    status: 200,
  })
}

// 搜索接口
exports.SearchApi = async (req, res) => {
  //TODO 搜索返回值做limit为10
  const key = req.query.key
  const GetType = req.query.type
  let tableName = '' // 数据库表名
  let stateCondition = '' // 状态条件
  let SelectId = '' // 索引ID
  // 根据 type 设置表名和状态条件
  switch (GetType) {
    case 'article':
      tableName = 'ev_articles'
      stateCondition = ' AND state = 0 AND is_delete = 0'
      SelectId = 'article_id'
      break
    case 'notify':
      tableName = 'ev_notify'
      stateCondition = ' AND state = 0 AND is_delete = 0'
      SelectId = 'notify_id'
      break
    case 'user':
      tableName = 'ev_users'
      stateCondition = ' AND isact = 1'
      SelectId = 'user_id'
      break
    default:
      return res.cc('Key not found', 404)
  }
  if (key.trim() === '') return res.cc('Key not found', 404)
  // 过滤后的关键词
  const filterKey = config.filterSqlInjection(key, res)
  if (!filterKey) return
  let SearchQuerySql = ``
  if (tableName !== 'ev_users') {
    // 搜索表不在用户表里则
    SearchQuerySql = `SELECT * FROM ${tableName} WHERE 
    (${SelectId} LIKE '%${filterKey}%' OR username LIKE '%${filterKey}%' OR content LIKE '%${filterKey}%'
    OR title LIKE '%${filterKey}%' OR pub_date LIKE '%${filterKey}%' OR lable LIKE '%${filterKey}%'
    OR keyword LIKE '%${filterKey}%')${stateCondition} Limit 10 `
  } else {
    // 搜索表为用户表
    SearchQuerySql = `SELECT user_content,user_id,user_pic,useridentity,username
    FROM ${tableName} WHERE (${SelectId} LIKE '%${filterKey}%' OR username LIKE '%${filterKey}%' OR user_content LIKE '%${filterKey}%')${stateCondition} `
  }
  // 执行查询语句
  const SearchQuery = await ExecuteFunc(SearchQuerySql)
  if (SearchQuery.length === 0) return res.cc('什么也没找到', 404)
  res.status(200).send({
    status: 200,
    message: '搜索成功！',
    data: config.SelectContent(SearchQuery, 30),
  })
}

// 做站点地图
exports.sitemapData = async (req, res) => {
  const article = await ExecuteFunc(
    'SELECT article_id AS id, pub_date FROM ev_articles WHERE state = 0 AND is_delete = 0',
  )
  const notify = await ExecuteFunc(
    'SELECT notify_id AS id, pub_date FROM ev_notify WHERE whosee = 0 AND state = 0 AND is_delete = 0',
  )
  const rawData = [
    {
      pages: [
        { path: '/' },
        { path: '/Login' },
        { path: '/register' },
        { path: '/checkVer' },
        { path: '/DevProcess' },
        { path: '/SpsList' },
      ],
    },
    {
      pages: [{ path: '/Notify' }, { path: '/Search' }],
    },
    {
      pages: [
        { path: '/space/jihua' },
        { path: '/feedback/class/spslist' },
        { path: '/feedback/sitemap' },
      ],
    },
    {
      pages: [
        { path: '/error/type-window' },
        { path: '/error/type-phone' },
        { path: '/error/test' },
      ],
    },
  ]

  // 获取今天日期，格式 YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0]

  // 扁平化
  const sitemapArray = rawData.flatMap((category) =>
    category.pages.map((page) => ({
      path: page.path,
      pub_date: today,
    })),
  )
  const hostname = 'http://jihau.top'
  // 拼接 XML 字符串
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
              <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
              ${sitemapArray
                .map(
                  (p) => `
                <url>
                  <loc>${hostname}${p.path}</loc>
                  <lastmod>${p.pub_date}</lastmod>
                  <changefreq>daily</changefreq>
                  <priority>1</priority>
                </url>`,
                )
                .join('')}
                ${article
                  .map(
                    (a) => `
                  <url>
                    <loc>${hostname}/article/${a.id}</loc>
                    <lastmod>${a.pub_date}</lastmod>
                    <changefreq>daily</changefreq>
                    <priority>0.8</priority>
                  </url>`,
                  )
                  .join('')}
                ${notify
                  .map(
                    (b) => `
                  <url>
                    <loc>${hostname}/notify/${b.id}</loc>
                    <lastmod>${b.pub_date}</lastmod>
                    <changefreq>daily</changefreq>
                    <priority>0.8</priority>
                  </url>`,
                  )
                  .join('')}
                </urlset>`

  // 设置返回类型为 XML
  res.header('Content-Type', 'application/xml')
  res.send(xml)
}
