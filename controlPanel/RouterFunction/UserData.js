/* 这是一个关于文章的 后台管理面板路由【处理模块】 */
const config = require('../../config')
const bcrypt = require('bcryptjs/dist/bcrypt')
const ExecuteFunc = require('../../Implement/ExecuteFunction')
const ExecuteFuncData = require('../../Implement/ExecuteFunctionData')
const { CheckUserIdentity } = require('../../Implement/middleware/CheckUserMiddleware')

// 获取用户/管理员/注销账户/未激活 列表
exports.ChangeAndGetUsersData = async (req, res) => {
  const GetType = req.query.type
  const pageSize = 10 // 每页显示的数量
  let stateCondition = '' // 状态条件
  // 根据 type 设置表名和状态条件
  if (GetType === 'user') {
    stateCondition = ' WHERE useridentity = "user" AND state = 0 AND isact = 1'
  } else if (GetType === 'manager') {
    stateCondition = ' WHERE useridentity = "manager" AND state = 0 AND isact = 1'
  } else if (GetType === 'deleteUser') {
    stateCondition = ' WHERE state = 1'
  } else if (GetType === 'notact') {
    stateCondition = ' WHERE isact = 0'
  }
  // 获取所有用户数目 做分页
  const GetALLArticlesAtATimeSql = `SELECT * FROM ev_users ${stateCondition}`
  const GetALLArticlesAtATime = await ExecuteFuncData(GetALLArticlesAtATimeSql, GetType)
  const totalCount = GetALLArticlesAtATime.length // 总数
  const currentPage = req.query.Num // 当前页码
  const offset = Math.max(0, (currentPage - 1) * pageSize)
  const limit = Math.min(totalCount - offset, pageSize)
  // 每次只获取10条用户数据
  const GetOnly10ArticlesAtATimeSql = `SELECT birthday,email,registerDate,sex,user_content,user_id,user_pic,useridentity,username FROM ev_users ${stateCondition} ORDER BY ev_users.id ASC LIMIT ${limit} OFFSET ${offset}`
  const GetOnly10ArticlesAtATime = await ExecuteFuncData(GetOnly10ArticlesAtATimeSql, GetType)
  if (GetOnly10ArticlesAtATime.length === 0) {
    return res.send({
      status: 204,
      message: '暂无最新数据',
      data: config.SelectContent(GetOnly10ArticlesAtATime, 30),
      totalNum: totalCount,
    })
  }
  res.status(200).send({
    status: 200,
    message: '获取成功',
    data: config.SelectContent(GetOnly10ArticlesAtATime, 30),
    totalNum: totalCount,
  })
}

//TODO 获取用户日志 暂未开发
exports.GetUserLogData = async (req, res) => {
  // TODO 给管面板获取上次登录的日期
  // TODO 给管面板查询登录日志功能
  // SELECT * FROM `ev_login_log` ORDER BY `ev_login_log`.`login_time` DESC
  const { type, id } = req.query
}

// 获取用户信息
exports.getUserInfoUN = async (req, res) => {
  // 无需用户名 根据token里的用户名进行获取个信
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
  data.Users.UserPower = await ExecuteFuncData(sqlP, UN)
  res.send({
    status: 200,
    message: '用户信息数据获取成功！',
    data: data,
    ismessage: false,
  })
}

