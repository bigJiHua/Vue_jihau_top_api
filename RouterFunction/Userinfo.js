const bcrypt = require('bcryptjs/dist/bcrypt') // 用户信息修改密码加密
const config = require('../config')
const ExecuteFuncData = require('../Implement/ExecuteFunctionData')
const ExecuteFunc = require('../Implement/ExecuteFunction')

// 获取用户信息
exports.getUserInfo = async (req, res) => {
  const n = parseInt(req.query.n)
  // 获取所有用户数据 Get all user data
  const GetAllUserDataSql = `select * from ev_users`
  const GetAllUserData = await ExecuteFunc(GetAllUserDataSql)
  if (GetAllUserData.length === 0) return res.cc('用户数据为0', 200)
  const length = GetAllUserData.length
  // 获取限制5条用户数据 Get 5 user data limits
  const GetFiveUserDataLimitsSql = `SELECT
          ev_users.id,ev_users.username,ev_users.useridentity,
          ev_users.user_id,ev_users.sex,ev_users.city,ev_users.email,
          ev_users.user_pic,ev_users.user_content,ev_users.birthday,ev_users.state
          FROM ev_users  limit 5 offset ?`
  const GetFiveUserDataLimits = await ExecuteFuncData(
    GetFiveUserDataLimitsSql,
    n
  )
  if (GetFiveUserDataLimits.length === 0) return res.cc('数据不能再多了啦！', 204)
  res.status(200).send({
    status: 200,
    message: '获取用户信息列表成功',
    data: GetFiveUserDataLimits,
    length: length,
  })
}
// 根据用户名查数据
exports.getUserInfoUN = async (req, res) => {
  const UN = req.query.user
  const data = {}
  // 获取用户数据
  const GetUserDataSql = `select * from ev_users where username=? and state=0`
  // 查询点赞
  const sqlg = `select
    s.title,s.article_id,s.cover_img,s.username,s.content,d.id
    from ev_userartdata d,ev_articles s
    where d.article_id = s.article_id
    and d.goodnum = 1 and d.username=?`
  // 查询收藏
  const sqls = `select
    s.title,s.article_id,s.cover_img,s.username,s.content,d.id
    from ev_userartdata d,ev_articles s
    where d.article_id = s.article_id
    and d.collect = 1 and d.username=?`
  // 查询评论
  const sqlc = `select
    s.article_id,s.title,s.username,d.comment,d.pub_date,s.cover_img,d.id
    from ev_usercomment d,ev_articles s
    where d.article_id = s.article_id
    and d.username=?`
  const sqla = `select 
    * from ev_articles where username =?
    `
  data.goodnums = (await ExecuteFuncData(sqlg, UN)).length
  data.collects = (await ExecuteFuncData(sqls, UN)).length
  data.comments = (await ExecuteFuncData(sqlc, UN)).length
  data.articles = (await ExecuteFuncData(sqla, UN)).length
  const GetUserData = await ExecuteFuncData(GetUserDataSql, UN)
  data.Users = { ...GetUserData[0], password: '' }
  res.send({
    status: 200,
    message: '用户信息数据获取成功！',
    data: data,
  })
}

// 修改用户信息
exports.cagUserInfo = async (req, res) => {
  const body = req.body
  // 校验用户ID Verify User ID
  const VerifyUserIDSql = `select * from ev_users where id=? AND state =0 AND isact = 1`
  // 更新用户信息 update user information
  const updateUserInformationSql = `update ev_users set ? where id=?`
  const VerifyUserID = await ExecuteFuncData(VerifyUserIDSql,body.id)
  if (VerifyUserID.length !== 1) return res.cc('非法id,错误请求 ！')
  // if (VerifyUserID.useridentity !== body.useridentity) return res.cc('警告非法修改用户身份！',404)
  const updateUserInformation = await ExecuteFuncData(updateUserInformationSql, [body, body.id])
  if (updateUserInformation.affectedRows !== 1) return res.cc('更新用户数据失败')
  res.status(200).send({
    status: 200,
    message: '信息更改成功',
  })
}

