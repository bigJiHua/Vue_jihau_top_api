/* 这是一个关于文章的【路由模块】 */
const ExecuteFuncData = require('../Implement/ExecuteFunctionData')
const config = require('../config')
const ExecuteFunc = require('../Implement/ExecuteFunction')

// 获取文章内容
exports.getArticle = async (req, res) => {
  const UID = req.query.id
  const data = {
    article: '',
    comment: '',
    goodnum: 0,
    collect: 0,
  }
  // 查询文章是否删除 Query whether the article is deleted
  const QueryArticleIsDeleteSql = `select * from ev_articles where article_id=? and state = 0 and is_delete=0`
  // 查询该文章的点赞和评论数 Query article user operations
  const QueryArticleUserOperationsSql = `select
        ev_userartdata.goodnum,ev_userartdata.collect
        from ev_userartdata where article_id = ?`
  // 获取当前登录的用户是否给当前文章点赞和收藏 Query whether the article user has operated
  const QueryWhetherTheArticleUserHasOperatedSql = `select 
        ev_userartdata.goodnum,ev_userartdata.collect
        from ev_userartdata where article_id=? and username=?`
  // 查询文章评论 Query article comments
  const QueryArticleCommentsSql = `select * from ev_usercomment  where article_id = ?`
  // 添加阅读数 Update Read Num TODO test 测试阶段 开放此接口 让数据量上涨
  const UpdateReadNumSql = `UPDATE ev_articles  SET read_num = read_num + 1  WHERE article_id =? AND is_delete = 0; `
  await ExecuteFuncData(UpdateReadNumSql, UID)
  // 查询文章是否删除 Query whether the article is deleted
  const QueryArticleIsDelete = await ExecuteFuncData(QueryArticleIsDeleteSql, UID)
  if (QueryArticleIsDelete.length === 0) {
    return res.cc('404 NOT FOUNT', 404)
  } else {
    data.article = QueryArticleIsDelete[0]
    // 查询该文章的点赞和评论数 Query article user operations
    const QueryArticleUserOperations = await ExecuteFuncData(QueryArticleUserOperationsSql, UID)
    const newArry = JSON.parse(JSON.stringify(QueryArticleUserOperations))
    for (let key in newArry) {
      data.goodnum += parseInt(newArry[key].goodnum)
      data.collect += parseInt(newArry[key].collect)
    }
    // 获取当前登录的用户是否给当前文章点赞和收藏 Query whether the article user has operated
    if (req.query.user && req.query.user !== '') {
      const QueryWhetherTheArticleUserHasOperated = await ExecuteFuncData(
        QueryWhetherTheArticleUserHasOperatedSql,
        [UID, req.query.user],
      )
      const getdata = JSON.parse(JSON.stringify(QueryWhetherTheArticleUserHasOperated))[0]
      if (getdata) {
        data.acgoodnum = parseInt(getdata.goodnum) === 1
        data.accollect = parseInt(getdata.collect) === 1
      }
    }
    // 查询文章评论 Query article comments
    const QueryArticleComments = await ExecuteFuncData(QueryArticleCommentsSql, UID)
    data.comment = QueryArticleComments
    res.status(200).send({
      status: 200,
      message: '获取文章成功',
      data: data,
    })
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
    if (SelectPageData[0].whosee === 1 && CheckUser[0].useridentity !== 'manager') {
      return res.status(200).send({
        message: '您无权限查看!',
        status: 404,
      })
    }
  } else {
    if (SelectPageData[0].whosee === 1) return res.cc('您无权限查看！', 200)
  }
  const { content, keyword, lable, notify_id, pub_date, read_num, title, username } =
    SelectPageData[0]
  const data = { content, keyword, lable, notify_id, pub_date, read_num, title, username }
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
    OR keyword LIKE '%${filterKey}%')${stateCondition} `
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
