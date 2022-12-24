// 导入定义验证规则的模块
const joi = require('joi')
const user = joi.string().required()
const code = joi.string().required()


// 验证规则对象 - 发布文章
exports.checkEmaiil = {
    body: {
        user,
        code
    }
}

