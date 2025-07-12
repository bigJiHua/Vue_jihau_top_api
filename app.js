const express = require('express')
const { expressjwt: expressJWT } = require('express-jwt')
const bodyParser = require('body-parser')
const session = require('express-session')
const cors = require('cors')
const Joi = require('joi')
const config = require('./config')
const webapp = express()

/* 中间件 */
const allowedOrigin = [
  'http://192.168.0.103:5173',
  'http://192.168.0.103:3000',
  'http://localhost:5173',
  'http://localhost:3000',
]
webapp.use(
  cors({
    origin: allowedOrigin, // 指定前端地址
    credentials: true, // 允许携带 cookie
    methods: ['GET', 'POST', 'OPTIONS', 'PATCH'], // 必须包含你使用的方法
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'viewportwidth',
      'viewportheight',
      'pixelratio',
      'navigatorplatform',
    ],
  }),
)
webapp.use(
  bodyParser.urlencoded({
    limit: '10mb',
    extended: true,
  }),
)
// 配置解析session中间件
webapp.use(
  session({
    secret: config.sessionKey, // 用于加密 session ID 的字符串（必须）
    resave: false, // 强制每次请求都保存 session（推荐 false）
    saveUninitialized: true, // 初始化未设置内容的 session 也保存（推荐 true）
    cookie: {
      maxAge: 1000 * 60 * 1, // session 有效期：1分钟
      secure: false, // 确保http能发送cookie
    },
  }),
)
// 封装自定义全局中间件
const { setUserPXData } = require('./Implement/ExecuteUserData')
webapp.use(async (req, res, next) => {
  res.cc = function (err, status) {
    res.status(status === undefined ? 206 : status).send({
      status: status,
      message: err instanceof Error ? err.message : err,
    })
  }
  await setUserPXData(req, res)
  next()
})
/* 中间件 */

/* 路由模块 */
const article_list_router = require('./RouterGroup/Article')
const user_login_Router = require('./RouterGroup/Login')
const get_data_Router = require('./RouterGroup/Data')
const userinfo_Router = require('./RouterGroup/Userinfo')
const setting_Router = require('./RouterGroup/Setting')
const user_mail_Router = require('./RouterGroup/Mail')
const user_public_Router = require('./RouterGroup/AllPublic')
const CtrlAPIPort = require('./controlPanel/RouterGroup/CtrlApiPort') // 控制面板接口
const CountRG = require('./calculation/RouterGroup/Count') // 数据计算接口

webapp.use('/api/article', expressJWT(config.options), article_list_router) // 权限接口 获取用户文章
webapp.use('/api/users', expressJWT(config.options), userinfo_Router) // 权限接口 用户信息的增删改查
webapp.use('/api/setting', expressJWT(config.options), setting_Router) // 权限接口 管理员修改站点信息
webapp.use('/api/Ctrl', expressJWT(config.options), CtrlAPIPort) // 权限接口 后台管理面板接口 严格控制
webapp.use('/api/Count', CountRG) // 后台 未开发
webapp.use('/api/my', user_login_Router) // 登录注册 非权限接口
webapp.use('/api/getmail', user_mail_Router) // 获取验证码 非权限接口
webapp.use('/api/data', get_data_Router) // get数据接口 非权限接口
webapp.use('/api/public', user_public_Router) // 公共接口
webapp.use('/api/public/uploads', express.static(config.path)) // 获取图片静态资源

/* 路由模块 */

// 定义错误级别中间件 拦截未知错误
webapp.use((err, req, res, next) => {
  if (err instanceof Joi.ValidationError)
    return res.send({
      message: err.message,
        status: 400,
    })
  if (err.name === 'UnauthorizedError')
    return res.status(401).send({
      message: '身份认证失败,请登录',
      status: 401,
    })
  if (err.name === 'PayloadTooLargeError')
    return res.send({
      message: '文件过大，请重试',
      status: 204,
    })
  return res.send({
    message: err.message,
    status: 204,
  })
})

//     监听项目端口，运行时要修改
webapp.listen(config.Port, () => {
  console.log('server Open ' + config.Port + ' listening')
})
