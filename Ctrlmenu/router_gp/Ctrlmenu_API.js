/* 后台管理 */
const express = require('express')
const router = express.Router()
const expressJoi = require('@escook/express-joi')

const CtrlLogin_schema_M = require('../schema/CtrlMenuLogin')
const Ctrlmenu_Router = require('../router_function/Ctrlmenu_Router')
// 登录接口
router.post('/login', expressJoi(CtrlLogin_schema_M.user_loginRouter),Ctrlmenu_Router.user_login_API)

module.exports = router
