/* 这个data所有接口均是get 接口，只能获取数据*/
const express = require('express')
const router = express.Router()
const expressJoi = require('@escook/express-joi')

/* 路由处理模块 */
const article_function = require('../router_function/article')
router.get('/list', article_function.article_list)
router.get('/cates', article_function.article_cates)



module.exports = router