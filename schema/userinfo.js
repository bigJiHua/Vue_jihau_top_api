// 用户信息更新验证模块
const joi = require('joi')

const birthday = joi.string()
const city = joi.string()
const email = joi.string().email()
const id = joi.number().integer().min(1).required()
const nickname = joi.string()
const password = joi.string().pattern(/^[\S]{6,12}$/)
const sex = joi.string().min(1).max(1)
const state = 0
const user_content = joi.string().max(255)
const user_pic = joi.string()
const useridentity = joi.string().max(3)
const username = joi.string()

// 用户信息
exports.cag_UserInfo = {
  body:{
    id,
    birthday,
    city,
    email,
    nickname,
    sex,
    user_content,
    user_pic,
    username
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
