/* 这是一个关于文章的【路由模块】 */
const express = require('express')
const router = express.Router()
const ExecuteFuncData = require('../Implement/ExecuteFunctionData')

// 获取Article 文章API
router.get('/?', async (req, res) => {
  const UID = req.query.id
  const data = {
    article: '',
    comment: '',
    goodnum: 0,
    collect: 0,
  }
  // 查询文章是否删除 Query whether the article is deleted
  const QueryArticleIsDeleteSql = `select * from ev_articles where article_id=? and is_delete=0`
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

  // 查询文章是否删除 Query whether the article is deleted
  const QueryArticleIsDelete = await ExecuteFuncData(
    QueryArticleIsDeleteSql,
    UID
  )
  if (QueryArticleIsDelete.length === 0) {
    return res.cc('404 NOT FOUNT', 404)
  } else {
    data.article = QueryArticleIsDelete[0]
    // 查询该文章的点赞和评论数 Query article user operations
    const QueryArticleUserOperations = await ExecuteFuncData(
      QueryArticleUserOperationsSql,
      UID
    )
    const newArry = JSON.parse(JSON.stringify(QueryArticleUserOperations))
    for (let key in newArry) {
      data.goodnum += parseInt(newArry[key].goodnum)
      data.collect += parseInt(newArry[key].collect)
    }
    // 获取当前登录的用户是否给当前文章点赞和收藏 Query whether the article user has operated
    const QueryWhetherTheArticleUserHasOperated = await ExecuteFuncData(
      QueryWhetherTheArticleUserHasOperatedSql,
      [UID, req.query.user]
    )
    const getdata = JSON.parse(
      JSON.stringify(QueryWhetherTheArticleUserHasOperated)
    )[0]
    if (getdata) {
      data.acgoodnum = parseInt(getdata.goodnum) === 1
      data.accollect = parseInt(getdata.collect) === 1
    }
    // 查询文章评论 Query article comments
    const QueryArticleComments = await ExecuteFuncData(
      QueryArticleCommentsSql,
      UID
    )
    data.comment = QueryArticleComments
    res.status(200).send({
      status: 200,
      message: '获取文章成功',
      data: data,
    })
  }
})

module.exports = router
