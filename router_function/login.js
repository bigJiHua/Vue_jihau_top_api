const db = require('../database/linkdb')
const bcrypt = require('bcryptjs/dist/bcrypt')
// 导入生成token 处理模块
const jwt = require('jsonwebtoken')
const config = require('../config')
const {regUserMail} = require('../mail/mail')
let setting = require('../setting')

// 用户登录
exports.user_login_API = (req, res) => {
    const userinfo = req.body
    const sql = `select * from ev_users where username=? and state=0 and isact = 1`
    // s执行sql语句
    db.query(sql, userinfo.username, (err, results) => {
        if (err) return res.cc(err)
        if (results.length !== 1) return res.cc('登录失败 账号未激活或已经被注销！', 202)
        const compareResult = bcrypt.compareSync(userinfo.password, results[0].password)
        if (!compareResult) return res.cc('登录失败 密码错误 !', 202)
        const user = {...results[0], password: '', user_pic: ''}
        const userdata = {...results[0], password: ''}
        // 对用户的信息进行加密生成加密后的token                             token有效期
        const tokenStr = jwt.sign(user, config.jwtSecretKey, {expiresIn: config.expiresIn})
        req.session.user = tokenStr
        req.session.islogin = true
        res.send({
            status: 200,
            message: '登录成功',
            token: 'Bearer ' + tokenStr,
            User: userdata
        })
    })
}

// 用户注册
exports.regUser = (req, res) => {
    const userinfo = req.body
    const code = setting.generateMixed(6)
    const sqlUsername = 'select * from ev_users where username=?'
    const sqlemail = 'select * from ev_users where email=?'
    const data = {
        type: 'regUserCode',
        username: userinfo.username,
        code: code,
        time: setting.pub_date
    }
    db.query(sqlUsername, userinfo.username, (err, results) => {
        if (err) return res.cc(err)
        if (results.length > 0) return res.cc('用户名被占用，请更换其他用户名！', 202)
        db.query(sqlemail, userinfo.email, (err, results) => {
            if (err) return res.cc(err)
            if (results.length > 0) return res.cc('邮箱已被注册，请更换其他邮箱！', 202)
            userinfo.password = bcrypt.hashSync(userinfo.password, 10)
            // 插入用户
            const sql = 'insert into ev_users set ?'
            db.query(sql, userinfo, (err, results) => {
                if (err) return res.cc(err)
                if (results.affectedRows !== 1) return res.cc('用户注册失败，请稍后再试', 202)
                // 插入验证码
                const sql = `insert into ev_users_vercode set ?`
                db.query(sql, data, (err, results) => {
                    if (err || results.affectedRows !== 1) {
                        return res.status(202).send({
                            status: 202,
                            message: `注册成功，验证码植入失败，请联系站长发送${code}验证码给站长`,
                            data: {
                                code: code,
                                user: userinfo.username,
                            }
                        })
                    }
                    regUserMail(userinfo.email, code, userinfo.username).then(() => {
                        res.status(200).send({
                            status: 200,
                            message: '注册成功，激活邮件已发送至您的邮箱，请点击激活您的账户'
                        })
                    }).catch(()=> {
                        return res.status(202).send({
                            status: 202,
                            message: `注册成功，验证码发送失败，请在跳转后的页面中输入${code}`,
                            data: {
                                code: code,
                                user: userinfo.username,
                            }
                        })
                    })
                })
            })
        })
    })
}


