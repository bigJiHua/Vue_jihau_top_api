/* 这是一个关于文章的 路由【处理模块】 */
const config = require('../config')
const ExecuteFunc = require('../Implement/ExecuteFunction')
const ExecuteFuncData = require('../Implement/ExecuteFunctionData')
const sharp = require('sharp')

// 获取文章列表
exports.article_list = async (req, res) => {
  const page = req.query.page
  if (page < 0 || page === undefined) return res.cc('参数错误', 404)
  // 每次只获取10条文章 Get only 10 articles at a time
  const GetOnly10ArticlesAtATimeSql = `SELECT 
    article_id,content,cover_img,pub_date,title,username
    FROM ev_articles where state = 0 AND is_delete = 0 ORDER BY ev_articles.id DESC limit 10 offset ?`
  const GetOnly10ArticlesAtATime = await ExecuteFuncData(
    GetOnly10ArticlesAtATimeSql,
    parseInt(page),
  )
  if (GetOnly10ArticlesAtATime.length === 0) {
    return res.status(200).send({
      status: 204,
      message: '已加载全部数据',
      data: config.SelectContent(GetOnly10ArticlesAtATime, 100),
    })
  }
  res.status(200).send({
    status: 200,
    message: '获取成功',
    data: config.SelectContent(GetOnly10ArticlesAtATime, 100),
    ismessage: false,
  })
}

// 获取文章归档 GetArticleArchive
exports.article_archive = async (req, res) => {
  const key = req.query.key
  let data = []
  const GetArticleArchiveSql = `
        SELECT YEAR(pub_date) AS year, MONTH(pub_date) AS month
        FROM ev_articles
        GROUP BY YEAR(pub_date), MONTH(pub_date)
        ORDER BY YEAR(pub_date) DESC, MONTH(pub_date) ASC;`
  data = await ExecuteFunc(GetArticleArchiveSql)
  if (req.query.type === 'get') {
    if (!key) return res.cc('参数不全')
    const SelectYearMonthListSql = `SELECT title,article_id FROM ev_articles WHERE pub_date LIKE ? AND is_delete = 0 AND state = 0  limit 15`
    const SelectYearMonthList = await ExecuteFuncData(SelectYearMonthListSql, key)
    if (SelectYearMonthList.length === 0) return res.cc('参数有误')
    data = SelectYearMonthList
  }
  res.status(200).send({
    status: 200,
    message: '获取成功',
    data,
    ismessage: false,
  })
}

// 获取通知列表
exports.getNotifyList = async (req, res) => {
  // 查询通知 未删除且根据token的username不同来确保 whosee
  const user = req.query.user
  const Num = Number(req.query.Num) >= 0 ? Number(req.query.Num) : 0
  // 获取最新10条
  const SelectAllNotifySql = `select * from ev_notify where is_delete = 0 and whosee = 0`
  const SelectNotifySql = `SELECT title, notify_id, pub_date FROM ev_notify WHERE whosee = 0 AND state = 0 AND is_delete = 0 ORDER BY pub_date DESC LIMIT 20 offset ?`
  const SelectNotify = await ExecuteFuncData(SelectNotifySql, Num)
  const SelectAllNotify = await ExecuteFunc(SelectAllNotifySql)
  if (SelectNotify.length === 0) return res.cc('暂无通知', 409)
  if (user) {
    // 检查用户身份
    const CheckUserSql = `select useridentity from ev_users where username =?`
    const CheckUser = await ExecuteFuncData(CheckUserSql, user)
    if (CheckUser.length !== 0 && CheckUser[0].useridentity === 'manager') {
      // 获取所有能看的通知 包括管理员能看的
      const SelectAllManagerNotifySql = `SELECT * from ev_notify where state = 0 AND is_delete = 0 ORDER BY pub_date DESC LIMIT 20 offset ?`
      const SelectAllManagerNotify = await ExecuteFuncData(SelectAllManagerNotifySql, Num)
      if (SelectAllManagerNotify.length === 0) return res.cc('暂无通知', 409)
      return res.status(200).send({
        message: '获取成功',
        status: 200,
        data: SelectAllManagerNotify,
        ismessage: false,
        Num: SelectAllNotify.length,
      })
    }
  }
  res.status(200).send({
    message: '获取成功',
    status: 200,
    data: SelectNotify,
    ismessage: false,
    Num: SelectAllNotify.length,
  })
}

