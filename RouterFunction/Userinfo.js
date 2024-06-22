const bcrypt = require('bcryptjs/dist/bcrypt') // 用户信息修改密码加密
const config = require('../config')
const ExecuteFuncData = require('../Implement/ExecuteFunctionData')
const ExecuteFunc = require('../Implement/ExecuteFunction')

// 获取用户信息 分页
exports.getUserInfoList = async (req, res) => {
  const n = parseInt(req.query.n)
  // 获取所有用户数据 Get all user data
  const GetAllUserDataSql = `select username from ev_users`
  const GetAllUserData = await ExecuteFunc(GetAllUserDataSql)
  if (GetAllUserData.length === 0) return res.cc('用户数据为0', 200)
  const length = GetAllUserData.length
  // 获取限制5条用户数据 Get 5 user data limits
  const GetFiveUserDataLimitsSql = `SELECT
          ev_users.id,ev_users.username,ev_users.useridentity,
          ev_users.user_id,ev_users.sex,ev_users.city,ev_users.email,
          ev_users.user_pic,ev_users.user_content,ev_users.birthday,ev_users.state
          FROM ev_users  limit 5 offset ?`
  const GetFiveUserDataLimits = await ExecuteFuncData(GetFiveUserDataLimitsSql, n)
  if (GetFiveUserDataLimits.length === 0) return res.cc('数据不能再多了啦！', 204)
  res.status(200).send({
    status: 200,
    message: '获取用户信息列表成功',
    data: GetFiveUserDataLimits,
    length: length,
  })
}

// 文章面板获取用户信息
exports.authData = async (req, res) => {
  const ID = req.query.id
  if (!ID || Number(ID) === 404) return res.cc('参数错误！', 404)
  const data = {
    goodnums: 0,
    collects: 0,
    articles: 0,
    Users: {},
  }
  let UserData = []
  // 获取用户基本数据
  const GetUserDataSql = `SELECT u.username, u.user_id, u.useridentity, u.user_pic, u.user_content  
        FROM ev_users u  
        JOIN ev_articles a ON u.username = a.username  
        WHERE a.article_id = ?`
  UserData = await ExecuteFuncData(GetUserDataSql, ID)
  if (UserData.length === 0) {
    const GetTZUserDataSql = `Select u.username , u.user_id, u.useridentity, u.user_pic, u.user_content  
      FROM ev_users u  
      JOIN ev_notify a ON u.username = a.username  
      WHERE a.notify_id = ?`
    UserData = await ExecuteFuncData(GetTZUserDataSql, ID)
    if (UserData.length === 0) return res.cc('用户不存在', 404)
  }
  const UN = UserData[0].username
  const SelectGCDataSql = `SELECT
        SUM(CASE WHEN goodnum = '1' THEN 1 ELSE 0 END) AS goodnums,
        SUM(CASE WHEN collect = '1' THEN 1 ELSE 0 END) AS collects FROM ev_userartdata WHERE username = ?`
  const sqla = `select  * from ev_articles where username =?  `
  const sqlF = `select * from ev_userrelation where author =? AND relation = 1`
  const SelectGCData = await ExecuteFuncData(SelectGCDataSql, UN)
  data.goodnums = SelectGCData[0].goodnums
  data.collects = SelectGCData[0].collects
  data.articles = (await ExecuteFuncData(sqla, UN)).length
  data.Users = UserData[0]
  data.Users.fans = (await ExecuteFuncData(sqlF, UN)).length
  res.send({
    status: 200,
    message: '用户信息数据获取成功！',
    ismessage: false,
    data: data,
  })
}

