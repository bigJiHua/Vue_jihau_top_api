// 获取验证码
const express = require('express')
const router = express.Router()
const expressJoi = require('@escook/express-joi')
const user_mail_Router = require("../RouterFunction/Mail")
const checkEmaiil = require("../Rules/Email")

router.post('/checkEmail', expressJoi(checkEmaiil.checkEmaiil) ,user_mail_Router.CheckEmail)
module.exports = router
