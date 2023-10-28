// 导入定义验证规则的模块
const joi = require('joi')

// 定义 标题、分类Id、内容、发布状态 的验证规则
const title = joi.string().max(30).required()
const content = joi.string().required().min(1)
const cover_img = joi.string().allow(null, '')
const pub_date = joi.string().allow(null, '')
const lable = joi.string()
// 定义文章id的验证规则
const id = joi.string().required()
const article_id = joi.string().required()
const username = joi.string().required()
const picusername = joi.string().required()
const keyword = joi.string()

// 验证规则对象 - 发布文章
exports.article_add_schema = {
  body: {
    username,
    title,
    content,
    cover_img,
    pub_date,
    lable,
    keyword,
    describes: joi.string().allow(null, 0),
    state: joi.string().allow(null, 0),
    isMd: joi.string().allow(null, 'false'),
  },
}

exports.article_cag_schema = {
  body: {
    id,
    username,
    title,
    content,
    cover_img,
    lable,
    keyword,
    article_id,
    describes: joi.string().allow(null, ''),
    state: joi.string().allow(null, ''),
  },
}

exports.article_id_schema = {
  body: {
    id,
  },
}
exports.article_get_schema = {
  data: {
    id,
  },
}

// 图库
exports.article_getimage = {
  body: {
    picusername,
  },
}

exports.article_delimage = {
  body: {
    picusername,
    id,
  },
}
