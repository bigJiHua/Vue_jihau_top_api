/* 这是一个用于校验管理员身份的中间件 */
const config = require('../../config')
const ExecuteFunc = require('../ExecuteFunction')
const ExecuteFuncData = require('../ExecuteFunctionData')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs/dist/bcrypt')

// 校验用户身份
exports.VerifyAdministratorIdentity = async (req, res, next) => {
  // 校验管理员身份 Verify administrator identity
  const getUser = req.auth !== undefined ? req.auth.username : req.body.username
  if (getUser === undefined) return res.cc('未知访客！', 401)
  const useridentity = 'manager'
  // 校验身份 verify identity
  const verifyIdentitySql = `select * from ev_users where username=? and useridentity=?`
  const verifyIdentity = await ExecuteFuncData(verifyIdentitySql, [getUser, useridentity])
  if (verifyIdentity.length === 0) {
    res.status(401).send({
      status: 401,
      message: '非管理员禁止操作!',
    })
  } else {
    next()
  }
}
// 校验历史token是否可用 废弃
// exports.verifyUserToken = (token) => {
//   // 如果token = undefined返回false
//   if (!token) return false
//   try {
//     // Verifying the token using express-jwt
//     const decodedToken = jwt.verify(token, config.jwtSecretKey, { algorithms: ['HS256'] })
//     if (decodedToken) return true
//   } catch (err) {
//     // 如果token = 解析错误返回false
//     return false
//   }
// }
// 校验普通get请求解析用户数据
exports.verifyToken = (req, res, next) => {
  // 获取请求头中的 Authorization 头部，通常包含 token
  if (
    req.headers.authorization !== undefined &&
    req.headers.authorization.split(' ')[0] === 'Bearer'
  ) {
    const token = req.headers.authorization.replace('Bearer ', '')
    try {
      // 解析 token
      const tokenData = jwt.verify(token, config.jwtSecretKey, { algorithms: ['HS256'] })
      // 将解析的数据存储在请求对象中，以便后续路由使用
      req.authData = tokenData
    } catch (err) {
      console.log('密钥失效')
      req.authData = []
    }
  }
  // 继续执行下一个中间件或路由
  next()
}

/* 这是一个用于检查用户状态的中间件 */
// 检查用户状态 CheckUserStatus
exports.CheckUserStatus = async (req, res, next) => {
  const username = req.body.username ? req.body.username : req.query.username
  let user = req.query.user ? req.query.user : req.body.user
  let deluser = req.query.deluser ? req.query.deluser : req.body.deluser
  const CheckUserStatusSql = `select * from ev_users where username=? and state=0`
  const CheckUserIsactSql = `select * from ev_users where username=? and isact=1`
  if (deluser) {
    if (deluser === 'null') deluser = req.auth.username
    const CheckUserStatus = await ExecuteFuncData(CheckUserStatusSql, deluser)
    if (CheckUserStatus.length === 0) return res.cc('用户账户已注销,无法对其进行操作！', 202)
  }
  if (username !== undefined) {
    const CheckUserStatus = await ExecuteFuncData(CheckUserStatusSql, username)
    if (CheckUserStatus.length === 0) return res.cc('用户账户已注销,无法对其进行操作！', 404)
    const CheckUserIsact = await ExecuteFuncData(CheckUserIsactSql, username)
    if (CheckUserIsact.length === 0) return res.cc('用户账户未激活,无法对其进行操作！', 404)
    next()
  } else if (user !== undefined) {
    if (user === 'null') user = req.auth.username
    const CheckUserStatus = await ExecuteFuncData(CheckUserStatusSql, user)
    if (CheckUserStatus.length === 0) return res.cc('用户账户已注销,无法对其进行操作！', 404)
    const CheckUserIsact = await ExecuteFuncData(CheckUserIsactSql, user)
    if (CheckUserIsact.length === 0) return res.cc('用户账户未激活,无法对其进行操作！', 404)
    next()
  } else {
    res.cc('查询参数异常', 404)
  }
}

// 检查用户是否存在 CheckUserisTrue
exports.CheckUserisTrue = async (req, res, next, power_type) => {
  // 这次请求数据的对象
  // 关系对应的API 传参是 author 其余为 user
  const user = req.query.user ?? req.query.author
  // 这次请求的人 是否带token
  const getUser = req.authData ? req.authData.username : ''
  let isSelfBoolean = false
  const CheckUserStatusSql = `select username,user_id,useridentity,sex,city,user_pic,user_bgc,user_content,birthday,registerDate from ev_users where username=?`
  if (user !== undefined) {
    if (getUser && user.toLowerCase() === getUser.toLowerCase()) isSelfBoolean = true
    const CheckUserStatus = await ExecuteFuncData(CheckUserStatusSql, user)
    if (CheckUserStatus.length === 0) return res.cc('用户不存在！', 404)
    // 如果用户存在 则检查隐私权限
    // 如果是自己则跳过此项检测
    if (!isSelfBoolean) {
      const SelectUserPowerSql = `Select * from ev_userpower where username = ?`
      const SelectUserPower = await ExecuteFuncData(SelectUserPowerSql, user)
      const Power = SelectUserPower[0]
      if (Number(Power[`is${power_type}`]) === 0) return res.cc('用户关闭了查看权限！', 403)
    }
    req.body.isSelf = isSelfBoolean
    req.body.UserData = CheckUserStatus[0]
    next()
  } else {
    return res.cc('查询参数异常', 404)
  }
}

/*
 * 这是用于校验用户是否为当前用户的一个中间件
 *需要做的是
 *  2.校验密码
 * */
// 检查用户密码，二次校验确认是否为本人操作
exports.CheckUserIdentity = async (user, pwd) => {
  if (!user || !pwd) return false
  const CheckIdentitySql = `select * from ev_users where username=? and useridentity='manager' and state=0`
  const CheckIdentity = await ExecuteFuncData(CheckIdentitySql, user)
  if (CheckIdentity.length === 0) return false
  return bcrypt.compareSync(pwd, CheckIdentity[0].password)
}

// 校验用户权限中间件
exports.CheckUserPower = async (req, res, next, type) => {
  const user = req.auth.username
  if (!user) return res.cc('参数错误！')
  let sandMessage = ``
  let powername = ``
  switch (type) {
    case 'iscom':
      if (req.body.type !== 'comment') return next()
      sandMessage = '您已被禁言！请联系站长处理！'
      powername = 'iscom'
      break
    case 'isart':
      sandMessage = '您已被禁止发布文章！请联系站长处理！'
      powername = 'isart'
      break
    case 'isupimg':
      sandMessage = '暂无上传文件权限！请联系站长处理！'
      powername = 'isupimg'
      break
    default:
      return res.cc('参数错误！')
  }
  const SearchUserPowerSql = `Select ${powername} from ev_userpower where username = ?`
  const SearchUserPower = await ExecuteFuncData(SearchUserPowerSql, user)
  if (SearchUserPower.length === 0) return res.cc('权限查询错误！')
  if (SearchUserPower[0][powername] === 1) {
    next()
  } else {
    return res.cc(sandMessage, 202)
  }
}
