const express = require('express')
const webapp = express()
const cors = require('cors')
const Joi = require('joi')
const {expressjwt: expressJWT} = require('express-jwt')
const setting = require('./setting')
const session = require('express-session')
const bodyParser = require('body-parser')

/* 中间件 */
webapp.use(cors())
webapp.use(bodyParser.json({
    limit: '50mb' //nodejs 做为服务器，在传输内容或者上传文件时，系统默认大小为100kb,改为10M
}));
webapp.use(bodyParser.urlencoded({
    limit: '50mb', //nodejs 做为服务器，在传输内容或者上传文件时，系统默认大小为100kb,改为10M
    extended: true
}));
webapp.use((req, res, next) => {
    res.cc = function (err, status) {
        if (status === '') {
            res.send({
                status: 206,
                message: err instanceof Error ? err.message : err,
            })
        } else {
            res.send({
                status: status,
                message: err instanceof Error ? err.message : err,
            })
        }
    }
    next()
})

// 配置解析token中间件
const config = require('./config')
webapp.use(
    expressJWT({
        secret: config.jwtSecretKey,
        algorithms: ['HS256'],
        //credentialsRequired: false
    }).unless({
        path: setting.api
    })
)
webapp.use(session({
    secret: 'Keybard cat',
    resave: false,
    saveUninitialized: true
}))
/* 中间件 */

/* 路由模块 */
const article_list_router = require('./router_gp/article')
const user_login_Router = require('./router_gp/login')
const get_data_Router = require('./router_gp/data')
const userinfo_Router = require('./router_gp/userinfo')
const search_Router = require('./router_function/archives')
const setting_Router = require('./router_gp/setting')
const user_mail_Router = require('./router_gp/mail')

webapp.use('/api/article', article_list_router)  // 权限接口
webapp.use('/api/users', userinfo_Router)        // 权限接口 用户信息的增删改查
webapp.use('/api/setting', setting_Router)       // 权限接口 管理员修改站点信息
webapp.use('/api/my', user_login_Router)         // 登录注册 非权限接口
webapp.use('/api/getmail', user_mail_Router)     // 获取验证码 非权限接口
webapp.use('/api/data', get_data_Router)         // get数据接口 非权限接口
webapp.use('/api/archives', search_Router)       // get文章接口 非权限接口
webapp.use('/api/public/uploads', express.static('./public/uploads')) // 静态资源

/* 路由模块 */

// 定义错误级别中间件 拦截未知错误
webapp.use((err, req, res) => {
    if (err instanceof Joi.ValidationError) return res.cc(err, 202)
    if (err.name === 'UnauthorizedError') return res.cc('身份认证失败,请登录', 401)
    if (err.name === 'PayloadTooLargeError') return res.cc('文件过大，请重试', 304)
    return res.cc(err, 202)
})
//     监听项目端口，运行时要修改
webapp.listen(setting.kuo, () => {
    console.log('server Open')
})
