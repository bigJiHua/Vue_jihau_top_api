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
const get_archives_Router = require('../../RouterFunction/Archives') // 利旧接口

// 严格校验用户身份中间件
const {VerifyAdministratorIdentity} = require('../../Implement/middleware/VerifyAdministrator-identity')
router.use((req,res,next) => {VerifyAdministratorIdentity(req, res, next)})

// 接口
router.post('/articlelist', Article_RM.SelectArticle) // 获取文章列表
router.get('/article',expressJoi(ArticleRules.getArticleId),  get_archives_Router.getArticle)  // 请求获得文章数据
router.post('/cagUPData',expressJoi(user_cagPageData), Article_RM.cagUPData) // 更改用户的操作
router.post('/cagUAData',expressJoi(ArticleRules.cagUserArticleDetail), Article_RM.cagUAData) // 更改用户文章
router.get('/searchArticle',expressJoi(ArticleRules.SearchKey),Article_RM.searchArticle)
module.exports = router
