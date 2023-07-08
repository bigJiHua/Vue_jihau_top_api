// 导入定义验证规则的模块
const joi = require('joi')
// 定义文章id的验证规则
const id = joi.string().required()
exports.getArticleId = {
    data:{
        id
    }
}
