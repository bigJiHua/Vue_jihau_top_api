/* 这个data所有接口均是get 接口，只能获取数据*/
const express = require('express')
const router = express.Router()
/* 路由处理模块 */
const article_function = require('../router_function/article')
const getSetting_function = require('../router_function/setting_link')
router.get('/list', article_function.article_list)
router.get('/archive', article_function.article_archive)
router.get('/cates', article_function.article_cates)
router.get('/Lunbo', getSetting_function.router_getLunbo)

module.exports = router
