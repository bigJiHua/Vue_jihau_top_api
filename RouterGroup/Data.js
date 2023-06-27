/* 这个data所有接口均是get 接口，只能获取数据*/
const express = require('express')
const router = express.Router()
/* 路由处理模块 */
const article_function = require('../RouterFunction/Article')
const getSetting_function = require('../RouterFunction/Setting_link')
router.get('/list', article_function.article_list)
router.get('/archive', article_function.article_archive)
router.get('/Setting', getSetting_function.router_getSetting)
module.exports = router
