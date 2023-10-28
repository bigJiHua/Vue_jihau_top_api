// 导入定义验证规则的模块
const joi = require('joi')
// 定义文章id的验证规则
const id = joi.string().required()
exports.getArticleId = {
  data: {
    id,
    user: joi.string().allow(null, ''),
    type: joi.string().allow(null, ''),
  },
}
// 搜索词
exports.SearchKeyWorld = {
  data: {
    key: joi.string().min(1).max(50).required(),
    type: joi.string().required(),
  },
}
