const express = require('express')
const router = express.Router()
const expressJoi = require('@escook/express-joi')
/*
 *  统一接口为 /User..***
 *  严格校验用户身份
 */
const Article_RM = require('../RouterFunction/ArticleData')
const UsersData_RM = require('../RouterFunction/UserData')
const { user_cagPageData } = require('../Rules/UserData')
const ArticleRules = require('../Rules/ArticleData')
const UserDataRules = require('../Rules/UserData')
const Setting_schema_M = require('../../Rules/Setting')
const Setting_Router = require('../../RouterFunction/Setting_link')

// 严格校验用户身份中间件
const {
  VerifyAdministratorIdentity,
  CheckUserStatus,
} = require('../../Implement/middleware/CheckUserMiddleware')
const ExecuteFuncData = require('../../Implement/ExecuteFunctionData')
router.use(async (req, res, next) => {
  await VerifyAdministratorIdentity(req, res, next)
})

// API接口
router.get('/ctrlSearch', expressJoi(ArticleRules.SearchKey), Article_RM.searchanything) // 全能搜索接口
router.get('/getData', expressJoi(ArticleRules.getData), Article_RM.SelectData) // 统一获取数据列表
router.get('/getDetail', expressJoi(ArticleRules.getDetail), Article_RM.getDetail) // 统一获取详细内容
router.get('/recycle', expressJoi(ArticleRules.getOrCageRecycle), Article_RM.getOrCageRecycle) // 回收站
router.get(
  '/Users',
  expressJoi(UserDataRules.ChangeAndGetUsersData),
  UsersData_RM.ChangeAndGetUsersData,
) // 获取用户信息
router.get('/UserLog', expressJoi(UserDataRules.UserLog), UsersData_RM.GetUserLogData) // 获取用户日志 图表走的也是这个Link
router.post('/cagUPData', expressJoi(UserDataRules.cagUserPageData), Article_RM.cagUPData) // 更改用户的操作
router.post('/cagUAData', expressJoi(ArticleRules.cagUserArticleDetail), Article_RM.cagUAData) // 更改用户文章
router.post('/postnotify', expressJoi(ArticleRules.postNotify), Article_RM.postNotify) // 发布通知
router.patch('/cagUsers', expressJoi(UserDataRules.CagUesrData), UsersData_RM.CagUesrData) // 后台管理面板的修改接口
router.post(
  '/cagPower',
  expressJoi(UserDataRules.CagUesrPower),
  async (req, res, next) => {
    if (req.query.type !== 'get') {
      await CheckUserStatus(req, res, next)
    } else {
      next()
    }
  },
  UsersData_RM.CagUesrPower,
) // 修改用户权限的接口
// 用户获取站内信
router.get('/msg', expressJoi(UserDataRules.getMessage), UsersData_RM.getMessage)
// 用户发布站内信
router.post(
  '/msg',
  expressJoi(UserDataRules.sendMessage),
  async (req, res, next) => {
    const user = req.body.getuser
    if (req.body.getuser === 'all') {
      return next()
    }
    const CheckUserStatusSql = `select user_id,username from ev_users where user_id=?`
    if (user !== undefined) {
      const CheckUserStatus = await ExecuteFuncData(CheckUserStatusSql, user)
      if (CheckUserStatus.length === 0) return res.cc('用户不存在！', 404)
      next()
    } else {
      res.cc('查询参数异常', 404)
    }
  },
  UsersData_RM.sendMessage,
)
router.patch('/msg', UsersData_RM.ChangeMessageData)
router.post('/Lunbo', expressJoi(Setting_schema_M.getSetting), Setting_Router.router_setLunbo)
router.post('/DevP', expressJoi(Setting_schema_M.DevPSetting), Setting_Router.router_setDevp)
router.post('/SpsList', expressJoi(Setting_schema_M.DevPSetting), Setting_Router.router_setSpsList)

module.exports = router
