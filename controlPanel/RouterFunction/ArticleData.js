/* 这是一个关于文章的 后台管理面板路由【处理模块】 */
const config = require('../../config')
const ExecuteFunc = require('../../Implement/ExecuteFunction')
const ExecuteFuncData = require('../../Implement/ExecuteFunctionData')
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
// 获取文章列表
exports.SelectArticle = async (req, res) => {
    const pageSize = 10; // 每页显示的文章数量
    // 获取所有文章数目 做分页
    const GetALLArticlesAtATimeSql = `SELECT * FROM ev_articles `
    const GetALLArticlesAtATime = await  ExecuteFunc(GetALLArticlesAtATimeSql)
    const totalCount = GetALLArticlesAtATime.length; // 文章总数

    const currentPage = req.query.Num; // 当前页码
    const offset = (currentPage - 1) * pageSize;
    const limit = (totalCount - offset) < pageSize ? (totalCount - offset) : pageSize;
    // 每次只获取10条文章 Get only 10 articles at a time
    const GetOnly10ArticlesAtATimeSql = `SELECT * FROM ev_articles ORDER BY ev_articles.id ASC LIMIT ${limit} OFFSET ${offset}`;
    const GetOnly10ArticlesAtATime = await ExecuteFunc(GetOnly10ArticlesAtATimeSql)
    if (GetOnly10ArticlesAtATime.length === 0) {
        return res.send({
            status: 204,
            message: '已加载全部数据',
            data:  config.SelectContent(GetOnly10ArticlesAtATime,30),
            totalNum: totalCount
        })
    }
    res.status(200).send({
        status: 200,
        message: '获取成功',
        data: config.SelectContent(GetOnly10ArticlesAtATime,30),
        totalNum: totalCount
    })
}

// 更改文章数据操作
exports.cagUPData = async (req, res) => {
    const {cagUserName, articleId, func} = req.body
    if (func === 'delComment') {
        // 删除评论
        const deleteUserCommentsSql = `delete from ev_usercomment where username=? and id=?`
        const deleteUserComments = await ExecuteFuncData(deleteUserCommentsSql, [cagUserName, articleId])
        if (deleteUserComments.affectedRows !== 1) return res.cc('删除失败/评论已被删除')
        res.status(200).send({
            status: 200,
            message: '删除成功',
        })
    } else if (func === 'reject') {
        // 驳回文章 让作者文章进入作者回收站  ev_articles state 设置字段为0
        // 1. 检查是否正常状态
        const CheckArticleStateIsOkSql = `SELECT * from ev_articles where username =? AND article_id =? AND state=0 AND is_delete = 0`
        const CheckArticleStateIsOk = await ExecuteFuncData(CheckArticleStateIsOkSql,[cagUserName,articleId])
        // 等于空 就证明该文章已经删除或者已被驳回
        if (CheckArticleStateIsOk.length === 0) return res.cc('文章已被驳回/删除 ！',404)
        // 1-1 进行驳回操作
        const UpdateArticleStateSql = `UPDATE ev_articles SET state=1 where username=? AND article_id =?`
        const UpdateArticleState = await ExecuteFuncData(UpdateArticleStateSql,[cagUserName,articleId])
        if (UpdateArticleState.affectedRows !== 1) return res.cc('操作失败',500)
        res.cc('已驳回', 200)
    } else if (func === 'restore') {
        // 恢复文章  ev_articles state 设置字段为0
        // 1. 检查是否正常状态
        const CheckArticleStateIsOkSql = `SELECT * from ev_articles where username =? AND article_id =? AND state=1 AND is_delete = 0 `
        const CheckArticleStateIsOk = await ExecuteFuncData(CheckArticleStateIsOkSql,[cagUserName,articleId])
        // 等于空 就证明该文章已经删除或者已被驳回
        if (CheckArticleStateIsOk.length === 0) return res.cc('文章正常/已被删除 ！',404)
        // 1-1 进行驳回操作
        const UpdateArticleStateSql = `UPDATE ev_articles SET state=0 where username=? AND article_id =?`
        const UpdateArticleState = await ExecuteFuncData(UpdateArticleStateSql,[cagUserName,articleId])
        if (UpdateArticleState.affectedRows !== 1) return res.cc('操作失败',500)
        res.cc('恢复成功', 200)
    }  else if (func === 'delArticle') {
        // 删除文章  ev_articles is_delete 设置字段为1
        // 1. 检查是否正常状态
        const CheckArticleStateIsOkSql = `SELECT * from ev_articles where username =? AND article_id =? AND is_delete = 0 `
        const CheckArticleStateIsOk = await ExecuteFuncData(CheckArticleStateIsOkSql,[cagUserName,articleId])
        // 等于空 就证明该文章已经删除或者已被驳回
        if (CheckArticleStateIsOk.length === 0) return res.cc('文章已被删除！',404)
        // 1-1 进行驳回操作
        const UpdateArticleStateSql = `UPDATE ev_articles SET is_delete=1 where username=? AND article_id =?`
        const UpdateArticleState = await ExecuteFuncData(UpdateArticleStateSql,[cagUserName,articleId])
        if (UpdateArticleState.affectedRows !== 1) return res.cc('操作失败',500)
        res.cc('删除成功', 200)
    }
}
