/* 这是一个关于文章的【路由模块】 */
const express = require('express')
const router = express.Router()
const expressJoi = require('@escook/express-joi')

/* 路由处理模块 */
const article_function = require('../router_function/article')
const { add_article_schema,article_id_schema,article_userget_schema } = require('../schema/put_article')
// 导入post所需要的验证路由处理模块
router.get('/:username',expressJoi(article_userget_schema), article_function.article_uget)
router.post('/addart', expressJoi(add_article_schema), article_function.article_put) // 新增文章
router.get('/delart/:id',expressJoi(article_id_schema),article_function.article_del) // 删除文章
router.get('/updcate/:id',expressJoi(add_article_schema),article_function.article_upd) // 更新分类

module.exports = router
