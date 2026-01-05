const express = require('express')
const router = express.Router()
const expressJoi = require('@escook/express-joi')

const ARF = require('../RouterFunction/Article')
const URF = require('../RouterFunction/User')
const CRF = require('../RouterFunction/Client')

// API接口
// 关于文章的
router.get('/artdata', ARF.CountArticleDataByDeticle) // 获取文章数据
router.get('/mAu', ARF.ShowMostArticleUser) // 获取发布文章最多的作者前10名 Most Article User
router.get('/mRa', ARF.ShowMostReadArticle) // 获取阅读量前20篇 Most Read Article
// 关于用户的
router.get('/regU', URF.ShowRegisterUser) // 展示 历史月份注册人数
router.get('/role', URF.ShowRoleUser) // 展示 管理员和用户分布图
// 关于来源的
router.get('/source', CRF.getUserSourceDevice) // 展示 文章来源数据
router.get('/pixel', CRF.getUserSourcePixel) // 统计用户来源信息（改进版）
router.get('/ucs', CRF.getUserSourceCity) // 统计用户来源城市
module.exports = router
