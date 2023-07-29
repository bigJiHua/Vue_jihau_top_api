/* 这是一个关于文章的 后台管理面板路由【处理模块】 */
const config = require('../../config')
const ExecuteFunc = require('../../Implement/ExecuteFunction')
const ExecuteFuncData = require('../../Implement/ExecuteFunctionData')
const CryptoJS = require('crypto-js')

// 获取文章/通知 列表
exports.SelectData = async (req, res) => {
    const GetType = req.query.type;
    const pageSize = 10; // 每页显示的文章数量
    let tableName = ''; // 数据库表名
    let stateCondition = ''; // 状态条件
    // 根据 type 设置表名和状态条件
    if (GetType === 'article') {
        tableName = 'ev_articles';
        stateCondition = ' WHERE state = 0 AND is_delete = 0';
    } else if (GetType === 'notify') {
        tableName = 'ev_notify';
        stateCondition = ' WHERE state = 0 AND is_delete = 0';
    } else if (GetType === 'wait_notify') {
        tableName = 'ev_notify';
        stateCondition = ' WHERE state = 1 AND is_delete = 0';
    }
    // 获取所有文章数目 做分页
    const GetALLArticlesAtATimeSql = `SELECT * FROM ${tableName}${stateCondition}`;
    const GetALLArticlesAtATime = await ExecuteFuncData(GetALLArticlesAtATimeSql, GetType);
    const totalCount = GetALLArticlesAtATime.length; // 文章总数

    const currentPage = req.query.Num; // 当前页码
    const offset = Math.max(0, (currentPage - 1) * pageSize);
    const limit = Math.min(totalCount - offset, pageSize);
    // 每次只获取10条文章
    const GetOnly10ArticlesAtATimeSql = `SELECT * FROM ${tableName}${stateCondition} ORDER BY ${tableName}.id ASC LIMIT ${limit} OFFSET ${offset}`;
    const GetOnly10ArticlesAtATime = await ExecuteFuncData(GetOnly10ArticlesAtATimeSql, GetType);
    if (GetOnly10ArticlesAtATime.length === 0) {
        return res.send({
            status: 204,
            message: '暂无最新数据',
            data: config.SelectContent(GetOnly10ArticlesAtATime, 30),
            totalNum: totalCount
        });
    }
    res.status(200).send({
        status: 200,
        message: '获取成功',
        data: config.SelectContent(GetOnly10ArticlesAtATime, 30),
        totalNum: totalCount
    });
}

// 获取文章/通知的详细内容
exports.getDetail = async (req, res) => {
    const type = req.query.type
    const UID = req.query.id
    const data = {
        article: '',
        comment: '',
        goodnum: 0,
        collect: 0,
    }

    let tableName = ''
    let QueryDataSql = ''

    // 根据传入的 type 值生成相应的查询语句和表名
    switch (type) {
        case 'article':
            tableName = 'ev_articles'
            QueryDataSql = `SELECT * FROM ${tableName} WHERE article_id=? AND is_delete=0`
            break
        case 'notify':
            tableName = 'ev_notify'
            QueryDataSql = `SELECT * FROM ${tableName} WHERE notify_id=? AND is_delete=0`
            break
        default:
            return res.cc('Invalid type', 400)
    }

    // 查询数据是否存在
    const QueryData = await ExecuteFuncData(QueryDataSql, UID)
    if (QueryData.length === 0) {
        return res.cc('404 NOT FOUND', 404)
    } else {
        data.article = QueryData[0]
        // 查询该数据的点赞和评论数
        const QueryDataUserOperationsSql = `SELECT ev_userartdata.goodnum, ev_userartdata.collect FROM ev_userartdata WHERE article_id=?`
        const QueryDataUserOperations = await ExecuteFuncData(QueryDataUserOperationsSql, UID)
        const newArry = JSON.parse(JSON.stringify(QueryDataUserOperations))
        for (let key in newArry) {
            data.goodnum += parseInt(newArry[key].goodnum)
            data.collect += parseInt(newArry[key].collect)
        }
        // 查询数据评论
        const QueryDataCommentsSql = `SELECT * FROM ev_usercomment WHERE article_id=?`
        data.comment = await ExecuteFuncData(QueryDataCommentsSql, UID)

        res.status(200).send({
            status: 200,
            message: '获取数据成功',
            data: data,
        })
    }
}

