const db = require('../database/linkdb')
const bcrypt = require('bcryptjs/dist/bcrypt')
// 导入生成token 处理模块
const jwt = require('jsonwebtoken')
const config = require('../config')

exports.user_login_API = (req, res) => {
  const userinfo = req.body
  const sql = `select * from ev_users where username=?`
  // s执行sql语句
  db.query(sql, userinfo.username, (err, results) => {
    if(err) return res.cc(err)
    if (results.length !== 1) return res.cc('登录失败! 查询错误')
    //TODO 验证和生成token
    const compareResult = bcrypt.compareSync(userinfo.password, results[0].password)
    if(!compareResult) return res.cc('登录失败 密码错误 !')
    //if(userinfo.password!=results[0].password) return res.cc('登录失败 !')
    const user = { ...results[0], password: ' ', user_pic: ' ' }
    // 对用户的信息进行加密生成加密后的token                             token有效期
    const tokenStr = jwt.sign(user, config.jwtSecretKey, { expiresIn: config.expiresIn })
    req.session.user = tokenStr
    req.session.islogin = true
    res.send({
      status: 200,
      message:'登录成功',
      token: 'Bearer ' + tokenStr,
    })
  })
}
exports.regUser = (req, res) => {
  const userinfo = req.body
  const sqlStr = 'select * from ev_users where username=?'
  db.query(sqlStr, userinfo.username, (err, results) => {
    if (err) {
      return res.cc(err)
    }
    if (results.length > 0) {
      return res.cc('用户名被占用，请更换其他用户名！')
    }
    //TODO　用户名可以使用　进行密码加密
    userinfo.password = bcrypt.hashSync(userinfo.password, 10)

    // 插入用户
    const sql = 'insert into ev_users set ?'
    db.query(
      sql,
      { username: userinfo.username, password: userinfo.password },
      (err, results) => {
        if (err) return res.cc(err)
        if (results.affectedRows !== 1)
          return res.cc('用户注册失败，请稍后再试')
        res.cc('用户注册成功!', 0)
      }
    )
  })  
}

