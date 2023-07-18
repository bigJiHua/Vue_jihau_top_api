const express = require('express')
const router = express.Router()
const expressJoi = require('@escook/express-joi')
/*
*  统一接口为 /User..***
*  严格校验用户身份
*/
const Article_RM = require('../RouterFunction/ArticleData')
const {user_cagPageData} = require('../Rules/UserData')
const ArticleRules = require('../Rules/ArticleData')

// 严格校验用户身份中间件
const {VerifyAdministratorIdentity} = require('../../Implement/middleware/VerifyAdministrator-identity')
router.use((req,res,next) => {VerifyAdministratorIdentity(req, res, next)})

// API接口
router.get('/getData',expressJoi(ArticleRules.getData),Article_RM.SelectData) // 统一获取数据列表
router.get('/getDetail',expressJoi(ArticleRules.getDetail),Article_RM.getDetail) // 统一获取详细内容
router.post('/cagUPData',expressJoi(user_cagPageData), Article_RM.cagUPData) // 更改用户的操作
router.post('/cagUAData',expressJoi(ArticleRules.cagUserArticleDetail), Article_RM.cagUAData) // 更改用户文章
router.get('/searchArticle',expressJoi(ArticleRules.SearchKey),Article_RM.searchArticle) // 搜索文章
router.post('/postnotify',expressJoi(ArticleRules.postNotify),Article_RM.postNotify)    // 发布通知


module.exports = router