// 更改文章数据操作
exports.cagUPData = async (req, res) => {
    const {cagUserName, articleId, func} = req.body
    const type = req.query.type
    let tableName = ''
    let tableId = ''
    // 根据传入的 type 值生成相应的查询语句和表名
    switch (type) {
        case 'article':
            tableName = 'ev_articles'
            tableId = 'article_id'
            break
        case 'notify':
            tableName = 'ev_notify'
            tableId = 'notify_id'
            break
        default:
            return res.cc('Invalid type', 400)
    }
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
        const CheckArticleStateIsOkSql = `SELECT * from ${tableName} where username =? AND ${tableId} =? AND state=0 AND is_delete = 0`
        const CheckArticleStateIsOk = await ExecuteFuncData(CheckArticleStateIsOkSql,[cagUserName,articleId])
        // 等于空 就证明该文章已经删除或者已被驳回
        if (CheckArticleStateIsOk.length === 0) return res.cc('文章已被驳回/删除 ！',404)
        // 1-1 进行驳回操作
        const UpdateArticleStateSql = `UPDATE ${tableName} SET state=1 where username=? AND  ${tableId} =? `
        const UpdateArticleState = await ExecuteFuncData(UpdateArticleStateSql,[cagUserName,articleId])
        if (UpdateArticleState.affectedRows !== 1) return res.cc('操作失败',500)
        res.cc('已驳回', 200)
    } else if (func === 'restore') {
        // 恢复文章  ev_articles state 设置字段为0
        // 1. 检查是否正常状态
        const CheckArticleStateIsOkSql = `SELECT * from ${tableName} where username =? AND  ${tableId} =?  AND state=1 AND is_delete = 0 `
        const CheckArticleStateIsOk = await ExecuteFuncData(CheckArticleStateIsOkSql,[cagUserName,articleId])
        // 等于空 就证明该文章已经删除或者已被驳回
        if (CheckArticleStateIsOk.length === 0) return res.cc('文章正常/已被删除 ！',404)
        // 1-1 进行驳回操作
        const UpdateArticleStateSql = `UPDATE ${tableName} SET state=0 where username=? AND ${tableId} =?`
        const UpdateArticleState = await ExecuteFuncData(UpdateArticleStateSql,[cagUserName,articleId])
        if (UpdateArticleState.affectedRows !== 1) return res.cc('操作失败',500)
        res.cc('恢复成功', 200)
    }  else if (func === 'delArticle') {
        // 删除文章  ev_articles is_delete 设置字段为1
        // 1. 检查是否正常状态
        const CheckArticleStateIsOkSql = `SELECT * from ${tableName} where username =? AND ${tableId} =? AND is_delete = 0 `
        const CheckArticleStateIsOk = await ExecuteFuncData(CheckArticleStateIsOkSql,[cagUserName,articleId])
        // 等于空 就证明该文章已经删除或者已被驳回
        if (CheckArticleStateIsOk.length === 0) return res.cc('文章已被删除！',404)
        // 1-1 进行驳回操作
        const UpdateArticleStateSql = `UPDATE ${tableName} SET is_delete=1 where username=? AND ${tableId} =?`
        const UpdateArticleState = await ExecuteFuncData(UpdateArticleStateSql,[cagUserName,articleId])
        if (UpdateArticleState.affectedRows !== 1) return res.cc('操作失败',500)
        res.cc('删除成功', 200)
    }
}

// 修改用户文章
exports.cagUAData= async (req, res) => {
    const reason = req.body.reason
    const cagUser = req.auth.username
    const type = req.body.type
    let tableName = '' // 表名
    let tableId = '' // id名
    let tablevalue = '' // 表值
    const {data,id} = JSON.parse(req.body.data)
    const Secret = req.headers.authorization.substr(id, 10)
    const bytes = CryptoJS.AES.decrypt(data, Secret)
    // 更改后的数据
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
    const {article_id,notify_id,username} = decryptedData
    if (!username) return res.cc('非法请求！',404)
    switch (type) {
        case 'article':
            tableName = 'ev_articles'
            tableId = 'article_id'
            tablevalue = article_id
            break
        case 'notify':
            tableName = 'ev_notify'
            tableId = 'notify_id'
            tablevalue = notify_id
            break
        default:
            return res.cc('Invalid type', 400)
    }
    // 第一步 根据收到的文章信息ID获取未改变的数据进行存档
    const SelectSourceDataSql = `select * from ${tableName} where ${tableId}=? AND username=? AND is_delete=0`
    const SelectSourceData = await ExecuteFuncData(SelectSourceDataSql,[tablevalue,username])
    if (SelectSourceData.length === 0) return res.cc('禁止修改已被删除的文章！', 404)
    // 备份源文章
    const stubData = JSON.stringify(SelectSourceData[0])
    const BackupData = {
        username: username,
        article_id: tablevalue,
        source_article: stubData,
        cag_article: JSON.stringify(decryptedData),
        cagdate: config.pub_date,
        reason: reason,
        cagmanage: cagUser
    }
    // 第二步 检测是否被修改过
    const checkIsChangeSql = `select * from ev_caguserarticle where article_id=? AND username=?`
    const checkIsChange = await ExecuteFuncData(checkIsChangeSql,[tablevalue,username])
    if (checkIsChange.length !== 1) {
        // 未被写入过 进行写入
        // 写入备份库 insert backup
        const insertBackupSql = `insert into ev_caguserarticle set ?`
        const insertBackup = await ExecuteFuncData(insertBackupSql,BackupData)
        if(insertBackup.affectedRows !== 1) return res.cc('操作错误！请重试',404)
    } else {
        // 增加修改次数
        const UpdateStubDataSql = `UPDATE ev_caguserarticle  SET ? WHERE article_id =? AND username =? AND change_num<=30`
        const UpdateStubData = await ExecuteFuncData(UpdateStubDataSql,[BackupData,tablevalue,username])
        if (UpdateStubData.affectedRows === 0) return res.cc('操作错误！请重试',404)
    }
    await UpdateNumAndData(decryptedData,username,tableName,tablevalue,tableId,res)
}

