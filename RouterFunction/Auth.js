const bcrypt = require('bcryptjs/dist/bcrypt')
// 导入生成token 处理模块
const jwt = require('jsonwebtoken')
const config = require('../config')
const { regUserMail } = require('../Mail/mail')
const ExecuteFuncData = require('../Implement/ExecuteFunctionData')
const { setUserLoginLog } = require('../Implement/ExecuteUserLogData')

// 用户登录
exports.user_login_API = async (req, res) => {
  const userinfo = req.body
  const data = {}
  // 检测用户状态 Check user status
  const CheckUserStatusSql = `select * from ev_users where username=? and state=0 and isact = 1`
  const CheckUserStatus = await ExecuteFuncData(
    CheckUserStatusSql,
    userinfo.username,
  )
  if (CheckUserStatus.length !== 1) {
    // 执行log
    await setUserLoginLog(req, {
      user_id: userinfo.username,
      token: '',
      status: 404,
      err_message: '未知账号/账号未激活',
    })
    return res.cc('您输入的账户名异常，请检查后再试', 202)
  }
  // 校验密码
  const compareResult = bcrypt.compareSync(
    userinfo.password,
    CheckUserStatus[0].password,
  )
  if (!compareResult) {
    // 执行log
    await setUserLoginLog(req, {
      user_id: userinfo.username,
      token: '',
      status: 2,
      err_message: '密码错误',
    })
    return res.cc('登录失败 密码错误 !', 202)
  }
  // token
  // 如果密码没错的话 开始准备数据
  const user = {
    id: CheckUserStatus[0].id,
    username: CheckUserStatus[0].username,
    user_id: CheckUserStatus[0].user_id,
    useridentity: CheckUserStatus[0].useridentity,
  }
  // 对用户的信息进行加密生成加密后的token                             token有效期
  const tokenStr =
    'Bearer ' +
    jwt.sign(user, config.jwtSecretKey, { expiresIn: config.expiresIn })
  // 用户信息
  // 实验版本
  // data.Users = {
  //   username: CheckUserStatus[0].username,
  //   useridentity: CheckUserStatus[0].useridentity,
  // }
  data.Users = {
    id: CheckUserStatus[0].id,
    username: CheckUserStatus[0].username,
    user_id: CheckUserStatus[0].user_id,
    useridentity: CheckUserStatus[0].useridentity,
    sex: CheckUserStatus[0].sex,
    city: CheckUserStatus[0].city,
    email: CheckUserStatus[0].email,
    user_pic: CheckUserStatus[0].user_pic,
    user_bgc: CheckUserStatus[0].user_bgc,
    state: CheckUserStatus[0].state,
    user_content: CheckUserStatus[0].user_content,
    birthday: CheckUserStatus[0].birthday,
    registerDate: CheckUserStatus[0].registerDate,
    isact: CheckUserStatus[0].isact,
  }
  data.token = tokenStr
  // 执行log
  await setUserLoginLog(req, {
    user_id: CheckUserStatus[0].user_id,
    token: tokenStr,
    status: 0,
    err_message: '成功登录',
  })
  // 用户不在权限表那就增加权限表
  const cagPowerActionSql = `SELECT * FROM ev_userpower WHERE username = ?`
  const cagPowerAction = await ExecuteFuncData(
    cagPowerActionSql,
    userinfo.username,
  )
  if (cagPowerAction.length === 0) {
    const AddUserPowerActionSql = `INSERT INTO ev_userpower (username, user_id, isadmin)  
                SELECT username, user_id,   
                CASE WHEN useridentity = 'manager' THEN 1 ELSE 0 END AS isadmin  
                FROM ev_users  
                WHERE username = ?`
    await ExecuteFuncData(AddUserPowerActionSql, userinfo.username)
  }
  return res.send({
    status: 200,
    message: '登录成功',
    token: tokenStr,
    data: data,
  })
}

