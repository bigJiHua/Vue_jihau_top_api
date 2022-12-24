const db = require('../DataBase/linkdb')
const bcrypt = require('bcryptjs/dist/bcrypt')
// 导入生成token 处理模块
const jwt = require('jsonwebtoken')
const config = require('../config')
const { regUserMail } = require('../Mail/mail')
const ExecuteFunc = require('../Implement/ExecuteFunction')
const ExecuteFuncData = require('../Implement/ExecuteFunctionData')

// 用户登录
exports.user_login_API = async (req, res) => {
  const userinfo = req.body
  // 检测用户状态 Check user status
  const CheckUserStatusSql = `select * from ev_users where username=? and state=0 and isact = 1`
  const CheckUserStatus = await ExecuteFuncData(
    CheckUserStatusSql,
    userinfo.username
  )
  if (CheckUserStatus.length !== 1)
    return res.cc('登录失败 账号未激活或已经被注销！', 202)
  const compareResult = bcrypt.compareSync(
    userinfo.password,
    CheckUserStatus[0].password
  )
  if (!compareResult) return res.cc('登录失败 密码错误 !', 202)
  const user = { ...CheckUserStatus[0], password: '', user_pic: '' }
  const userdata = { ...CheckUserStatus[0], password: '' }
  // 对用户的信息进行加密生成加密后的token                             token有效期
  const tokenStr = jwt.sign(user, config.jwtSecretKey, {
    expiresIn: config.expiresIn,
  })
  res.send({
    status: 200,
    message: '登录成功',
    token: 'Bearer ' + tokenStr,
    User: userdata,
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
  const CheckForDuplicateUsernames = await ExecuteFuncData(
    CheckForDuplicateUsernamesSql,
    userinfo.username
  )
  if (CheckForDuplicateUsernames.length > 0)
    return res.cc('用户名被占用，请更换其他用户名！', 202)
  const CheckForDuplicateMailboxes = await ExecuteFuncData(
    CheckForDuplicateMailboxesSql,
    userinfo.email
  )
  if (CheckForDuplicateMailboxes.length > 0)
    return res.cc('邮箱已被注册，请更换其他邮箱！', 202)
  userinfo.password = bcrypt.hashSync(userinfo.password, 10)
  const NewUsers = await ExecuteFuncData(NewUsersSql, userinfo)
  if (NewUsers.affectedRows !== 1)
    return res.cc('用户注册失败，请稍后再试', 202)
  const markCaptcha = await ExecuteFuncData(markCaptchaSql, data)
  if (markCaptcha.affectedRows !== 1) {
    return res.status(202).send({
      status: 202,
      message: `注册成功，验证码植入失败，请联系站长发送${code}验证码给站长`,
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