// 复用函数，更新 修改数 以及复写源数据
async function UpdateNumAndData (decryptedData,username,tableName,tablevalue,tableId,res) {
    // 增加修改次数
    const UpChangeNumSql = `UPDATE ev_caguserarticle  SET change_num = change_num + 1  WHERE article_id =? AND username =? AND change_num<=30`
    await ExecuteFuncData(UpChangeNumSql,[tablevalue,username])
    // 更新 文章数据库里的数据
    const UpdateUserArticleSql = `UPDATE ${tableName} SET ? WHERE ${tableId} = ? AND username =? `
    const UpdateUserArticle = await ExecuteFuncData(UpdateUserArticleSql,[decryptedData,tablevalue,username])
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
        // TODO　写入ｅｒｏｏｒ表记录
        // 如果包含危险关键词，则进行相应处理（例如抛出异常、返回错误提示等）
        return res.cc('输入包含危险关键词，请重新输入。',404)
    }
    // 输入通过检查，没有包含危险关键词
    return input;
}

// 搜索文章
exports.searchArticle = async (req,res) => {
    const key = req.query.key
    const GetType = req.query.type;
    let tableName = ''; // 数据库表名
    let stateCondition = ''; // 状态条件
    let SelectId = '' // 索引ID
    // 根据 type 设置表名和状态条件
    switch (GetType) {
        case 'article':
            tableName = 'ev_articles';
            stateCondition = ' AND state = 0 AND is_delete = 0';
            SelectId = 'article_id';
            break;
        case 'notify':
            tableName = 'ev_notify';
            stateCondition = ' AND state = 0 AND is_delete = 0';
            SelectId = 'notify_id';
            break;
        case 'wait_notify':
            tableName = 'ev_notify';
            stateCondition = ' AND state = 1 AND is_delete = 0';
            SelectId = 'notify_id';
            break;
        case 'article_delete':
            tableName = 'ev_articles';
            stateCondition = ' AND is_delete = 1';
            SelectId = 'article_id';
            break;
        case 'notify_delete':
            tableName = 'ev_notify';
            stateCondition = ' AND is_delete = 1';
            SelectId = 'notify_id';
            break;
        default:
            return res.cc('Key not found', 404);
    }
    if (key.trim() === '') return res.cc('Key not found', 404)
    // 过滤后的关键词
    const filterKey = filterSqlInjection(key,res)
    const SearchQuerySql = `SELECT * FROM ${tableName} WHERE 
    (${SelectId} LIKE '%${filterKey}%' OR username LIKE '%${filterKey}%' OR content LIKE '%${filterKey}%'
    OR title LIKE '%${filterKey}%' OR pub_date LIKE '%${filterKey}%' OR lable LIKE '%${filterKey}%'
    OR keyword LIKE '%${filterKey}%')${stateCondition} `
    const SearchQuery = await ExecuteFunc(SearchQuerySql)
    if (SearchQuery.length === 0) return res.cc('什么也没找到',404)
    res.status(200).send({
        status: 200,
        message: '搜索成功！',
        data: config.SelectContent(SearchQuery,30)
    })
}