// 查找名下的文章
exports.article_uget = async (req, res) => {
  const user = req.query.username ? req.query.username : req.auth.username
  const page = Number(req.query.page)
  const type = req.query.type
  let state = `= 0`
  if (type !== 'undefined' && type === '2') state = `!= 0`
  if (!user) return res.cc('参数错误', 404)
  // 多表联查 查找名下的文章 数据 Get the current user's articles
  const GetALlNumSql = `SELECT
    a.*,
    (SELECT COUNT(goodnum) FROM ev_userartdata u1 WHERE u1.article_id = a.article_id) AS goodNum,
    (SELECT COUNT(collect) FROM ev_userartdata u2 WHERE u2.article_id = a.article_id) AS collectNum
    FROM ev_articles a WHERE a.username = ? AND a.is_delete = 0 AND a.state ${state}`
  const GetTheCurrentUsersArticlesSql = `SELECT
    a.*,
    (SELECT COUNT(goodnum) FROM ev_userartdata u1 WHERE u1.article_id = a.article_id) AS goodNum,
    (SELECT COUNT(collect) FROM ev_userartdata u2 WHERE u2.article_id = a.article_id) AS collectNum
    FROM ev_articles a WHERE a.username = ? AND a.is_delete = 0 AND a.state ${state} limit 10 offset ?`
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
      message: '空空如也，赶快发布属于你的新文章吧！',
      data: [],
      Num: 0,
      status: 204,
    })
  res.status(200).send({
    status: 200,
    message: '获取用户文章成功',
    data: !isNaN(page)
      ? config.SelectContent(GetTheCurrentUsersArticles, 40)
      : config.SelectContent(GetALlNum, 40),
    Num: GetALlNum.length,
  })
}

// 获取用户文章
exports.article_get = async (req, res) => {
  const UID = req.query.id
  const User = req.auth.username
  if (!User) return res.cc('错误！', 401)
  const data = { article: '' }
  // 查询文章是否删除 Query whether the article is deleted
  const QueryArticleIsDeleteSql = `select id,username,title,content,cover_img,lable,keyword,article_id,describes,state
    from ev_articles where article_id=? and username = ? and is_delete=0`
  // 查询文章是否删除 Query whether the article is deleted
  const QueryArticleIsDelete = await ExecuteFuncData(QueryArticleIsDeleteSql, [UID, User])
  if (QueryArticleIsDelete.length === 0) return res.cc('404 NOT FOUNT', 404)
  data.article = QueryArticleIsDelete[0]
  res.status(200).send({
    status: 200,
    message: '获取文章成功',
    data: data,
  })
}

