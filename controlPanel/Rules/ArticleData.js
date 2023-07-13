// 导入定义验证规则的模块
const joi = require('joi')
const {required} = require("joi");
// 定义文章id的验证规则
const id = joi.string().required()
const key = joi.string().required()
const article_cate  = joi.string().required()
const article_id  = joi.string().required()
const content  = joi.string().required()
const cover_img  = joi.string().required()
const keyword  = joi.string().required()
const lable  = joi.string().required()
const title  = joi.string().required()
const username  = joi.string().required()
const data = joi.string().required()
const reason = joi.string().min(20).max(400).required()

const is_delete  = joi.required()
const pub_date  = joi.required()
const pub_month  = joi.required()
const state  = joi.required()
const read_num  = joi.required()
exports.getArticleId = {
    data:{
        id
    }
}
exports.cagUserArticleDetail = {
    body:{
        reason,
        data
    }
}
exports.SearchKey = {
    data: {
        key
    }
}