// 根据用户名查数据
exports.getUserInfoUN = async (req, res) => {
  const UN = req.query.user
  const data = {}
  // 获取用户基本数据
  const GetUserDataSql = `select * from ev_users where username=?`
  // 查询点赞\收藏
  const SelectGCDataSql = `SELECT SUM(CASE WHEN goodnum = '1' THEN 1 ELSE 0 END) AS goodnums,
        SUM(CASE WHEN collect = '1' THEN 1 ELSE 0 END) AS collects FROM ev_userartdata WHERE username = ?`
  // 查询评论
  const sqlc = `select
    s.article_id,s.title,s.username,d.comment,d.pub_date,s.cover_img,d.id
    from ev_usercomment d,ev_articles s
    where d.article_id = s.article_id
    and d.username=?`
  const sqla = `select  * from ev_articles where username =?  `
  const sqlF = `select * from ev_userrelation where author =? AND relation = 1`
  const sqlP = `select * from ev_userpower where username = ?`
  const SelectGCData = await ExecuteFuncData(SelectGCDataSql, UN)
  data.goodnums = SelectGCData[0].goodnums
  data.collects = SelectGCData[0].collects
  data.comments = (await ExecuteFuncData(sqlc, UN)).length
  data.articles = (await ExecuteFuncData(sqla, UN)).length
  const GetUserData = await ExecuteFuncData(GetUserDataSql, UN)
  data.Users = { ...GetUserData[0], password: '' }
  data.Users.fans = (await ExecuteFuncData(sqlF, UN)).length
  data.Users.UserPower = (await ExecuteFuncData(sqlP, UN))[0]
  res.send({
    status: 200,
    message: '用户信息数据获取成功！',
    data: data,
    ismessage: false,
  })
}

// 修改用户信息
exports.cagUserInfo = async (req, res) => {
  const setUserID = req.body.user_id ? req.body.user_id : req.auth.user_id
  // 校验用户ID Verify User ID 以及状态
  const VerifyUserIDSql = `select * from ev_users where user_id=?`
  // 更新用户信息 update user information
  const updateUserInformationSql = `update ev_users set ? where user_id=?`
  const VerifyUserID = await ExecuteFuncData(VerifyUserIDSql, setUserID)
  if (VerifyUserID.length !== 1) return res.cc('非法id,错误请求 ！')
  if (VerifyUserID[0].isact !== 1) return res.cc('错误！账户未激活，无法修改其信息')
  if (VerifyUserID[0].state !== 0) return res.cc('错误！账户已注销，无法修改其信息')
  const cagUserData = JSON.parse(req.body.setData)
  const updateUserInformation = await ExecuteFuncData(updateUserInformationSql, [
    cagUserData,
    setUserID,
  ])
  if (updateUserInformation.affectedRows !== 1) return res.cc('更新用户数据失败')
  res.status(200).send({
    status: 200,
    message: '信息更改成功',
  })
}

// 查权限
exports.cagUserPower = async (req, res) => {
  const type = req.body.type
  const value = req.body.value === 'true' ? 1 : 0
  const user = req.auth.user_id
  // 获取现有的权限信息
  const SelectUserPowerSql = `select * from ev_userpower where user_id = ?`
  // 修改用户权限
  const ChangUserPowerSql = `UPDATE ev_userpower set ? WHERE user_id = ?`
  const SelectUserPower = await ExecuteFuncData(SelectUserPowerSql, user)
  for (const item in SelectUserPower[0]) {
    // 如果修改的状态不同
    if (item === type && SelectUserPower[0][item] !== value) {
      const data = {
        [type]: value,
      }
      const ChangUserPower = await ExecuteFuncData(ChangUserPowerSql, [data, user])
      if (ChangUserPower.affectedRows !== 1) return res.cc('修改失败!', 403)
      return res.cc('修改成功！', 200)
    }
  }
  return res.cc('权限未改变!', 403)
}

