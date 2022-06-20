const db = require('../database/linkdb')
const bcrypt = require('bcryptjs/dist/bcrypt')
// 导入生成token 处理模块
const jwt = require('jsonwebtoken')
const config = require('../config')

// 用户登录
exports.user_login_API = (req, res) => {
  const userinfo = req.body
  const sql = `select * from ev_users where username=?`
  // s执行sql语句
  db.query(sql, userinfo.username, (err, results) => {
    if(err) return res.cc(err)
    if (results.length !== 1) return res.cc('登录失败 账号不存在！')
    //TODO 验证和生成token
    const compareResult = bcrypt.compareSync(userinfo.password, results[0].password)
    if(!compareResult) return res.send({
      state: 401,
      message: '登录失败 密码错误 !'
    })
    //if(userinfo.password!=results[0].password) return res.cc('登录失败 !')
    const user = { ...results[0], password: '', user_pic: '' }
    // 对用户的信息进行加密生成加密后的token                             token有效期
    const tokenStr = jwt.sign(user, config.jwtSecretKey, { expiresIn: config.expiresIn })
    req.session.user = tokenStr
    req.session.islogin = true// 如果前端允许传递cookie，加上这一句
    // res.cookie('username',user.username, {domain:'127.0.0.1:8080',maxAge: 600000, httpOnly: true})
    // res.cookie('Useridentity',user.useridentity, {domain:'127.0.0.1:8080',maxAge: 600000, httpOnly: true})
    const userdata = {
      id: results[0].id,
      username: results[0].username,
      useridentity: results[0].useridentity,
      // nickname: results[0].nickname,
      // sex: results[0].sex,
      // city: results[0].city,
      // email: results[0].email,
      // user_content: results[0].user_content,
      // birthday: results[0].birthday
    }
    res.send({
      status: 200,
      message:'登录成功',
      token: 'Bearer ' + tokenStr,
      User: userdata
    })
  })
}
// 用户注册
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
      userinfo,
      (err, results) => {
        if (err) return res.cc(err)
        if (results.affectedRows !== 1)
          return res.cc('用户注册失败，请稍后再试')
        res.cc('用户注册成功!', 0)
      }
    )
  })
}

