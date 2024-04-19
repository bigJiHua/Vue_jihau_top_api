// 导入定义验证规则的模块
const joi = require('joi')

const met = joi.string().required()
const data = joi.string().allow(null, '')

// 验证规则对象 - 发布文章
exports.getSetting = {
  body: {
    met,
    data,
  },
}

exports.DevPSetting = {
  body: {
    met,
    data,
  },
}