// 修改用户密码
exports.cagUserPwd = async (req, res) => {
  const oldpwd = req.body.oldpwd
  const newpwd = req.body.newpwd
  const user = req.auth.username
  if (!user) return res.cc('用户状态异常！', 404)
  // 获取当前用户密码 Get current user password
  const GetCurrentUserPasswordSql = `select password from ev_users where username=?`
  const GetCurrentUserPassword = await ExecuteFuncData(GetCurrentUserPasswordSql, user)
  if (GetCurrentUserPassword.length === 0) return res.cc('错误，请重试', 500)
  const Checkoldpwd = bcrypt.compareSync(oldpwd, GetCurrentUserPassword[0].password)
  if (!Checkoldpwd) return res.cc('修改失败，原密码错误', 404)
  const Check_nopwd = bcrypt.compareSync(newpwd, GetCurrentUserPassword[0].password)
  if (Check_nopwd) return res.cc('修改失败，原密码不能与旧密码相同', 404)
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

// 自我销户
exports.delUserInfo = async (req, res) => {
  const user = req.query.user
  const deluser = req.query.deluser
  // 如果是自己注销
  if (user === deluser) {
    // 注销用户 logout user
    const logoutUserSql = `update ev_users set state=1 where username=? `
    const logoutUser = await ExecuteFuncData(logoutUserSql, deluser)
    if (logoutUser.affectedRows === 0) return res.cc('注销失败', 404)
    res.status(200).send({
      status: 200,
      message: '注销成功！感谢您在jihau_top的陪伴！',
    })
  } else {
    return res.cc('V2版本无法对其他用户进行注销！', 200)
  }
}

// 用户操作 点赞评论收藏等
exports.UserActive = async (req, res) => {
  const username = req.auth.username
  const { articleid, type, comment } = req.body
  const timeType = type !== 'comment' && type === 'goodnum' ? 'goodtime' : 'collecttime'
  // 判断type 用于区分作者是点赞收藏还是评论
  if (type === 'goodnum' || type === 'collect') {
    // 查询这个用户之前有没有操作过 （如果有操作过是可以查询到article_id的）
    // 校验用户操作 Verify user actions
    const VerifyUserActionsSql =
      'select article_id from ev_userartdata where username=? and article_id=?'
    const VerifyUserActions = await ExecuteFuncData(VerifyUserActionsSql, [username, articleid])
    // 如果没有操作过 则新插入
    if (VerifyUserActions.length <= 0) {
      // 插入用户操作 InsertUserAction
      const InsertUserActionSql = 'insert into ev_userartdata set ?'
      const InsertUserAction = await ExecuteFuncData(InsertUserActionSql, [
        {
          username,
          article_id: articleid,
          [type]: 1,
          user_id: req.auth.user_id,
          [timeType]: new Date().getTime(),
        },
      ])
      if (InsertUserAction.affectedRows !== 1) return res.cc('失败')
      res.send({
        status: 200,
        message: `成功`,
      })
    } else {
      // 如果操作过 则更新之前的操作 【例如 点赞、收藏变为取消】
      const ChangUserArtDataSql = `UPDATE ev_userartdata SET ${type} = IF(${type} = '0', '1', '0') WHERE username = ? AND article_id = ?`
      const ChangUserArtData = await ExecuteFuncData(ChangUserArtDataSql, [username, articleid])
      if (ChangUserArtData.affectedRows !== 1) return res.cc('失败')
      // 插入用户操作时间戳
      const InsertUserTimeSql = 'update ev_userartdata set ? where username = ? and article_id = ?'
      const InsertUserTime = await ExecuteFuncData(InsertUserTimeSql, [
        {
          [timeType]: new Date().getTime(),
        },
        username,
        articleid,
      ])
      if (InsertUserTime.affectedRows !== 1) return res.cc('失败')
      res.send({
        status: 200,
        message: `成功`,
      })
    }
  } else if (type === 'comment') {
    const data = {
      username,
      comment,
      article_id: articleid,
      pub_date: config.pub_date,
      commentid: config.generateUserId(12),
    }
    // 插入用户评论 insert user comment
    const insertUserCommentSql = 'insert into ev_usercomment set ?'
    const insertUserComment = await ExecuteFuncData(insertUserCommentSql, data)
    if (insertUserComment.affectedRows !== 1) return res.cc(`评论失败`)
    res.status(200).send({
      status: 200,
      message: '评论成功!',
    })
  } else if (type === 'delcomment') {
    // 删除用户评论 delete user comments
    const deleteUserCommentsSql = 'delete from ev_usercomment where username=? and article_id=?'
    const deleteUserComments = await ExecuteFuncData(deleteUserCommentsSql, [username, articleid])
    if (deleteUserComments.affectedRows !== 1) return res.cc('删除失败')
    res.status(200).send({
      status: 200,
      message: '删除评论成功',
    })
  }
}

// 获取当前用户的点赞和评论
exports.UserActiveData = async (req, res) => {
  // TODO 分页
  const user = req.query.user
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
  data.goodnum = config.SelectContent(await ExecuteFuncData(sqlg, user), 30)
  // 获取收藏
  data.collect = config.SelectContent(await ExecuteFuncData(sqls, user), 30)
  // 获取评论
  data.comment = await ExecuteFuncData(sqlc, user)
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
    const DeleteComment = await ExecuteFuncData(DeleteCommentSql, [
      body.id,
      body.username,
      body.article_id,
    ])
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

// Space页面获取的数据
exports.getSpaceData = async (req, res) => {
  const { isSelf, UserData } = req.body
  res.send({
    status: 200,
    message: '获取成功',
    data: {
      isSelf,
      UserData,
    },
  })
}

// 构建用户关系
exports.postUserRelation = async (req, res) => {
  // 只用传一个参数 那就是 author 要对谁操作
  const author = req.body.author
  const username = req.auth.username
  const data = {
    author,
    author_id: '',
    username,
    relation: 0,
    user_id: req.auth.user_id,
    pub_date: new Date().getTime(),
  }
  if (!author) return res.cc('参数异常', 404)
  if (!username) return res.cc('参数异常', 404)
  if (author === username) return res.cc('你很酷，但是不能自己哟！', 404)
  // 查关系型数据库表是否存在关系
  const SelectUserRelationSql = `select * from ev_userrelation where author = ? and username = ?`
  const SelectUserRelation = await ExecuteFuncData(SelectUserRelationSql, [author, username])
  // 获取author目标用户的id
  const SelectAuthorIdSql = `select user_id from ev_users where username = ?`
  const SelectAuthorId = await ExecuteFuncData(SelectAuthorIdSql, author)
  if (SelectAuthorId.length === 0) return res.cc('用户不存在', 404)
  data.author_id = SelectAuthorId[0].user_id
  // 如果没有历史关系就添加
  if (SelectUserRelation.length === 0) {
    const InsertUserRelationSql = `insert into ev_userrelation set ?`
    const InsertUserRelation = await ExecuteFuncData(InsertUserRelationSql, data)
    if (InsertUserRelation.affectedRows !== 1) return res.cc('操作失败', 500)
    res.send({
      status: 200,
      message: '操作成功',
    })
  } else {
    // 如果有历史关系就修改
    const PatchUserRelationSql = `
          UPDATE ev_userrelation
          SET relation = CASE
                           WHEN relation = 0 THEN 1
                           WHEN relation = 1 THEN 0
                         END,
              pub_date = UNIX_TIMESTAMP(CURRENT_TIMESTAMP(3)) * 1000
          WHERE author = ? AND username = ?`
    const PatchUserRelation = await ExecuteFuncData(PatchUserRelationSql, [author, username])
    if (PatchUserRelation.affectedRows !== 1) return res.cc('操作失败', 500)
    res.send({
      status: 200,
      message: '操作成功',
    })
  }
}

// 查询用户关系
exports.getUserRelation = async (req, res) => {
  const { author, met } = req.query
  const Num = Number(req.query.Num)
  const username = req.auth.username
  let relation = false
  if (!author) return res.cc('参数异常', 404)
  if (met === 'get' && author === username) return res.cc('参数异常', 404)
  let SelectUserRelationSql = ''
  let SelectUserRelation = []
  switch (met) {
    // 获取关系
    case 'get': {
      SelectUserRelationSql = `select * from ev_userrelation where author = ? and username = ?`
      break
    }
    // 获取关注列表
    case 'conlist': {
      SelectUserRelationSql = `
          SELECT UD.username, UD.user_id, UD.user_pic, UD.user_content
          FROM ev_userrelation URL
          INNER JOIN ev_users UD ON URL.author = UD.username
          WHERE URL.author = ? AND URL.relation = 0
          LIMIT 10 OFFSET ?`
      break
    }
    // 获取粉丝列表
    case 'Beflist': {
      SelectUserRelationSql = `
          SELECT UD.username, UD.user_id, UD.user_pic, UD.user_content
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
  if (met === 'get') {
    SelectUserRelation = await ExecuteFuncData(SelectUserRelationSql, [author, username])
  } else {
    SelectUserRelation = await ExecuteFuncData(SelectUserRelationSql, [author, Num])
  }
  // 如果查询为空
  if (SelectUserRelation.length === 0)
    return res.send({
      status: 200,
      message: '获取成功',
      ismessage: false,
      data: {
        relation: false,
        conlist: met === 'conlist' ? SelectUserRelation : [],
        Beflist: met === 'Beflist' ? SelectUserRelation : [],
      },
    })
  relation = SelectUserRelation[0].relation === 0
  // 如果不为空
  res.send({
    status: 200,
    message: '获取成功',
    ismessage: false,
    data: {
      relation,
      conlist: met === 'conlist' ? SelectUserRelation : [],
      Beflist: met === 'Beflist' ? SelectUserRelation : [],
    },
  })
}

// 用户消息列表
exports.UserMessageHandler = async (req, res) => {
  const userId = req.auth.user_id
  const Num = Number(req.query.Num)
  if (!userId) return res.cc('参数错误！', 401)
  // 获取消息并且做分页
  // 获取用户消息
  const SelectUserMessageBytodaySql = `
    SELECT u.username AS sendU,u.user_pic AS sendUP,u1.user_pic AS getUp,u1.username AS getU,um.type, um.title, um.content, um.pub_date, um.id, um.state
    FROM ev_usermsg um
    JOIN ev_users u ON um.senduser = u.user_id
    JOIN ev_users u1 ON um.getuser = u1.user_id
    WHERE um.is_delete = 0 AND u.state = 0 AND um.getuser = ?
    LIMIT 10 OFFSET ?`
  const SelectUserMessageBytoday = await ExecuteFuncData(SelectUserMessageBytodaySql, [userId, Num])
  // 获取全体用户消息
  const SelectAllSystemMessageBytodaySql = `Select * from ev_sitemsg where getuser = 'all' limit 10 offset ?`
  const SelectAllSystemMessageBytoday = await ExecuteFuncData(SelectAllSystemMessageBytodaySql, Num)
  // 获取系统对用户发送的消息
  const SelectSystemMessageBytodaySql = `Select * from ev_sitemsg where getuser = ? limit 10 offset ?`
  const SelectSystemMessageBytoday = await ExecuteFuncData(SelectSystemMessageBytodaySql, [
    userId,
    Num,
  ])
  res.send({
    status: 200,
    message: '获取消息成功',
    ismessage: false,
    data: {
      usermsg: SelectUserMessageBytoday,
      systemmsg: [...SelectAllSystemMessageBytoday, ...SelectSystemMessageBytoday],
    },
  })
}

// 用户删除消息
exports.ChangeMessageHandler = async (req, res) => {
  const id = req.body.id
  const user = req.auth.user_id
  const type = req.body.type
  let setData = ''
  if (type === 'read') {
    setData = 'state = 1'
  } else if (type === 'delete') {
    setData = 'is_delete = 1'
  }
  let UpdateMessageSql = `update ev_usermsg set ${setData} where id = ? and getuser = ?`
  await ExecuteFuncData(UpdateMessageSql, [id, user]).then((result) => {
    if (result.affectedRows !== 1) return res.cc('删除失败', 404)
  })
  res.cc('成功', 200)
}

exports.authArticleData = async (req, res) => {
  const { user, Num } = req.body
  if (!user) return res.cc('参数异常', 404)
  const num = Number(Num)
}
