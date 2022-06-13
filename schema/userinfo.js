// 用户信息更新验证模块
const joi = require('joi')

const username = joi.string()
const password = joi.string().pattern(/^[\S]{6,12}$/)
const sex = joi.number().min(1).max(1)
const city = joi.string()
const my_content = joi.string().max(60)
// 定义 id, nickname, emial 的验证规则
const id = joi.number().integer().min(1).required()
const nickname = joi.string()
const email = joi.string().email()
// 定义头像base64格式的验证规则
const user_pic = joi.string()
const user_content = joi.string().max(255)


exports.cag_UserInfo = {
  body:{
    id,
    user_pic,
    nickname,
    email,
    sex,
    city,
    user_content,
  }
}
exports.del_UserInfo = {
  body:{
    id
  }
}
exports.get_UserInfoUN = {
  body:{
    username
  }
}
