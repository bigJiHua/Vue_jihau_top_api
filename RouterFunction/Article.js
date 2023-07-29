/* 这是一个关于文章的 路由【处理模块】 */
const config = require('../config')
const ExecuteFunc = require('../Implement/ExecuteFunction')
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
// 获取文章列表
exports.article_list = async (req, res) => {
  const page = req.query.page
  // 搜索用的ALL
  if (page === 'all') {
    // 获取所有未删除的文章 Get all but deleted articles
    const GetAllButDeletedArticlesSql = `SELECT 
 article_id,content,lable,keyword,pub_date,pub_month,title,username FROM ev_articles where is_delete=0`
    const GetAllButDeletedArticles = await ExecuteFunc( GetAllButDeletedArticlesSql )
    if (GetAllButDeletedArticles.length === 0) {
      return res.status(204).send({
        status: 204,
        message: '数据库为空'
      })
    }
    res.status(200).send({
      status: 200,
      message: '获取成功',
      data: config.SelectContent(GetAllButDeletedArticles, 30),
    })
  } else {
    // 每次只获取10条文章 Get only 10 articles at a time
    const GetOnly10ArticlesAtATimeSql = `SELECT 
    article_id,content,cover_img,pub_date,title,username
    FROM ev_articles where is_delete=0 AND state=0 ORDER BY ev_articles.id DESC limit 10 offset ?`
    const GetOnly10ArticlesAtATime = await ExecuteFuncData(GetOnly10ArticlesAtATimeSql, parseInt(page))
    if (GetOnly10ArticlesAtATime.length === 0) {
      return res.status(200).send({
        status: 204,
        message: '已加载全部数据',
        data:  config.SelectContent(GetOnly10ArticlesAtATime,100),
      })
    }
    res.status(200).send({
      status: 200,
      message: '获取成功',
      data: config.SelectContent(GetOnly10ArticlesAtATime,100),
    })
  }
}

// 获取文章归档 GetArticleArchive
exports.article_archive = async (req, res) => {
  const GetArticleArchiveSql = `select * from ev_articles where is_delete=0`
  const GetArticleArchive = await ExecuteFunc(GetArticleArchiveSql)
  const newArry = []
  GetArticleArchive.forEach((item) => {
    const [year, month, day] = item.pub_date.split('-');
    const obj = {
      id: item.id,
      month: item.pub_month,
      title: item.title,
      hurl: item.article_id,
      year: Number(year)
    }
    newArry.push(obj)
  })
  res.status(200).send({
    status: 200,
    message: '获取成功',
    data: newArry,
  })
}

// 获取通知列表
exports.getNotifyList = async (req, res) => {
  // 查询通知 未删除且根据token的username不同来确保 whosee
  const user = req.query.user
  const SelectNotifySql = `SELECT title,notify_id,pub_date from ev_notify where whosee = 0 AND state = 0 AND is_delete = 0`
  const SelectNotify = await ExecuteFunc(SelectNotifySql)
  if (SelectNotify.length ===0) return res.cc('暂无通知',409)
  if (user) {
    // 检查用户身份
    const CheckUserSql = `select useridentity from ev_users where username =?`
    const CheckUser = await ExecuteFuncData(CheckUserSql,user)
    if (CheckUser[0].useridentity === 'manager') {
      // 获取所有能看的通知 包括管理员能看的
      const SelectAllNotifySql = `SELECT * from ev_notify where state = 0 AND is_delete = 0`
      const SelectAllNotify = await ExecuteFunc(SelectAllNotifySql)
      if (SelectAllNotify.length ===0) return res.cc('暂无通知',409)
      res.status(200).send({
        message: '获取成功',
        status: 200,
        data: SelectAllNotify
      })
    } else  {
      res.status(200).send({
        message: '获取成功',
        status: 200,
        data: SelectNotify
      })
    }
  } else  {
    res.status(200).send({
      message: '获取成功',
      status: 200,
      data: SelectNotify
    })
  }
}

// 查找名下的文章
exports.article_uget = async (req, res) => {
  const user = req.query.username
  if (!user) return res.cc('参数错误',404)
  // 查找名下的文章 Get the current user's articles
  const GetTheCurrentUsersArticlesSql = `SELECT
    article_id,id,is_delete,keyword,lable,pub_date,pub_month,state,title,username,read_num
    FROM ev_articles WHERE username=? AND is_delete=0`
  const GetTheCurrentUsersArticles = await ExecuteFuncData(
    GetTheCurrentUsersArticlesSql,
    user
  )
  if (GetTheCurrentUsersArticles.length === 0)
    return res.cc('空空如也，赶快发布属于你的新文章吧！')
  res.status(200).send({
    status: 200,
    message: '获取用户文章成功',
    data: GetTheCurrentUsersArticles,
  })
}