// 修改用户信息
exports.CagUesrData = async (req, res) => {
  if (req.body.type === null || req.body.type === '' || req.body.type === undefined)
    return res.cc('参数错误')
  const cagData = JSON.parse(req.body.data)
  const cagKey = Object.keys(cagData)[0]
  // 校验用户ID Verify User ID 以及状态
  const VerifyUserIDSql = `select * from ev_users where user_id=?`
  // 更新用户信息 update user information
  const updateUserInformationSql = `update ev_users set ? where user_id=?`
  const VerifyUserID = await ExecuteFuncData(VerifyUserIDSql, req.body.id)
  if (VerifyUserID.length !== 1) return res.cc('非法id,错误请求 ！')
  if (req.body.type === 'cag') {
    if (!(VerifyUserID[0][cagKey] === cagData[cagKey])) {
      const updateUserInformation = await ExecuteFuncData(updateUserInformationSql, [
        cagData,
        req.body.id,
      ])
      if (updateUserInformation.affectedRows !== 1) return res.cc('更新用户数据失败')
    } else {
      return res.cc('修改数据未发生改变！')
    }
    res.status(200).send({
      status: 200,
      message: '信息更改成功',
    })
  } else if (req.body.type === 'resetpwd') {
    // if (req.auth.useridentity === VerifyUserID[0].useridentity) return res.cc('错误！管理员不可在此重置自己的密码！！！', 404)
    cagData.password = bcrypt.hashSync('123456Abc', 10)
    const updateUserInformation = await ExecuteFuncData(updateUserInformationSql, [
      cagData,
      req.body.id,
    ])
    if (updateUserInformation.affectedRows !== 1) return res.cc('更新用户数据失败')
    res.status(200).send({
      status: 200,
      message: '密码已成功重置为123456Abc',
    })
  } else if (req.body.type === 'deluser') {
    if (req.auth.useridentity === VerifyUserID[0].useridentity)
      return res.cc('错误！管理员不能注销管理员账号！！！', 404)
    cagData.state = 1
    const updateUserInformation = await ExecuteFuncData(updateUserInformationSql, [
      cagData,
      req.body.id,
    ])
    if (updateUserInformation.affectedRows !== 1) return res.cc('更新用户数据失败')
    res.status(200).send({
      status: 200,
      message: '用户注销成功！如需恢复请到注销面板',
    })
  } else if (req.body.type === 'reac') {
    cagData.state = 0
    const updateUserInformation = await ExecuteFuncData(updateUserInformationSql, [
      cagData,
      req.body.id,
    ])
    if (updateUserInformation.affectedRows !== 1) return res.cc('更新用户数据失败')
    res.status(200).send({
      status: 200,
      message: '账户恢复成功！',
    })
  } else if (req.body.type === 'acti') {
    if (VerifyUserID[0].isact !== 0) return res.cc('操作错误！该账户已激活！')
    cagData.isact = 1
    const updateUserInformation = await ExecuteFuncData(updateUserInformationSql, [
      cagData,
      req.body.id,
    ])
    if (updateUserInformation.affectedRows !== 1) return res.cc('更新用户数据失败')
    res.status(200).send({
      status: 200,
      message: '账户激活成功！',
    })
  }
}

// 修改和查询用户权限
exports.CagUesrPower = async (req, res) => {
  let { data, user } = req.body
  data = JSON.parse(data)
  const type = req.query.type
  let cagPowerActionSql = ``
  let cagPowerAction = {}
  switch (type) {
    case 'get':
      cagPowerActionSql = `SELECT * FROM ev_userpower WHERE username = ?`
      cagPowerAction = await ExecuteFuncData(cagPowerActionSql, user)
      // 用户不在权限表那就增加权限表
      if (cagPowerAction.length === 0) {
        const AddUserPowerActionSql = `INSERT INTO ev_userpower (username, user_id, isadmin)  
                SELECT username, user_id,   
                       CASE WHEN useridentity = 'manager' THEN 1 ELSE 0 END AS isadmin  
                FROM ev_users  
                WHERE username = ?`
        const AddUserPowerAction = await ExecuteFuncData(AddUserPowerActionSql, user)
        if (AddUserPowerAction.affectedRows === 0) return res.cc('查询错误!')
        cagPowerAction = await ExecuteFuncData(cagPowerActionSql, user)
      }
      res.status(200).send({
        message: false,
        data: cagPowerAction[0],
      })
      break
    case 'cag':
      cagPowerActionSql = `Update ev_userpower SET ? where username = ?`
      cagPowerAction = await ExecuteFuncData(cagPowerActionSql, [data, user])
      if (cagPowerAction.affectedRows !== 1) return res.cc('操作失败！请重试')
      if (Object.keys(data)[0] === 'isadmin') {
        let cagUserIdentitySql = ``
        let cagUserIdentity = {}
        switch (Object.values(data)[0]) {
          case 1:
            cagUserIdentitySql = `Update ev_users set useridentity = 'manager' where username = ? AND useridentity='user' AND state = 0 AND isact = 1`
            cagUserIdentity = await ExecuteFuncData(cagUserIdentitySql, user)
            if (cagUserIdentity.affectedRows !== 1) return res.cc('已经是管理员了')
            return res.cc('设置管理员身份成功！', 200)
          case 0:
            cagUserIdentitySql = `Update ev_users set useridentity = 'user' where username = ? AND useridentity='manager' AND state = 0 AND isact = 1`
            cagUserIdentity = await ExecuteFuncData(cagUserIdentitySql, user)
            if (cagUserIdentity.affectedRows !== 1) return res.cc('已经是用户了')
            return res.cc('取消管理员身份成功！', 200)
          default:
            return
        }
      }
      res.cc('修改成功！', 200)
      break
    case 'check':
      const name = req.auth.username
      const pwd = data.pwd
      const isTrue = await CheckUserIdentity(name, pwd)
      if (!isTrue)
        return res.status(202).send({
          message: '校验密码错误！',
          status: 202,
          isTrue: false,
        })
      res.status(200).send({
        message: '校验成功！',
        status: 200,
        isTrue: true,
      })
      break
    default:
      return res.cc('类型错误！')
  }
}

