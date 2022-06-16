const express = require('express')
const router = express.Router()
const expressJoi = require('@escook/express-joi')

const uif_data_check = require('../schema/userinfo')
const userinfo_RM = require('../router_function/userinfo')

// 权限接口， 获取username的数据
router.get('/:username',expressJoi(uif_data_check.get_UserInfoUN),userinfo_RM.getUserInfoUN)
router.get('/getUinfo',userinfo_RM.getUserInfo)// 权限接口， 获取用户列表
// 权限接口， 删
router.post('/delUser',expressJoi(uif_data_check.del_UserInfo),userinfo_RM.delUserInfo)
// 权限接口， 改
router.patch('/cagUser',expressJoi(uif_data_check.cag_UserInfo),userinfo_RM.cagUserInfo)


// router.post('/sacUser',)// 权限接口， 查
// router.post('/addUser',)// 权限接口， 增

module.exports = router
