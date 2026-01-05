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

router.patch(
  '/cagUser',
  expressJoi(userinfoRules.cag_UserInfo),
  userinfoRM.cagUserInfo,
) // 权限接口， 改用户信息
router.patch(
  '/cagpow',
  expressJoi(userinfoRules.cag_UserPower),
  userinfoRM.cagUserPower,
) // 权限接口 改用户权限
router.patch(
  '/cagpwd',
  expressJoi(userinfoRules.cag_UserPassword),
  userinfoRM.cagUserPwd,
) // 权限接口 改密码
router.get(
  '/delUser',
  expressJoi(userinfoRules.DeleteUserAcount),
  CheckUserStatus,
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
router.post(
  '/relation',
  expressJoi(userinfoRules.RelationData),
  userinfoRM.postUserRelation,
) // 用户关系接口
router.get(
  '/relation',
  expressJoi(userinfoRules.getRelationData),
  userinfoRM.getUserRelation,
) // 查两人关系 以及获取关系列表
router.get('/actdata', userinfoRM.UserActiveData) // 用户获取点赞收藏接口
router.get(
  '/getUinfo',
  async (req, res, next) => {
    await VerifyAdministratorIdentity(req, res, next)
  },
  userinfoRM.getUserInfoList,
) // 权限接口， 获取所有用户列表(管理员) V2遗留接口
router.get(
  '/msg',
  expressJoi(userinfoRules.getUserMessage),
  userinfoRM.UserMessageHandler,
) // 权限接口， 获取用户消息数据)
router.patch(
  '/msg',
  expressJoi(userinfoRules.delUserMessage),
  userinfoRM.ChangeMessageHandler,
) //修改状态
router.get('/?', userinfoRM.getUserInfoUN) // 权限接口， 获取username的消息数据
module.exports = router
