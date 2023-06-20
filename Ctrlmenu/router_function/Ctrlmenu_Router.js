const db = require('../../database/linkdb')
const bcrypt = require('bcryptjs/dist/bcrypt')
// 导入生成token 处理模块
const jwt = require('jsonwebtoken')
const config = require('../../config')

// 用户登录
exports.user_login_API = (req, res) => {
    const userinfo = req.body
    const sql = `select * from ev_users where username=? and state=0 and isact = 1 and useridentity='管理员'`
    db.query(sql, userinfo.username, (err, results) => {
        if ( err || results.length !== 1) return res.cc('非管理员禁止操作！', 202)
        const compareResult = bcrypt.compareSync(userinfo.password, results[0].password)
        if (!compareResult) return res.cc('登录失败 密码错误 !', 202)
        const user = {...results[0], password: '', user_pic: ''}       //token有效期
        const tokenStr = jwt.sign(user, config.jwtSecretKey, {expiresIn: config.expiresIn})
        req.session.user = tokenStr
        req.session.islogin = true
        res.send({
            status: 200,
            message: '登录成功',
            token: 'Bearer ' + tokenStr
        })
    })
}
