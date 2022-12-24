/* 这是一个用于检查用户状态的中间件 */
const config = require('../../config')
const ExecuteFunc = require('../ExecuteFunction')
const ExecuteFuncData = require('../ExecuteFunctionData')

// 检查用户状态 CheckUserStatus
exports.CheckUserStatus = async (req, res, next) => {
  const username = req.body.username ? req.body.username : req.query.username
  const user = req.query.user ? req.query.user : req.body.user
  const CheckUserStatusSql = `select * from ev_users where username=? and state=0`
  if (username !== undefined) {
    const CheckUserStatus = await ExecuteFuncData(CheckUserStatusSql, username)
    if (CheckUserStatus.length === 0) {
      res.status(204).send({
        status: 204,
        message: '用户状态异常',
      })
    } else {
      next()
    }
  } else if (user !== undefined) {
    const CheckUserStatus = await ExecuteFuncData(CheckUserStatusSql, user)
    if (CheckUserStatus.length === 0) {
      res.status(204).send({
        status: 204,
        message: '用户状态异常',
      })
    } else {
      next()
    }
  } else {
    res.status(204).send({
      status: 404,
      message: '参数异常',
    })
  }
}
