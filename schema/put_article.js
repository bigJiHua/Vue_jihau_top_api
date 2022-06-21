// 导入定义验证规则的模块
const joi = require('joi')

// 定义 标题、分类Id、内容、发布状态 的验证规则
const title = joi.string().required()
const cate_id = joi.number().integer().min(1).required()
const content = joi.string().required().min(1).max(3000)
const cover_img = joi.string()
const pub_date  = joi.string().max(10)
const is_top = joi.number().min(1).max(1)
const state = joi.string().valid('已发布', '草稿').required()
const lable = joi.string().allow('新文章')
// 定义文章id的验证规则
const id = joi.number().integer().min(1).required()
const article_id = joi.string()
const username = joi.string()
const picusername = joi.string().required()
const userimage = joi.string()


// 验证规则对象 - 发布文章
exports.article_add_schema = {
    body: {
        id,
        username,
        title,
        content,
        cover_img,
        pub_date,
        state,
        is_top,
        cate_id,
        lable,
        article_id
    },
}

exports.article_id_schema = {
    body:{
        id,
    }
}

exports.article_userget_schema = {
    body:{
        username,
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
