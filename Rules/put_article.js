// 导入定义验证规则的模块
const joi = require('joi')

// 定义 标题、分类Id、内容、发布状态 的验证规则
const title = joi.string().max(30).required()
// const cate_id = joi.number().integer().min(1).required()
const content = joi.string().required().min(1)
const cover_img = joi.string().allow(null, '')
const pub_date = joi.string().max(10)
const lable = joi.string()
// 定义文章id的验证规则
const id = joi.number().integer().required()
const article_id = joi.string().required()
const username = joi.string().required()
const picusername = joi.string().required()
const keyword = joi.string()


// 验证规则对象 - 发布文章
exports.article_add_schema = {
    body: {
        username,
        title,
        content,
        cover_img,
        pub_date,
        lable,
        keyword,
    },
}


exports.article_cag_schema = {
    body: {
        id,
        username,
        title,
        content,
        cover_img,
        lable,
        keyword,
        article_id
    },
}

exports.article_id_schema = {
    body: {
        id
    }
}


// 图库
exports.article_getimage = {
    data: {
        picusername
    }
}

exports.article_delimage = {
    body: {
        picusername,
        id
    }
}
