// 导入定义验证规则的模块
const joi = require('joi')
const met = joi.string().required()
const data = joi.string().allow(null, '')
const table = joi.string().required()

// 获取数据库表
exports.DatabaseData = {
  body: {
    met, // 方法
    table, // 表
    data,
  },
}
// 添加站点权限
exports.webSetting = {
  body: {
    group_key: joi.string().required(),
    setting_key: joi.string().required(),
    setting_value: joi.string().required(),
    value_type: joi.string().required(),
    description: joi.string().required(),
  },
}

// 获取数据
exports.powerdata = {
  body: {
    met,
    data: joi.string().allow(null, ''),
  },
}
