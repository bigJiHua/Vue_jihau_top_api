/* 这个data所有接口均是get 接口，只能获取数据*/
const express = require('express')
const router = express.Router()
const expressJoi = require('@escook/express-joi')
/* 路由处理模块 */
const article_function = require('../RouterFunction/Article')
const getSetting_function = require('../RouterFunction/Setting_link')
const get_archives_Router = require('../RouterFunction/Archives')
const userinfoRM = require('../RouterFunction/Userinfo')

const ArchiveRules = require('../Rules/Archives')
const userinfoRules = require('../Rules/userinfo')

router.get('/list', article_function.article_list) // 首页列表
router.get('/archive', article_function.article_archive) // 文章归档
router.get('/notify', article_function.getNotifyList) // 获取通知展示列表
router.get('/Setting', getSetting_function.router_getSetting) // 首页设置信息
router.get('/article', expressJoi(ArchiveRules.getArticleId), get_archives_Router.getArticle) // 请求获得文章数据
router.get('/page', expressJoi(ArchiveRules.getArticleId), get_archives_Router.getPage) // 请求获得文章数据
router.get('/UpreadNum', expressJoi(ArchiveRules.getArticleId), get_archives_Router.UpdateReadNum) // 增加阅读数
router.get('/authData', expressJoi(userinfoRules.authData), userinfoRM.authData) // 获取作者信息
router.get('/search', expressJoi(ArchiveRules.SearchKeyWorld), get_archives_Router.SearchApi) //搜索接口
module.exports = router
