const ExecuteFuncData = require('../Implement/ExecuteFunctionData')
// 检查验证码
exports.CheckEmail = async (req, res) => {
  const username = req.body.user
  const code = req.body.code
  // 第一步 查询是否存在这个人在ev_users表中
  const SelectUserDataSql = `Select username from ev_users where username=? AND isact = 0`
  const SelectUserData = await ExecuteFuncData(SelectUserDataSql, username)
  if (SelectUserData.length === 0) return res.cc('用户不存在/账户已被激活', 404)
  // 验证ev_user_vercode里是否存在这个验证码且用户是否已验证
  const SelectIsVerCodeSql = `Select code,username from ev_users_vercode where username=? and code=? and is_check =0 `
  const SelectIsVerCode = await ExecuteFuncData(SelectIsVerCodeSql, [username, code])
  if (SelectIsVerCode.length === 0) return res.cc('验证码错误/已被激活', 404)
  // code和用户名相匹配 写入是否验证
  const InsetVercodeIsTrueSql = `update ev_users_vercode set is_check = 1 where username=? and code=?`
  const InsetUserIsTrueSql = `update ev_users set isact = 1 where username = ?`
  const InsetVercodeIsTrue = await ExecuteFuncData(InsetVercodeIsTrueSql, [username, code])
  const InsetUserIsTrue = await ExecuteFuncData(InsetUserIsTrueSql, username)
  if (InsetVercodeIsTrue.affectedRows !== 1) return res.cc('验证失败', 404)
  if (InsetUserIsTrue.affectedRows !== 1) return res.cc('验证失败', 404)
  res.status(200).send({
    status: 200,
    message: '验证成功，您可以正常登录您的账户了',
  })
}