// 发送站内信处理
exports.sendMessage = async (req, res) => {
  const { type, title, senduser, getuser, content, label } = req.body
  const sendUser = req.auth.username
  if (!sendUser) return res.cc('参数错误！', 404)
  const data = {
    type,
    title,
    senduser,
    getuser,
    label,
    content: config.filterSqlInjection(content, res),
    pub_date: new Date().getTime(),
  }
  let SelectTable = 'ev_sitemsg'
  // 单发用户
  if (getuser !== 'all' && req.auth.user_id) {
    if (!getuser) return res.cc('参数错误！', 404)
    SelectTable = 'ev_usermsg'
    data.senduser = req.auth.user_id
  }
  const SendMsgValueSql = `insert into ${SelectTable} set ?`
  const SendMsgValue = await ExecuteFuncData(SendMsgValueSql, data)
  if (SendMsgValue.affectedRows !== 1) return res.cc('发送失败！', 404)
  res.send({
    status: 200,
    message: '发送成功！',
  })
}

// 获取站内信列表 + 搜索功能
exports.getMessage = async (req, res) => {
  const GetNum = Number(req.query.num)
  const key = config.filterSqlInjection(req.query.key, res)
  // 获取所有文章数目 做分页
  const GetALLArticlesAtATimeSql = `SELECT id FROM ev_sitemsg`
  const GetALLArticlesAtATime = await ExecuteFunc(GetALLArticlesAtATimeSql)
  const totalCount = GetALLArticlesAtATime.length // 文章总数
  // 每次只获取10条文章
  let GetOnly10SiteMessageSql = `SELECT * FROM ev_sitemsg LIMIT 10 OFFSET ?`
  if (key !== '' && key !== 'undefined') {
    GetOnly10SiteMessageSql = `Select * from ev_sitemsg where 
              id like '%${key}%' or 'type' like'%${key}%' or 
              label like '%${key}%' or senduser like '%${key}%' or 
              getuser like '%${key}%' or content like '%${key}%' `
  }
  const GetOnly10SiteMessage = await ExecuteFuncData(GetOnly10SiteMessageSql, GetNum)
  if (GetOnly10SiteMessage.length === 0) {
    return res.send({
      status: 204,
      message: '暂无最新数据',
      data: [],
      totalNum: totalCount,
    })
  }
  res.status(200).send({
    status: 200,
    message: '获取成功',
    data: GetOnly10SiteMessage,
    totalNum: totalCount,
  })
}

// 删除/修改站内信状态
exports.ChangeMessageData = async (req, res) => {
  const { id, type } = req.body
  if (!id) return res.cc('缺少参数', 404)
  if (!type) return res.cc('缺少参数', 404)
  if (type === 'delete') {
    const UpdateMessageSql = `update ev_sitemsg set is_delete = 1 where id = ?`
    const UpdateMessage = await ExecuteFuncData(UpdateMessageSql, id)
    if (UpdateMessage.affectedRows !== 1) return res.cc('删除失败', 404)
    res.cc('删除成功', 200)
  }
}
