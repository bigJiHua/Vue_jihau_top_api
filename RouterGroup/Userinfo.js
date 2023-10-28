const express = require('express')
const router = express.Router()
const expressJoi = require('@escook/express-joi')

const userinfoRules = require('../Rules/userinfo')
const userinfoRM = require('../RouterFunction/Userinfo')
const {
  VerifyAdministratorIdentity,
  CheckUserPower,
  CheckUserStatus,
} = require('../Implement/middleware/CheckUserMiddleware')

router.patch('/cagUser',expressJoi(userinfoRules.cag_UserInfo),userinfoRM.cagUserInfo,
) // 权限接口， 改用户信息
router.patch('/cagpow', expressJoi(userinfoRules.cag_UserPower), userinfoRM.cagUserPower) // 权限接口 改用户权限
router.patch('/cagpwd', expressJoi(userinfoRules.cag_UserPassword), userinfoRM.cagUserPwd) // 权限接口 改密码
router.get(
  '/delUser',
  expressJoi(userinfoRules.DeleteUserAcount),
  async (req, res, next) => {
    await CheckUserStatus(req, res, next)
  },
  userinfoRM.delUserInfo,
) // 权限接口， 删
router.post(
  '/action',
  expressJoi(userinfoRules.UserAction),
  async (req, res, next) => {
    await CheckUserPower(req, res, next, 'iscom')
  },
  userinfoRM.UserActive,
) // 用户对文章的点赞、收藏、评论操作接口
router.get('/actdata', userinfoRM.UserActiveData) // 用户获取点赞收藏接口
router.get(
  '/getUinfo',
  async (req, res, next) => {
    await VerifyAdministratorIdentity(req, res, next)
  },
  userinfoRM.getUserInfoList,
) // 权限接口， 获取所有用户列表(管理员)
router.get('/?', expressJoi(userinfoRules.UserNameRoule), userinfoRM.getUserInfoUN) // 权限接口， 获取username的消息数据
module.exports = router
