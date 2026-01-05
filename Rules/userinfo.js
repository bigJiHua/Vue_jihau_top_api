// 用户信息更新验证模块
const joi = require('joi')
const user_id = joi.required()
const oldpwd = joi.string().required().min(6).max(25)
const newpwd = joi.string().required().min(6).max(25)
const user = joi.string().required()

// 改用户信息
exports.cag_UserInfo = {
  body: {
    user_id,
    // 涉及上传base64头像 不要limit
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

exports.authData = {
  data: {
    id: joi.string().required(),
  },
}

exports.authArticleData = {
  data: {
    user,
    page: joi.required(),
  },
}
exports.RelationData = {
  body: {
    author: joi.string().required(),
  },
}
exports.getRelationData = {
  data: {
    author: joi.string().required(),
    met: joi.string().required(),
    Num: joi.number(),
  },
}
exports.getUserMessage = {
  data: {
    Num: joi.required(),
  },
}
exports.delUserMessage = {
  body: {
    id: joi.required(),
    type: joi.required(),
  },
}
exports.userData = {
  data: {
    user: joi.string().required(),
  },
}
