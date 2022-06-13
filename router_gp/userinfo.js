const express = require('express')
const router = express.Router()
const expressJoi = require('@escook/express-joi')

const uif_data_check = require('../schema/userinfo')
const userinfo_RM = require('../router_function/userinfo')

router.get('/getUinfo',userinfo_RM.getUserInfo)// 权限接口， 获取用户列表
router.post('/delUser',expressJoi(uif_data_check.del_UserInfo),userinfo_RM.delUserInfo)// 权限接口， 删
router.post('/cagUser',expressJoi(uif_data_check.cag_UserInfo),userinfo_RM.cagUserInfo)// 权限接口， 改


// router.post('/sacUser',)// 权限接口， 查
// router.post('/addUser',)// 权限接口， 增

module.exports = router
