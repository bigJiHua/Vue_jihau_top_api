// 用户信息更新验证模块
const joi = require('joi')
const id = joi.number().integer().min(1).required()
const user_id = joi.required()
const oldpwd = joi.string().required().min(6).max(25)
const newpwd = joi.string().required().min(6).max(25)
const username = joi.string().required()
const user = joi.string().required()

// 改用户信息
exports.cag_UserInfo = {
  body: {
    user_id,
    setData: joi.string().required(),
  },
}

// 修改密码
exports.cag_UserPassword = {
  body: {
    oldpwd,
    newpwd,
  },
}
// 改权限
exports.cag_UserPower = {
  body: {
    type: joi.string().required(),
    value: joi.string().required(),
  },
}

exports.UserAction = {
  body: {
    username,
    articleid: joi.required(),
    type: joi.string().required(),
    comment: joi.string().allow(),
  },
}
exports.DeleteUserAcount = {
  data: {
    user,
    deluser: joi.string().required(),
  },
}
exports.UserNameRoule = {
  data: {
    user,
  },
}
exports.authData = {
  data: {
    user,
  },
}
