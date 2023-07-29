// 导入定义验证规则的模块
const joi = require('joi')
// 定义文章id的验证规则
const id = joi.string().required()
const cagid = joi.string
const action = joi.string()
const key = joi.string().required()
const Num = joi.number().required()
const type = joi.string().required()
const content  = joi.string().required()
const keyword  = joi.string().required()
const lable  = joi.string().required()
const title  = joi.string().required()
const data = joi.string().required()
const reason = joi.string().min(1).max(250).required()

const is_delete  = joi.required()
const pub_date  = joi.required()
const whosee  = joi.number()
const state  = joi.number()
const read_num  = joi.required()
// 统一获取数据列表
exports.getData = {
    data: {
        Num,
        type
    }
}

exports.getDetail = {
    data: {
        id,
        type
    }
}

exports.getArticleId = {
    data:{
        id
    }
}
exports.cagUserArticleDetail = {
    body:{
        reason,
        data,
        type
    }
}
exports.SearchKey = {
    data: {
        key
    }
}
exports.postNotify = {
    body:{
        title,
        content,
        lable,
        keyword,
        whosee,
        state,
    },
    data: {
        id
    }
}
exports.getOrCageRecycle = {
    data: {
        cagid,
        type,
        action
    }
}
