const express = require('express')
const router = express.Router()
const expressJoi = require('@escook/express-joi')
/*
*  统一接口为 /User..***
*  严格校验用户身份
*/
const Article_RM = require('../RouterFunction/ArticleData')
const {user_cagPageData} = require('../Rules/UserData')

// 严格校验用户身份中间件
const {VerifyAdministratorIdentity} = require('../../Implement/middleware/VerifyAdministrator-identity')
router.use((req,res,next) => {VerifyAdministratorIdentity(req, res, next)})

// 接口
router.post('/allarticle', Article_RM.SelectArticle) // 获取文章
router.post('/cagUPData',expressJoi(user_cagPageData), Article_RM.cagUPData) // 更改用户的操作
module.exports = router
