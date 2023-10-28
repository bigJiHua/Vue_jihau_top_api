const express = require('express')
const router = express.Router()
const expressJoi = require('@escook/express-joi')

const user_login_Router = require('../RouterFunction/Login')
const user_schema_M = require('../Rules/users')
// 严格校验用户身份中间件
const { VerifyAdministratorIdentity } = require('../Implement/middleware/CheckUserMiddleware')

router.post('/login', expressJoi(user_schema_M.user_loginRouter), user_login_Router.user_login_API)
router.post('/reguser', expressJoi(user_schema_M.user_regUserRM), user_login_Router.regUser)
// 控制面板的 登录接口 严格控制
router.post(
  '/Ctrllogin',
  expressJoi(user_schema_M.user_loginRouter),
  async (req, res, next) => {
    await VerifyAdministratorIdentity(req, res, next)
  },
  user_login_Router.user_login_API,
)

module.exports = router
