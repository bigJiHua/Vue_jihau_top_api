/* 这是一个关于文章的 后台管理面板路由【处理模块】 */
const config = require('../../config')
const ExecuteFunc = require('../../Implement/ExecuteFunction')
const ExecuteFuncData = require('../../Implement/ExecuteFunctionData')
const CryptoJS = require('crypto-js')

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

// 修改用户文章
exports.cagUAData= async (req, res) => {
    const reason = req.body.reason
    const cagUser = req.auth.username
    const {data,id} = JSON.parse(req.body.data)
    const Secret = req.headers.authorization.substr(id, 10)
    const bytes = CryptoJS.AES.decrypt(data, Secret)
    // 更改后的数据
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
    const {article_id, username} = decryptedData
    // 第一步 根据收到的文章信息ID获取未改变的数据进行存档
    const SelectSourceDataSql = `select * from ev_articles where article_id=? AND username=? AND is_delete=0`
    const SelectSourceData = await ExecuteFuncData(SelectSourceDataSql,[article_id,username])
    if (SelectSourceData.length === 0) return res.cc('禁止修改已被删除的文章！', 404)
    // 备份源文章
    const stubData = JSON.stringify(SelectSourceData[0])
    const BackupData = {
        username: username,
        article_id: article_id,
        source_article: stubData,
        cag_article: JSON.stringify(decryptedData),
        cagdate: config.pub_date,
        reason: reason,
        cagmanage: cagUser
    }
    // 第二步 检测是否被修改过
    const checkIsChangeSql = `select * from ev_caguserarticle where article_id=? AND username=?`
    const checkIsChange = await ExecuteFuncData(checkIsChangeSql,[article_id,username])
    if (checkIsChange.length !== 1) {
        // 未被写入过 进行写入
        // 写入备份库 insert backup
        const insertBackupSql = `insert into ev_caguserarticle set ?`
        const insertBackup = await ExecuteFuncData(insertBackupSql,BackupData)
        if(insertBackup.affectedRows !== 1) return res.cc('操作错误！请重试',404)
        await UpdateNumAndData(decryptedData,article_id,username,res)
    } else {
        // 增加修改次数
        const UpdateStubDataSql = `UPDATE ev_caguserarticle  SET ? WHERE article_id =? AND username =? AND change_num<=30`
        const UpdateStubData = await ExecuteFuncData(UpdateStubDataSql,[BackupData,article_id,username])
        if (UpdateStubData.affectedRows === 0) return res.cc('操作错误！请重试',404)
        await UpdateNumAndData(decryptedData,article_id,username,res)
    }
}
// 复用函数，更新 修改数 以及复写源数据
async function UpdateNumAndData (decryptedData,article_id,username,res) {
    // 增加修改次数
    const UpChangeNumSql = `UPDATE ev_caguserarticle  SET change_num = change_num + 1  WHERE article_id =? AND username =? AND change_num<=30`
    await ExecuteFuncData(UpChangeNumSql,[article_id,username])
    // 更新 文章数据库里的数据
    const UpdateUserArticleSql = `UPDATE ev_articles SET ? WHERE article_id =? AND username =? `
    const UpdateUserArticle = await ExecuteFuncData(UpdateUserArticleSql,[decryptedData,article_id,username])
    if (UpdateUserArticle.affectedRows !== 1) return res.cc('修改失败',404)
    res.status(200).send({
        status: 200,
        message: '修改成功！'
    })
}

// 搜索功能过滤关键词
function filterSqlInjection(input,res) {
    // 定义要过滤的危险关键词的正则表达式
    const dangerousKeywords = /(\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE){0,1}|INSERT( +INTO){0,1}|MERGE|REPLACE|SELECT( +DISTINCT){0,1}|TRUNCATE|UPDATE)\b|\b(UNION( +ALL){0,1}|AND|OR|NOT|LIKE)\b)/i;
    // 检查输入是否包含危险关键词
    if (dangerousKeywords.test(input)) {
        // 如果包含危险关键词，则进行相应处理（例如抛出异常、返回错误提示等）
        return res.cc('输入包含危险关键词，请重新输入。',404)
    }
    // 输入通过检查，没有包含危险关键词
    return input;
}

// 搜索文章
exports.searchArticle = async (req,res) => {
    const key = req.query.key
    if (key.trim() === '') return res.cc('Key not found', 404)
    // 过滤后的关键词
    const filterKey = filterSqlInjection(key,res)
    const SearchQuerySql = `SELECT * FROM ev_articles WHERE 
    article_id LIKE '%${filterKey}%' OR username LIKE '%${filterKey}%' OR content LIKE '%${filterKey}%'
    OR title LIKE '%${filterKey}%' OR pub_date LIKE '%${filterKey}%' OR lable LIKE '%${filterKey}%'
    OR keyword LIKE '%${filterKey}%' OR article_cate = '%${filterKey}%' LIMIT 0, 25;`
    const SearchQuery = await ExecuteFunc(SearchQuerySql)
    if (SearchQuery.length === 0) return res.cc('什么也没找到',204)
    res.status(200).send({
        status: 200,
        message: '搜索成功！',
        data: config.SelectContent(SearchQuery,30)
    })
}