// 发布文章
exports.article_put = async (req, res) => {
  const put_data = req.body
  put_data.pub_date = config.pub_date
  put_data.pub_month = config.pub_month
  const UID = config.generateMixed(4)
  // 查询是否有重复UID Check if there are duplicate UIDs
  const CheckIfThereAreDuplicateUIDsSql = `select * from ev_articles where article_id=?`
  const CheckIfThereAreDuplicateUIDs = await ExecuteFuncData(
    CheckIfThereAreDuplicateUIDsSql,
    UID
  )
  if (CheckIfThereAreDuplicateUIDs.length !== 0)
    return res.cc('UID重复!WARN! 备份好数据，请重新发布', 204)
  put_data.article_id = UID
  // 查询是否有重复TiTle Query whether there are duplicate TiTles
  const CheckIfThereAreDuplicateTiTlesSql = `SELECT * FROM ev_articles WHERE title=?`
  const CheckIfThereAreDuplicateTiTles = await ExecuteFuncData(
    CheckIfThereAreDuplicateTiTlesSql,
    put_data.title
  )
  if (CheckIfThereAreDuplicateTiTles.length !== 0) return res.cc('文章已经被发布过啦！请换一个标题吧!', 204)
  // 插入文章 Insert article
  const InsertArticleSql = `insert into ev_articles set ?`
  const InsertArticle = await ExecuteFuncData(InsertArticleSql, put_data)
  if (InsertArticle.affectedRows !== 1)  return res.cc('发布文章失败，请重新再试')
  res.status(200).send({
    status: 200,
    message: '发布文章成功!',
    article: UID,
  })
}

// 删除文章
exports.article_del = async (req, res) => {
  // 删除文章 delete article
  const DeleteArticleSql = `update ev_articles set is_delete=1 where id=?`
  const DeleteArticle = await ExecuteFuncData(DeleteArticleSql, req.body.id)
  if (DeleteArticle.affectedRows !== 1)
    return res.cc('删除文章失败，请重新再试')
  res.send({
    status: 200,
    message: '删除成功!',
  })
}

// 更改文章
exports.article_cag = async (req, res) => {
  const username = req.body.username
  const artid = req.body.article_id
  // 查询文章ID是否合法 Check if the article ID is legal
  const CheckIfTheArticleIDIsLegalSql = `select * from ev_articles where username=? and article_id=?`
  const CheckIfTheArticleIDIsLegal = await ExecuteFuncData(
    CheckIfTheArticleIDIsLegalSql,
    [username, artid]
  )
  if (CheckIfTheArticleIDIsLegal.length === 0)
    return res.cc('非法用户或非法文章ID，请复制保存好您的文章数据再次提交修改')
  // 更新文章内容 Update article content
  const UpdateArticleContentSql = `update ev_articles set ? where username=? and article_id=?`
  const UpdateArticleContent = await ExecuteFuncData(UpdateArticleContentSql, [
    req.body,
    username,
    artid,
  ])
  if (UpdateArticleContent.affectedRows !== 1)
    return res.cc('更新文章失败，请保存好数据重新提交')
  res.status(200).send({
    status: 200,
    message: '文章更新成功',
  })
}

// 获取名下图库
exports.article_image = async (req, res) => {
  const username = req.body.picusername
  if (username === 'undefined') return res.cc('用户名不能为undefined', 204)
  // 获取名下图库 get Gallery
  const getGallerySql = 'select * from ev_userimage where username=? and state=0'
  const getGallery = await ExecuteFuncData(getGallerySql, username)
  if (getGallery.length === 0) return res.cc('空空如也')
  res.status(200).send({
    status: 200,
    message: '获取图片成功',
    data: getGallery,
  })
}

// 新增名下图库照片
exports.article_upimage = async (req, res) => {
  const path = config.selpath + req.file.originalname
  const username = req.body.username
  if (req.file.length === 0) res.cc('上传文件不能为空')
  const data = {
    username: username,
    userimage: path,
    date: config.pub_date
  }
  // 插入资源
  const QueryTheNumberOfPicturesUploadedTodaySql = `SELECT * FROM ev_userimage WHERE date = CURDATE() and username=?`
  const QueryTheNumberOfPicturesUploadedToday = await ExecuteFuncData(QueryTheNumberOfPicturesUploadedTodaySql,username)
  if (QueryTheNumberOfPicturesUploadedToday.length <= config.MaxFile) {
    const insertGallerySql = `insert into ev_userimage set ?`
    const insertGallery = await ExecuteFuncData(insertGallerySql, data)
    if (insertGallery.affectedRows !== 1) return res.cc('存储失败，请重新再试', 406)
    return res.cc('文件接收成功',200)
  } else {
    return res.cc('今日文件上传条数已达到最大值！', 204)
  }
}

// 删除名下图库照片
exports.article_imagedel = async (req, res) => {
  const body = req.body
  // 查询图片资源是否存在 Query whether the image resource exists
  const QueryWhetherTheImageResourceExistsSql = `select * from ev_userimage where username=? and id=?`
  // 删除图片资源 delete image resource
  const DeleteImageResourceSql = `delete from ev_userimage where id=?`

  const QueryWhetherTheImageResourceExists = await ExecuteFuncData(
    QueryWhetherTheImageResourceExistsSql,
    [body.picusername, body.id]
  )
  if (QueryWhetherTheImageResourceExists.length === 0)
    return res.cc('查询错误！', 406)
  const DeleteImageResource = await ExecuteFuncData(
    DeleteImageResourceSql,
    body.id
  )
  if (DeleteImageResource.affectedRows !== 1) return res.cc('删除失败', 406)
  res.status(200).send({
    status: 200,
    message: '删除成功',
  })
}

