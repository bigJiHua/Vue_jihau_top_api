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

// 严格校验用户身份中间件
const {
  VerifyAdministratorIdentity,
  CheckUserStatus,
} = require('../../Implement/middleware/CheckUserMiddleware')
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

module.exports = router