// 修改用户密码
exports.cagUserPwd = async (req, res) => {
  const oldpwd = req.body.oldpwd
  const newpwd = req.body.newpwd
  const user = req.body.username
  // 获取当前用户密码 Get current user password
  const GetCurrentUserPasswordSql = `select password from ev_users where username=?`
  const GetCurrentUserPassword = await ExecuteFuncData(GetCurrentUserPasswordSql,user)
    if (GetCurrentUserPassword.length === 0) return res.cc('错误，请重试', 500)
    const Checkoldpwd = bcrypt.compareSync(oldpwd, GetCurrentUserPassword[0].password)
    if (!Checkoldpwd) return res.cc('修改失败，原密码错误', 401)
    const Check_nopwd = bcrypt.compareSync(newpwd, GetCurrentUserPassword[0].password)
    if (Check_nopwd) return res.cc('修改失败，原密码不能与旧密码相同', 401)
    // 更新用户密码 update user password
    const updateUserPasswordSql = `update ev_users set password=? where username=?`
    const password = bcrypt.hashSync(newpwd, 10)
    const updateUserPassword = await ExecuteFuncData(updateUserPasswordSql, [password, user])
    if (updateUserPassword.affectedRows !== 1) return res.cc('错误，请重试', 500)
    res.status(200).send({
      status: 200,
      message: '修改成功',
    })
}

// 管理员注销用户
exports.delUserInfo = async (req, res) => {
  const user = req.query.user
  const deluser = req.query.deluser
  if (user === deluser) {
    // 注销用户 logout user
    const logoutUserSql = `update ev_users set state=1 where username=? `
    const logoutUser = await ExecuteFuncData(logoutUserSql,deluser)
    if (logoutUser.length === 0) return res.cc('注销失败', 403)
    res.status(200).send({
      status: 200,
      message: '注销成功',
    })
  } else if (user && deluser) {
    // 校验用户身份 Verify user identity
    const VerifyUserIdentitySql = `select useridentity from ev_users where username=?`
    const VerifyUserIdentity = await ExecuteFuncData(VerifyUserIdentitySql,user)
    if (VerifyUserIdentity.length === 0) return res.cc('非法用户', 404)
    let uidti = JSON.parse(JSON.stringify(VerifyUserIdentity))[0].useridentity
    if (uidti === 'manager') {
      // 注销用户 logout user
      const logoutUserSql = `update ev_users set state=1 where username=? `
      const logoutUser = await ExecuteFuncData(logoutUserSql,deluser)
      if (logoutUser.length === 0) return res.cc('注销失败', 403)
      res.status(200).send({
        status: 200,
        message: '注销成功',
      })
    } else {
      res.cc('你不是管理员，无法进行此操作', 403)
    }
  } else {
    return res.cc('非法用户', 404)
  }
}

// 用户行动 点赞 收藏 评论 或者取反操作
function action(body) {
  if (body.actmenthos === 'goodnum') {
    return (data = {
      message: '点赞',
      data: {
        username: body.username,
        goodnum: 1,
        article_id: body.articleid,
      },
    })
  } else if (body.actmenthos === 'collect') {
    return (data = {
      message: '收藏',
      data: {
        username: body.username,
        collect: 1,
        article_id: body.articleid,
      },
    })
  } else if (body.actmenthos === 'comment') {
    return (data = {
      message: '评论',
      data: {
        username: body.username,
        comment: body.comment,
        article_id: body.articleid,
        pub_date: config.pub_date,
      },
    })
  }
}

function clearaction(body) {
  switch (body.actmenthos) {
    case 'goodnum':
      return (data = {
        message: '取消点赞',
        data: {
          username: body.username,
          goodnum: 0,
          article_id: body.articleid,
        },
      })
    case 'collect':
      return (data = {
        message: '取消收藏',
        data: {
          username: body.username,
          collect: 0,
          article_id: body.articleid,
        },
      })
  }
}