// 用户注册
exports.regUser = async (req, res) => {
  const userinfo = req.body
  const code = config.generateMixed(6)
  // 检测用户名是否重复 Check for duplicate usernames
  const CheckForDuplicateUsernamesSql =
    'select * from ev_users where username=?'
  // 检测邮箱是否重复 Check for duplicate mailboxes
  const CheckForDuplicateMailboxesSql = 'select * from ev_users where email=?'
  // 插入用户 New users
  const NewUsersSql = 'insert into ev_users set ?'
  // 插入验证码 mark captcha
  const markCaptchaSql = `insert into ev_users_vercode set ?`
  const data = {
    type: 'regUserCode',
    username: userinfo.username,
    code: code,
    time: config.pub_date,
  }
  // 检查是否存在该用户
  const CheckForDuplicateUsernames = await ExecuteFuncData(
    CheckForDuplicateUsernamesSql,
    userinfo.username,
  )
  if (CheckForDuplicateUsernames.length > 0)
    return res.cc('用户名被占用，请更换其他用户名！', 202)
  // 检查邮箱是否重复
  const CheckForDuplicateMailboxes = await ExecuteFuncData(
    CheckForDuplicateMailboxesSql,
    userinfo.email,
  )
  if (CheckForDuplicateMailboxes.length > 0)
    return res.cc('邮箱已被注册，请更换其他邮箱！', 202)
  // 加密密码
  userinfo.password = bcrypt.hashSync(userinfo.password, 10)
  // 加入唯一用户Id
  userinfo.user_id = config.generateUserId(6)
  // 插入注册时间戳
  userinfo.registerDate = new Date().getTime()
  // 设置默认用户头像
  userinfo.user_pic = config.defaultUserLogo
  const NewUsers = await ExecuteFuncData(NewUsersSql, userinfo)
  // 在权限表插入用户权限
  const insertNewUsersPowerSql = `INSERT INTO ev_userpower (username, user_id, isadmin)  
                SELECT username, user_id,   
                CASE WHEN useridentity = 'manager' THEN 1 ELSE 0 END AS isadmin  
                FROM ev_users  
                WHERE username = ?`
  // 检查权限表中是否已存在该用户
  const checkUserPowerSql = `SELECT * FROM ev_userpower WHERE username = ?`
  const checkUserPower = await ExecuteFuncData(
    checkUserPowerSql,
    userinfo.username,
  )
  if (checkUserPower.length === 0) {
    // 如果为存在则插入新的用户权限
    await ExecuteFuncData(insertNewUsersPowerSql, userinfo.username)
  } else {
    // 历史遗留则删除然后再次插入
    const deleteOldUsersPowerSql = `DELETE FROM ev_userpower WHERE username = ?`
    const deleteOldUsersPower = await ExecuteFuncData(
      deleteOldUsersPowerSql,
      userinfo.username,
    )
    if (deleteOldUsersPower.affectedRows === 1) {
      await ExecuteFuncData(insertNewUsersPowerSql, userinfo.username)
    }
  }
  if (NewUsers.affectedRows !== 1)
    return res.cc('用户注册失败，请稍后再试', 404)
  const markCaptcha = await ExecuteFuncData(markCaptchaSql, data)
  if (markCaptcha.affectedRows !== 1) {
    return res.status(406).send({
      status: 406,
      message: `注册成功，验证码植入失败，请联系站长辅助激活账户`,
    })
  }
  regUserMail(userinfo.email, code, userinfo.username)
    .then(() => {
      res.status(200).send({
        status: 200,
        message: '注册成功，激活邮件已发送至您的邮箱，请点击激活您的账户',
      })
    })
    .catch(() => {
      return res.status(406).send({
        status: 406,
        message: `注册成功，验证码发送失败，请联系站长辅助激活账户`,
      })
    })
}

const { setSystemLogFunc } = require('../Implement/ExecuteSystemLog')
// 校验路由
exports.CheckRoute = async (req, res) => {
  // const path = req.query.path.split('/').filter(Boolean).pop()
  // const path = req.query.path.split('/')[1]
  const path = req.query.path
  if (!path) return res.cc('路由错误', 404)
  let checkSql = `SELECT setting_value FROM website_settings WHERE setting_key = ?`
  let key = ''
  switch (path.toLowerCase()) {
    case '/spslist':
      key = 'spsport'
      break
    case '/register':
      key = 'enable_register'
      break
    case '/login':
      key = 'enable_login'
      break
    default:
      return res.cc('参数错误', 404)
  }
  const CheckRoute = await ExecuteFuncData(checkSql, key)
  if (CheckRoute.length === 0) {
    await setSystemLogFunc(
      'website_settings',
      '前台校验未查询到' + key + '数据',
      '404',
      'system',
    )
  }
  res.send({
    status: 200,
    message: '校验成功',
    ismessage: false,
    state: CheckRoute[0].setting_value,
  })
}
