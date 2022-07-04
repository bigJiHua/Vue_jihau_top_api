// 用户信息更新验证模块
const joi = require('joi')

const birthday = joi.string().allow(null, '')
const city = joi.string().allow(null, '')
const email = joi.string().allow(null, '')
const id = joi.number().integer().min(1).required()
const nickname = joi.string().allow(null, '')
const password = joi.string().pattern(/^[\S]{6,12}$/)
const sex = joi.string().allow(null, '')
const user_content = joi.string().max(255).allow(null, '')
const user_pic = joi.string().allow(null, '')
const useridentity = joi.string().allow(null, '')
const oldpwd = joi.string().required()
const newpwd = joi.string().required().min(6).max(25)
const username = joi.string().required()

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
    username,
    useridentity
  }
}

// 修改密码
exports.cag_UserPassword = {
  body: {
    oldpwd,
    newpwd,
    username
  }
}
