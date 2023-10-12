// 导入定义验证规则的模块
const joi = require('joi')

const met = joi.string().required()
const data = joi.string().allow(null, '')
const username = joi.string().required()

// 验证规则对象 - 发布文章
exports.getSetting = {
  body: {
    username,
    met,
    data,
  },
}

exports.DevPSetting = {
  body: {
    username,
    met,
    data,
  },
}
