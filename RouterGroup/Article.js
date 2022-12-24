/* 这是一个关于文章的【路由模块】 */
const express = require('express')
const router = express.Router()
const expressJoi = require('@escook/express-joi')
const setting = require('../setting')
/* 文件上传 */
const multer = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, setting.path)
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
const upload = multer({
    limit: {
        // 限制上傳檔案的大小為 4MB
        fileSize: 4000000
    },
    storage
})

/* 文件上传 */

/* 路由处理模块 */
const article_function = require('../RouterFunction/Article')
const {
    article_add_schema,
    article_id_schema,
    article_cag_schema,
    article_delimage,
    article_getimage
} = require('../Rules/put_article')
/* 路由处理模块 */

// 导入post所需要的验证路由处理模块
router.post('/addart', expressJoi(article_add_schema), article_function.article_put) // 新增文章
router.post('/delart?', expressJoi(article_id_schema), article_function.article_del) // 删除文章
router.post('/cagart', expressJoi(article_cag_schema), article_function.article_cag) // 修改文章
router.post('/img', article_function.article_image) // 获取名下图片
router.post('/upimg/', upload.single('file'), article_function.article_upimage) // 文件上传接口
router.post('/imgdel?', expressJoi(article_delimage), article_function.article_imagedel) // 删除图片
router.get('/?', article_function.article_uget)    // 获取username下的文章列表

module.exports = router
