const express = require('express')
const router = express.Router()
const expressJoi = require('@escook/express-joi')

const uif_data_check = require('../Rules/userinfo')
const userinfo_RM = require('../RouterFunction/Userinfo')
const {CheckUserStatus} = require('../Implement/middleware/CheckUserStatus')

router.patch('/cagUser', expressJoi(uif_data_check.cag_UserInfo), userinfo_RM.cagUserInfo) // 权限接口， 改用户信息
router.patch('/cagpwd', expressJoi(uif_data_check.cag_UserPassword), userinfo_RM.cagUserPwd) // 权限接口 改密码
router.get('/getUinfo', userinfo_RM.getUserInfo)// 权限接口， 获取所有用户列表(管理员)
router.get('/delUser', userinfo_RM.delUserInfo)  // 权限接口， 删
router.get('/action', userinfo_RM.UserActive)   // 用户对文章的点赞、收藏、评论操作接口
router.get('/actdata', userinfo_RM.UserActiveData)  // 用户获取点赞收藏接口
router.get('/delact', userinfo_RM.UserDelActive)    // 用户取消点赞收藏接口
router.get('/?',(req,res,next) => {
    CheckUserStatus(req,res,next)
} ,  userinfo_RM.getUserInfoUN) // 权限接口， 获取username的消息数据
module.exports = router
