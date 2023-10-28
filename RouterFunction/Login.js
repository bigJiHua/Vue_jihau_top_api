const bcrypt = require('bcryptjs/dist/bcrypt')
// 导入生成token 处理模块
const jwt = require('jsonwebtoken')
const config = require('../config')
const { regUserMail } = require('../Mail/mail')
const ExecuteFuncData = require('../Implement/ExecuteFunctionData')
const { verifyToken } = require('../Implement/middleware/CheckUserMiddleware')
const { setUserLoginLog } = require('../Implement/ExecuteUserLogData')

// 用户登录
exports.user_login_API = async (req, res) => {
  const userinfo = req.body
  const data = {}
  // 检测用户状态 Check user status
  const CheckUserStatusSql = `select * from ev_users where username=? and state=0 and isact = 1`
  const CheckUserStatus = await ExecuteFuncData(CheckUserStatusSql, userinfo.username)
  if (CheckUserStatus.length !== 1) {
    // 执行log
    await setUserLoginLog(req, {
      user_id: userinfo.username,
      token: '',
      status: 404,
      err_message: '未知账号/账号未激活',
    })
    return res.cc('登录失败 账号未激活或已经被注销！', 202)
  }
  // 校验密码
  const compareResult = bcrypt.compareSync(userinfo.password, CheckUserStatus[0].password)
  if (!compareResult) {
    // // 执行log
    await setUserLoginLog(req, {
      user_id: userinfo.username,
      token: '',
      status: 2,
      err_message: '密码错误',
    })
    return res.cc('登录失败 密码错误 !', 202)
  }
  // token
  let tokenStr = ''
  const SelectUserLogDataSql = `SELECT token FROM ev_login_log WHERE user_id = ? AND (UNIX_TIMESTAMP() - 1000 - login_time) / 3600 < 23;`
  const SelectUserLogData = await ExecuteFuncData(SelectUserLogDataSql, CheckUserStatus[0].user_id)
  // 校验历史token是否可用
  if (SelectUserLogData[0] !== undefined && (await verifyToken(SelectUserLogData[0].token))) {
    tokenStr = SelectUserLogData[0].token
  } else {
    // 如果密码没错的话 开始准备数据
    const user = { ...CheckUserStatus[0], password: '', user_pic: '' }
    // 对用户的信息进行加密生成加密后的token                             token有效期
    tokenStr = 'Bearer ' + jwt.sign(user, config.jwtSecretKey, { expiresIn: config.expiresIn })
  }
  data.Users = { ...CheckUserStatus[0], password: '' }
  res.send({
    status: 200,
    message: '登录成功',
    token: tokenStr,
    data: data,
  })
  await setUserLoginLog(req, {
    user_id: CheckUserStatus[0].user_id,
    token: tokenStr,
    status: 0,
    err_message: '成功登录',
  })
}

// 用户注册
exports.regUser = async (req, res) => {
  const userinfo = req.body
  const code = config.generateMixed(6)
  // 检测用户名是否重复 Check for duplicate usernames
  const CheckForDuplicateUsernamesSql = 'select * from ev_users where username=?'
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
  if (CheckForDuplicateUsernames.length > 0) return res.cc('用户名被占用，请更换其他用户名！', 202)
  const CheckForDuplicateMailboxes = await ExecuteFuncData(
    CheckForDuplicateMailboxesSql,
    userinfo.email,
  )
  if (CheckForDuplicateMailboxes.length > 0) return res.cc('邮箱已被注册，请更换其他邮箱！', 202)
  userinfo.password = bcrypt.hashSync(userinfo.password, 10)
  // 加入唯一用户Id
  userinfo.user_id = config.generateUserId(6)
  // 插入注册时间戳
  userinfo.registerDate = new Date().getTime()
  // 设置默认用户头像
  userinfo.user_pic = config.defaultUserLogo
  const NewUsers = await ExecuteFuncData(NewUsersSql, userinfo)
  // 在权限表插入用户权限
  const insertNewUsersPowerSql = `INSERT INTO ev_userpower (username,user_id) SELECT username,user_id FROM ev_users WHERE username = ?`
  await ExecuteFuncData(insertNewUsersPowerSql, userinfo.username)
  if (NewUsers.affectedRows !== 1) return res.cc('用户注册失败，请稍后再试', 202)
  const markCaptcha = await ExecuteFuncData(markCaptchaSql, data)
  if (markCaptcha.affectedRows !== 1) {
    return res.status(202).send({
      status: 202,
      message: `注册成功，验证码植入失败，请截图并联系站长发送${code}验证码给站长`,
      data: {
        code: code,
        user: userinfo.username,
      },
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
      return res.status(202).send({
        status: 202,
        message: `注册成功，验证码发送失败，请在跳转后的页面中输入${code}`,
        data: {
          code: code,
          user: userinfo.username,
        },
      })
    })
}
