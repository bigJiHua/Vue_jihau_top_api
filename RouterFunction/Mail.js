const db = require('../DataBase/linkdb')
const ExecuteFuncData = require('../Implement/ExecuteFunctionData')
// 检查验证码
exports.CheckEmail = (req, res) => {
  const username = req.body.user
  const sql = `select * from ev_users_vercode,ev_users where ev_users_vercode.username=? and ev_users_vercode.is_check=0 `
  db.query(sql, username, (err, results) => {
    if (err) return res.cc(err, 500)
    if (results.length === 0)
      return res.cc(' 您已成功验证过了，请直接登录 / 用户名错误', 202)
    // 校验Code表里的确认已经检查
    const sql = `update ev_users_vercode set is_check = 1 where username=? and code=?`
    db.query(sql, [username, req.body.code], (err, results) => {
      if (err) return res.cc(err, 500)
      if (results.affectedRows !== 1) return res.cc('验证失败', 404)
      const sql = `update ev_users set isact = 1 where username = ?`
      db.query(sql, username, (err, results) => {
        if (err && results.affectedRows !== 1) return res.cc('激活失败', 202)
        res.status(200).send({
          status: 200,
          message: '验证成功，您可以正常登录您的账户了',
        })
      })
    })
  })
}