// 轮询检测UID
const CheckArticleIDs = async (UID) => {
  // 查询是否有重复UID
  const CheckIfThereAreDuplicateUIDsSql = `SELECT * FROM ev_articles WHERE article_id = ?`
  const CheckIfThereAreDuplicateUIDs = await ExecuteFuncData(CheckIfThereAreDuplicateUIDsSql, UID)
  return CheckIfThereAreDuplicateUIDs.length === 0 // 返回 true 如果没有重复 UID
}
// 发布文章
exports.article_put = async (req, res) => {
  const put_data = req.body
  const artIsMd = req.body.isMd === 'true'
  const message = req.body.state === '0' ? '发布文章成功' : '保存草稿成功！'
  put_data.username = req.auth.username
  put_data.pub_date = put_data.pub_date !== '' ? put_data.pub_date : config.pub_date
  put_data.pub_month = config.pub_month
  let UID = ''
  // 根据文章是否是 Markdown 来设置 UID
  if (artIsMd) {
    UID = `md${config.generateMixed(2)}` // 生成 2 位的 Markdown 文章 UID
  } else {
    UID = config.generateMixed(4) // 默认生成 4 位的 UID
  }
  const maxRetries = 5 // 最大重试次数，避免死循环
  let retries = 0
  // 检查 UID 是否唯一
  while (retries < maxRetries) {
    if (await CheckArticleIDs(UID)) {
      break // 找到唯一 UID，退出循环
    } else {
      retries++
      // 如果不是 Markdown，生成一个新的 UID
      if (artIsMd) {
        UID = `md${config.generateMixed(2)}`
      } else {
        UID = config.generateMixed(4)
      }
      console.log(`Retrying UID generation: Attempt ${retries} - New UID: ${UID}`)
    }
  }
  // 如果重试次数超过最大限制，返回错误
  if (retries >= maxRetries) {
    return res.cc('生成唯一文章 ID 失败，请稍后重试')
  }
  put_data.article_id = UID // 将最终的 UID 赋值给文章数据
  if (put_data.article_id === '') return res.cc('发布文章失败，请重新再试！', 500)
  // 删除多余的数据字段
  delete put_data.isMd
  // 插入文章到数据库
  const InsertArticleSql = `INSERT INTO ev_articles SET ?`
  const InsertArticle = await ExecuteFuncData(InsertArticleSql, put_data)

  // 检查插入是否成功
  if (InsertArticle.affectedRows !== 1) {
    return res.cc('发布文章失败，请重新再试')
  }
  // 返回成功响应
  res.status(200).send({
    status: 200,
    message: message,
    article: UID,
  })
}

// 删除文章
exports.article_del = async (req, res) => {
  const id = req.body.id
  const user = req.auth.username
  if (req.body.id === 'undefined') return res.cc('文章id不能为undefined！')
  if (!user) return res.cc('非法用户！', 401)
  // 删除文章 delete article
  const DeleteArticleSql = `update ev_articles set is_delete=1 where id=? AND username = ?`
  const DeleteArticle = await ExecuteFuncData(DeleteArticleSql, [id, user])
  if (DeleteArticle.affectedRows !== 1) return res.cc('删除文章失败，请重新再试')
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
  const CheckIfTheArticleIDIsLegalSql = `select * from ev_articles where username=? and article_id=? and id = ?`
  const CheckIfTheArticleIDIsLegal = await ExecuteFuncData(CheckIfTheArticleIDIsLegalSql, [
    username,
    artid,
    req.body.id,
  ])
  if (CheckIfTheArticleIDIsLegal.length === 0)
    return res.cc('非法用户或非法文章ID，请复制保存好您的文章数据再次提交修改', 404)
  // 更新文章内容 Update article content
  const UpdateArticleContentSql = `update ev_articles set ? where username=? and article_id=?`
  const UpdateArticleContent = await ExecuteFuncData(UpdateArticleContentSql, [
    req.body,
    username,
    artid,
  ])
  if (UpdateArticleContent.affectedRows !== 1) return res.cc('更新文章失败，请保存好数据重新提交')
  res.status(200).send({
    status: 200,
    message: '文章更新成功',
  })
}

// 获取名下图库
exports.article_image = async (req, res) => {
  const Num = Number(req.body.Num)
  const username = req.body.picusername ? req.body.picusername : req.auth.username
  if (username === 'undefined') return res.cc('用户名不能为undefined', 204)
  // 获取名下图库 get Gallery
  const getGallerySql = 'select id from ev_userimage where username=? and state=0'
  const getGalleryLimitSql = `SELECT * FROM ev_userimage 
WHERE username=? AND state=0 
ORDER BY id DESC 
LIMIT 20 OFFSET ?
`
  const getGallery = await ExecuteFuncData(getGallerySql, username)
  let getGalleryLimit = await ExecuteFuncData(getGalleryLimitSql, [username, Num])
  if (getGallery.length === 0) return res.cc('空空如也')
  return res.status(200).send({
    status: 200,
    message: '获取图片成功',
    data: getGalleryLimit,
    Num: getGallery.length,
  })
}

