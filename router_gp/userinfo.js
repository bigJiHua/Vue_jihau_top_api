const express = require('express')
const router = express.Router()
const expressJoi = require('@escook/express-joi')

const uif_data_check = require('../schema/userinfo')
const userinfo_RM = require('../router_function/userinfo')

router.get('/getUinfo',userinfo_RM.getUserInfo)// 权限接口， 获取所有用户列表(管理员)
router.get('/delUser',userinfo_RM.delUserInfo)  // 权限接口， 删
router.patch('/cagUser',expressJoi(uif_data_check.cag_UserInfo),userinfo_RM.cagUserInfo) // 权限接口， 改
router.patch('/cagpwd',expressJoi(uif_data_check.cag_UserPassword),userinfo_RM.cagUserPwd) // 权限接口 改密码

// 用户对文章的点赞、收藏、评论操作接口
router.get('/action',userinfo_RM.UserActive)
// 用户获取点赞收藏接口
router.get('/actdata',userinfo_RM.UserActiveData)
// 用户取消点赞收藏接口
router.get('/delact',userinfo_RM.UserDelActive)
// 权限接口， 获取username的数据
router.get('/?',userinfo_RM.getUserInfoUN)
module.exports = router
