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
  const useridentity = 'manager'
  // 校验身份 verify identity
  const verifyIdentitySql = `select * from ev_users where username=? and useridentity=?`
  const verifyIdentity = await ExecuteFuncData(verifyIdentitySql, [getUser, useridentity])
  if (verifyIdentity.length === 0) {
    res.status(404).send({
      status: 404,
      message: '非管理员禁止操作!',
    })
  } else {
    next()
  }
}
// 校验token
exports.verifyToken = async (token) => {
  // 如果token = undefined返回false
  if (!token) return false
  try {
    // Verifying the token using express-jwt
    const decodedToken = jwt.verify(token, config.jwtSecretKey, { algorithms: ['HS256'] })
    if (decodedToken) return true
    return true
  } catch (err) {
    // 如果token = 解析错误返回false
    return false
  }
}
// TODO 检查请求web平台
exports.CheckReqWebsite = (req, res, next) => {
  const data = req.he
}
/* 这是一个用于检查用户状态的中间件 */
// 检查用户状态 CheckUserStatus
exports.CheckUserStatus = async (req, res, next) => {
  const username = req.body.username ? req.body.username : req.query.username
  const user = req.query.user ? req.query.user : req.body.user
  const deluser = req.query.deluser ? req.query.deluser : req.body.deluser
  const CheckUserStatusSql = `select * from ev_users where username=? and state=0`
  const CheckUserIsactSql = `select * from ev_users where username=? and isact=1`
  if (deluser) {
    const CheckUserStatus = await ExecuteFuncData(CheckUserStatusSql, deluser)
    if (CheckUserStatus.length === 0) return res.cc('用户账户已注销,无法对其进行操作！', 202)
  }
  if (username !== undefined) {
    const CheckUserStatus = await ExecuteFuncData(CheckUserStatusSql, username)
    if (CheckUserStatus.length === 0) return res.cc('用户账户已注销,无法对其进行操作！', 404)
    const CheckUserIsact = await ExecuteFuncData(CheckUserIsactSql, username)
    if (CheckUserIsact.length === 0) return res.cc('用户账户未激,无法对其进行操作！', 404)
    next()
  } else if (user !== undefined) {
    const CheckUserStatus = await ExecuteFuncData(CheckUserStatusSql, user)
    if (CheckUserStatus.length === 0) return res.cc('用户账户已注销,无法对其进行操作！', 404)
    const CheckUserIsact = await ExecuteFuncData(CheckUserIsactSql, user)
    if (CheckUserIsact.length === 0) return res.cc('用户账户未激活,无法对其进行操作！', 404)
    next()
  } else {
    res.cc('查询参数异常', 404)
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
  if (SearchUserPower.length === 0) return res.cc('查询错误！')
  if (SearchUserPower[0][powername] === 1) {
    next()
  } else {
    return res.cc(sandMessage, 202)
  }
}
