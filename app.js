const express = require('express')
const { expressjwt: expressJWT } = require('express-jwt')
const bodyParser = require('body-parser')
const session = require('express-session')
const cors = require('cors')
const Joi = require('joi')
const config = require('./config')
const webapp = express()

/* 中间件 */
webapp.use(cors())
webapp.use(
  bodyParser.json({
    limit: '10mb',
  })
)
webapp.use(
  bodyParser.urlencoded({
    limit: '10mb',
    extended: true,
  })
)
// 封装自定义全局中间件
webapp.use((req, res, next) => {
  res.cc = function (err, status) {
    res.status(status === undefined ? 206 : status).send({
      status: status,
      message: err instanceof Error ? err.message : err,
    })
  }
  next()
})

// 配置解析session中间件
webapp.use(
  session({
    secret: 'Keybard cat',
    resave: false,
    saveUninitialized: true,
  })
)
/* 中间件 */

/* 路由模块 */
const article_list_router = require('./RouterGroup/Article')
const user_login_Router = require('./RouterGroup/Login')
const get_data_Router = require('./RouterGroup/Data')
const userinfo_Router = require('./RouterGroup/Userinfo')
const search_Router = require('./RouterFunction/Archives')
const setting_Router = require('./RouterGroup/Setting')
const user_mail_Router = require('./RouterGroup/Mail')

webapp.use('/api/article', expressJWT({
  secret: config.jwtSecretKey,
  algorithms: ['HS256'],
  credentialsRequired: true
}), article_list_router) // 权限接口 获取用户文章
webapp.use('/api/users', expressJWT({
  secret: config.jwtSecretKey,
  algorithms: ['HS256'],
  credentialsRequired: true
}), userinfo_Router)       // 权限接口 用户信息的增删改查
webapp.use('/api/setting', expressJWT({
  secret: config.jwtSecretKey,
  algorithms: ['HS256'],
  credentialsRequired: true
}), setting_Router)      // 权限接口 管理员修改站点信息
webapp.use('/api/my', user_login_Router)        // 登录注册 非权限接口
webapp.use('/api/getmail', user_mail_Router)    // 获取验证码 非权限接口
webapp.use('/api/data', get_data_Router)        // get数据接口 非权限接口
webapp.use('/api/archives', search_Router)      // get文章接口 非权限接口
webapp.use('/api/public/uploads', express.static('./public/uploads')) // 静态资源

/* 路由模块 */

// 定义错误级别中间件 拦截未知错误
webapp.use((err, req, res) => {
  if (err instanceof Joi.ValidationError) return res.send({
    message: err.message,
    status: 204
  })
  if (err.name === 'UnauthorizedError')
    return res.status(401).send({
      message: '身份认证失败,请登录',
      status: 401
    })
  if (err.name === 'PayloadTooLargeError')
    return res.status(204).send({
      message: '文件过大，请重试',
      status: 204
    })
  return  res.send({
    message: err,
    status: 204
  })
})

//     监听项目端口，运行时要修改
webapp.listen(config.Port, () => {
  console.log('server Open ' + config.Port + ' listening')
})
