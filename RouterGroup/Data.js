/* 这个data所有接口均是get 接口，只能获取数据*/
const express = require('express')
const router = express.Router()
const expressJoi = require('@escook/express-joi')
/* 路由处理模块 */
const article_function = require('../RouterFunction/Article')
const getSetting_function = require('../RouterFunction/Setting_link')
const get_archives_Router = require('../RouterFunction/Archives')

const ArchiveRules = require('../Rules/Archives')

router.get('/list', article_function.article_list)  // 首页列表
router.get('/archive', article_function.article_archive) // 文章归档
router.get('/Setting', getSetting_function.router_getSetting) // 首页设置信息
router.get('/article',expressJoi(ArchiveRules.getArticleId), get_archives_Router.getArticle)  // 请求获得文章数据
router.get('/UpreadNum',expressJoi(ArchiveRules.getArticleId),get_archives_Router.UpdateReadNum)
module.exports = router
