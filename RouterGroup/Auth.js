const express = require('express')
const router = express.Router()
const expressJoi = require('@escook/express-joi')

const Auth_Func = require('../RouterFunction/Auth')
const user_schema_M = require('../Rules/users')
// 严格校验用户身份中间件
const { VerifyAdministratorIdentity } = require('../Implement/middleware/CheckUserMiddleware')

router.post('/login', expressJoi(user_schema_M.user_loginRouter), Auth_Func.user_login_API) // 登录
router.post('/reguser', expressJoi(user_schema_M.user_regUserRM), Auth_Func.regUser) // 注册
// 控制面板的 登录接口 严格控制
router.post(
    '/Ctrllogin',
    expressJoi(user_schema_M.user_loginRouter),
    async (req, res, next) => {
        await VerifyAdministratorIdentity(req, res, next)
    },
    Auth_Func.user_login_API,
) // 后台登录
router.get('/route', Auth_Func.CheckRoute) // 检查路由

module.exports = router
