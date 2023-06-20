// 获取验证码
const express = require('express')
const router = express.Router()
const expressJoi = require('@escook/express-joi')
const user_mail_Router = require("../router_function/mail")
const checkEmaiil = require("../schema/Email")

router.post('/checkEmail', expressJoi(checkEmaiil.checkEmaiil) ,user_mail_Router.CheckEmail)
module.exports = router