exports.UserActive = async (req, res) => {
  const body = req.query
  const func = body.actmenthos
  const delcomment = body.delcomment
  const articleid = body.articleid
  const data = action(body)
  const cledata = clearaction(body)
  // 如果查询的文章ID为undefined 则打回去报错
  if (articleid !== undefined) {
    // 判断func 用于区分作者是点赞收藏还是评论
    if (func === 'goodnum' || func === 'collect') {
      // 查询这个用户之前有没有操作过 （如果有操作过是可以查询到article_id的）
      // 校验用户操作 Verify user actions
      const VerifyUserActionsSql = `select article_id from ev_userartdata where username=? and article_id=?`
      const VerifyUserActions = await ExecuteFuncData(VerifyUserActionsSql, [body.username, articleid])
      // 如果没有操作过 则新插入
      if (VerifyUserActions.length === 0) {
        // 插入用户操作 InsertUserAction
        const InsertUserActionSql = 'insert into ev_userartdata set ?'
        const InsertUserAction = await ExecuteFuncData(InsertUserActionSql,data.data)
        if (InsertUserAction.affectedRows !== 1) return res.cc(`${data.message}失败`)
        res.send({
          status: 200,
          message: `${data.message}成功`,
        })
      }
      // 如果操作过 则更新之前的操作 【例如 点赞、收藏变为取消】
      if (VerifyUserActions.length > 0) {
        // 检测用户是否对该文章进行操作 Detect whether the user has acted on the article
        const DetectWhetherTheUserHasActedOnTheArticleSql = `select ${func} from ev_userartdata where username=? and article_id=?`
        const DetectWhetherTheUserHasActedOnTheArticle = await ExecuteFuncData(DetectWhetherTheUserHasActedOnTheArticleSql,[body.username, articleid])
        if (DetectWhetherTheUserHasActedOnTheArticle.length === 0) return res.cc('操作错误')
        const rval0 = JSON.parse(JSON.stringify(DetectWhetherTheUserHasActedOnTheArticle))[0]
        const k = Object.values(rval0)[0]
        // k = 1 意思就是查到的操作在该文章已经点赞过或者收藏过，则就 反向操作进行取消
        if (k === '1') {
          // 变更用户操作 change user action
          const changeUserActionSql = `update ev_userartdata set ? where username=? and article_id=?`
          const changeUserAction = await ExecuteFuncData(changeUserActionSql,[cledata.data, body.username, articleid])
          if (changeUserAction.affectedRows !== 1) return res.cc('操作失败')
          res.status(200).send({
            status: 200,
            message: cledata.message + '成功',
          })
        } else {
          /*
          *  这两个方法 更新的数据不同！！！
          * */
          // 变更用户操作 change user action
          const changeUserActionSql = `update ev_userartdata set ? where username=? and article_id=?`
          const changeUserAction = await ExecuteFuncData(changeUserActionSql,[data.data, body.username, articleid])
          if (changeUserAction.affectedRows !== 1) return res.cc('操作失败')
          res.status(200).send({
            status: 200,
            message: data.message + '成功',
          })
        }
      }
    } else if (func === 'comment') {
      if (delcomment) {
        // 删除用户评论 delete user comments
        const deleteUserCommentsSql = `delete from ev_usercomment where username=? and article_id=?`
        const deleteUserComments = await ExecuteFuncData(deleteUserCommentsSql, [body.username, articleid])
        if (deleteUserComments.affectedRows !== 1) return res.cc('删除失败')
        res.status(200).send({
          status: 200,
          message: '删除成功',
        })
      } else {
        // 插入用户评论 insert user comment
        const insertUserCommentSql = 'insert into ev_usercomment set ?'
        const insertUserComment = await ExecuteFuncData(insertUserCommentSql,data.data)
        if (insertUserComment.affectedRows !== 1) return res.cc(`${data.message}失败`)
        res.status(200).send({
          status: 200,
          message: '评论成功!',
        })
      }
    }
  } else {
    res.status(500).send({
      status: 500,
      message: '文章id错误',
    })
  }
}

// 获取当前用户的点赞和评论
exports.UserActiveData = async (req, res) => {
  const body = req.query
  const data = {}
  // 获取点赞数
  const sqlg = `select
    s.title,s.article_id,s.cover_img,s.username,s.content,d.id
    from ev_userartdata d,ev_articles s
    where d.article_id = s.article_id
    and d.goodnum = 1 and d.username=?`
  // 获取收藏
  const sqls = `select
    s.title,s.article_id,s.cover_img,s.username,s.content,d.id
    from ev_userartdata d,ev_articles s
    where d.article_id = s.article_id
    and d.collect = 1 and d.username=?`
  // 获取评论
  const sqlc = `select
    s.article_id,s.title,s.username,d.comment,d.pub_date,s.cover_img,d.id
    from ev_usercomment d,ev_articles s
    where d.article_id = s.article_id
    and d.username=?`
  // 获取点赞文章和内容
  data.goodnum = config.SelectContent(await ExecuteFuncData(sqlg, body.user),30)
  // 获取收藏
  data.collect = config.SelectContent(await ExecuteFuncData(sqls, body.user),30)
  // 获取评论
  data.comment = await ExecuteFuncData(sqlc, body.user)
  data.goodnums = data.goodnum.length
  data.collects = data.collect.length
  data.comments = data.comment.length
  res.status(200).send({
    status: 200,
    message: '获取消息成功',
    data: data,
  })
}
// 删除评论
exports.UserDelActive = async (req, res) => {
  const body = req.query
  if (body.username !== undefined) {
    const DeleteCommentSql = `delete from ev_usercomment where id=? and username=? and article_id=?`
    const DeleteComment = await ExecuteFuncData(DeleteCommentSql,[body.id, body.username, body.article_id])
    if (DeleteComment.affectedRows === 0) res.cc('删除失败', 500)
    res.status(200).send({
      status: 200,
      message: '删除成功',
    })
  } else {
    res.status(404).send({
      status: 404,
      message: '用户名不能为undefined',
    })
  }
}
