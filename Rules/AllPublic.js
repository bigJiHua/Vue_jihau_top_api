// 导入定义验证规则的模块
const joi = require('joi')
// 定义的验证规则
const id = joi.string().required()
// 搜索词
exports.spsPostData = {
  body: {
    set_title: joi.string().max(15).min(3).required(),
    set_url: joi.string().max(300).required(),
    set_difault: joi.string().max(300).required(),
    set_time: joi.string().allow(null, ''),
  },
}
exports.getFuntion = {
  body: {
    met: joi.string().required(),
    captcha: joi.string().required(),
  },
}