// 新增名下图库照片
exports.article_upimage = async (req, res) => {
  if (req.file.length === 0) res.cc('上传文件不能为空')
  // 大于5M 文件
  if (req.file.size > 5000 * 1024) return res.cc('文件太大！无法上传', 206)
  //检测用户名
  const username = req.body.username ? req.body.username : req.auth.username
  if (!username) return res.cc('参数错误！', 404)
  if (!/^image\/(jpeg|png|gif|bmp|webp|svg+xml|heic)$/.test(req.file.mimetype))
    return res.cc('不能上传非图片类的文件！', 206)
  // 自定义文件名
  const FileName = config.generateUserId(18) + '.' + req.file.originalname.split('.').pop()
  const type = req.file.originalname.split('.').pop()
  const FileNameWebp = FileName.replace('.' + type, '.webp')
  // 文件保存路径
  const Setpath = config.selpath + FileName
  const data = {
    username: username,
    userimage: Setpath,
    date: config.pub_date,
    data: config.generateUserId(12),
  }
  // 插入资源到数据库
  // 获取今日插入的照片数量
  const QueryTheNumberOfPicturesUploadedTodaySql = `SELECT * FROM ev_userimage WHERE date = CURDATE() and username=?`
  const QueryTheNumberOfPicturesUploadedToday = await ExecuteFuncData(
    QueryTheNumberOfPicturesUploadedTodaySql,
    username,
  )
  // 如果未超过 文件上限
  if (QueryTheNumberOfPicturesUploadedToday.length < config.MaxFile) {
    // buffer 是文件的二进制数据
    const buffer = req.file.buffer
    // 将二进制数据写入文件
    fs.writeFile(config.path + FileName, buffer, async (err) => {
      if (err) {
        return res.cc('存储失败，请重新再试', 406)
      } else {
        // 保存为 WebP 格式
        await sharp(buffer)
          .toFormat('webp', {
            quality: 50, // 设置压缩质量，0-100，质量越高文件越大
            lossless: false, // false 表示有损压缩，true 表示无损压缩
          })
          .toFile(config.path + FileNameWebp)
        const insertGallerySql = `insert into ev_userimage set ?`
        const insertGallery = await ExecuteFuncData(insertGallerySql, data)
        if (insertGallery.affectedRows !== 1) return res.cc('存储失败，请重新再试', 406)
        return res.cc('文件接收成功', 200)
      }
    })
  } else {
    return res.cc('今日文件上传条数已达到最大值！', 200)
  }
}

// 删除名下图库照片const
fs = require('fs')
const util = require('util')
const unlink = util.promisify(fs.unlink)
// 删除图像
exports.article_imagedel = async (req, res) => {
  const id = req.body.id
  const user = req.body.username ? req.body.username : req.auth.username
  if (!id) return res.cc('错误参数', 404)
  // 查询图片资源是否存在
  const QueryWhetherTheImageResourceExistsSql = `SELECT * FROM ev_userimage WHERE username=? AND id=?`
  // 删除图片资源
  const DeleteImageResourceSql = `DELETE FROM ev_userimage WHERE id=?`
  try {
    const QueryWhetherTheImageResourceExists = await ExecuteFuncData(
      QueryWhetherTheImageResourceExistsSql,
      [user, id],
    )
    if (QueryWhetherTheImageResourceExists.length === 0) {
      return res.cc('查询错误！', 406)
    }
    const filePath = `./public/${
      String(QueryWhetherTheImageResourceExists[0].userimage).match(/(?<=\/public\/).*/)[0]
    }`
    const type = filePath.split('.').pop()
    const FileNameWebp = filePath.replace('.' + type, '.webp')
    try {
      await unlink(filePath)
      await unlink(FileNameWebp)
    } catch (err) {
      // console.log(err);
      await ExecuteFuncData(DeleteImageResourceSql, id)
      return res.send({
        message: '系统找不到该文件/已删除',
        code: 406,
      })
    }
    const DeleteImageResource = await ExecuteFuncData(DeleteImageResourceSql, id)
    if (DeleteImageResource.affectedRows !== 1) {
      return res.cc('执行失败', 406)
    }
    return res.status(200).send({
      status: 200,
      message: '删除成功',
    })
  } catch (err) {
    return res.send({
      message: '文件系统无该文件/已删除',
      status: 406,
    })
  }
}
