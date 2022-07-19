const express = require('express')
const webapp = express()
const cors = require('cors')
const Joi = require('joi')
const { expressjwt: expressJWT } = require('express-jwt')
const setting = require('./setting')
const session= require('express-session')
// const { SitemapStream, streamToPromise } = require('sitemap')
// const { createGzip } = require('zlib')
// const db = require('./database/linkdb')
// const { Readable } = require('stream')
// let sitemap

/* 中间件 */
webapp.use(cors())
webapp.use(express.json())
webapp.use(express.urlencoded({ extended: false }))
webapp.use((req, res, next) => {
    res.cc = function (err, status ) {
        if (status === '') {
            res.send({
                status : 206,
                message: err instanceof Error ? err.message : err,
            })
        } else {
            res.send({
                status : status,
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
    resave:false,
    saveUninitialized:true
}))
/* 中间件 */

/* 路由模块 */
const article_list_router = require('./router_gp/article')
const user_login_Router = require('./router_gp/login')
const get_data_Router = require('./router_gp/data')
const userinfo_Router = require('./router_gp/userinfo')
const search_Router = require('./router_gp/archives')
const setting_Router = require('./router_gp/setting')

webapp.use('/article',article_list_router)  // 权限接口
webapp.use('/users',userinfo_Router)        // 权限接口 用户信息的增删改查
webapp.use('/setting',setting_Router)       // 权限接口 管理员修改站点信息
webapp.use('/my', user_login_Router)        // 登录注册 非权限接口
webapp.use('/data',get_data_Router)         // get数据接口 非权限接口
webapp.use('/archives',search_Router)       // get文章接口 非权限接口
webapp.use('/public/uploads', express.static('./public/uploads')) // 静态资源

/* 路由模块 */

// 定义错误级别中间件 拦截未知错误
webapp.use((err, req, res, next) => {
    if (err instanceof Joi.ValidationError) return res.cc(err,202)
    if (err.name === 'UnauthorizedError') return res.cc('身份认证失败,请登录',401)
    return res.cc(err,202)
})
//     监听项目端口，运行时要修改
webapp.listen(setting.kuo, () => {
    console.log('server Open')
})