// 发布新通知
exports.postNotify = async (req, res) => {
    const put_data = req.body
    const postId = req.query.id
    put_data.pub_date = config.pub_date
    const UID = 'TZ' + config.generateMixed(3)
    if (!postId) {
        // 查询是否有重复UID Check if there are duplicate UIDs
        const CheckIfThereAreDuplicateUIDsSql = `select * from ev_notify where notify_id=?`
        const CheckIfThereAreDuplicateUIDs = await ExecuteFuncData(CheckIfThereAreDuplicateUIDsSql,UID)
        if (CheckIfThereAreDuplicateUIDs.length !== 0) return res.cc('UID重复!WARN! 备份好数据，请重新发布', 409)
        put_data.notify_id = UID
        put_data.username = req.auth.username
        // 查询是否有重复TiTle Query whether there are duplicate TiTles
        const CheckIfThereAreDuplicateTiTlesSql = `SELECT * FROM ev_notify WHERE title=?`
        const CheckIfThereAreDuplicateTiTles = await ExecuteFuncData(CheckIfThereAreDuplicateTiTlesSql,put_data.title )
        if (CheckIfThereAreDuplicateTiTles.length !== 0) return res.cc('文章已经被发布过啦！请换一个标题吧!', 409)
        // 插入文章 Insert article
        const InsertArticleSql = `insert into ev_notify set ?`
        const InsertArticle = await ExecuteFuncData(InsertArticleSql, put_data)
        if (InsertArticle.affectedRows !== 1)  return res.cc('通知失败，请重新再试',500)
        res.status(200).send({
            status: 200,
            message: '发布通知成功!',
            article: UID,
        })
    } else {
        // 检查是否 存在这个待发布的通知
        const CheckNotifyPostIDSql = `SELECT * from ev_notify where notify_id = ?`
        const CheckNotifyPostID = await ExecuteFuncData(CheckNotifyPostIDSql,postId)
        if (CheckNotifyPostID.length !== 1) return res.cc('无该通知/已删除，请去发布',404)
        if (CheckNotifyPostID[0].state ===0) return res.cc('公告已发布，请勿重新发布',409)
        // 覆盖数据
        const ChangePostNtifyStateSql = `UPDATE ev_notify set ? where notify_id = ? AND is_delete = 0`
        const ChangePostNtifyState = await ExecuteFuncData(ChangePostNtifyStateSql,[put_data,postId])
        if (ChangePostNtifyState.affectedRows !== 1) return res.cc('操作失败！请暂存后重试', 201)
        res.status(200).send({
            status: 200,
            message: '发布通知成功!',
            article: put_data.notify_id,
        })
    }
}

// 获取和设置回收站 方法
exports.getOrCageRecycle = async (req,res) =>{
    // type取决请求方式，cagid取决操作对象id/搜索id action取决采取的行动为恢复还是彻底删除
    const {cagid,type,action} = req.query
    if (!action && !type) return res.cc('操作错误',404)
    let CheckResourceExists = []
    let tableName = ''
    let tableId = ''
    switch (type) {
        case 'article': {
            tableName = 'ev_articles'
            tableId = 'article_id'
        } break;
        case 'notify': {
            tableName = 'ev_notify'
            tableId = 'notify_id'
        } break;
        default:
            return res.cc('参数错误',404)
    }
    if (cagid) {
        // 校验是否还存在
        const CheckResourceExistsSql = `SELECT * from ${tableName} where ${tableId} =? AND is_delete = 1`
        CheckResourceExists = await ExecuteFuncData(CheckResourceExistsSql,cagid)
    }
    if (action === 'get') {
        // 从ev_artictes // ev_notify表中获取删除的数据进行融合
        const SelectDataSql = `SELECT * from ${tableName} where is_delete = 1`
        const SelectData = await ExecuteFunc(SelectDataSql)
        res.status(200).send({
            message:'获取成功',
            status: 200,
            data: config.SelectContent(SelectData,30)
        })
    } else if (action === 'recover') {
        if (CheckResourceExists.length===0) return res.cc('已恢复！请勿重复操作',409)
        const recoverData = CheckResourceExists[0]
        recoverData.is_delete = 0
        // 恢复
        const resoureRecoverSql =  `UPDATE ${tableName} SET ? where ${tableId} = ?`
        const resoureRecover = await ExecuteFuncData(resoureRecoverSql,[recoverData,cagid])
        if (resoureRecover.affectedRows !== 1) return res.cc('操作失败',404)
        res.status(200).send({
            message: '恢复成功!',
            status: 200
        })
    } else if (action === 'getDetail') {
        if (CheckResourceExists.length === 0) return res.cc('数据空空',404)
        res.status(200).send({
            message: '获取成功!',
            status: 200,
            data: CheckResourceExists[0]
        })
    } else if (action === 'delete' ) {
        const deleteDataId = CheckResourceExists[0][tableId]
        const deleteId = CheckResourceExists[0].id
        // 执行DELETE语句彻底删除文章
        const deletePageDataSql = `DELETE from ${tableName} where id = ? AND ${tableId} = ?`
        const deletePageData = await ExecuteFuncData(deletePageDataSql,[deleteId,deleteDataId])
        if (deletePageData.affectedRows !== 1) return res.cc('删除失败',404)
        res.status(200).send({
            message: '删除成功！',
            status: 200
        })
    }
}
