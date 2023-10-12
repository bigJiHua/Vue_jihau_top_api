const joi = require('joi')
const { allow } = require('joi')

const cagUserName = joi.string().required()
const articleId = joi.string().required()
const func = joi.string().required()
const type = joi.string().required()
const Num = joi.number().required()
const id = joi.required()
const data = joi.required()
const user = joi.string().required()

exports.ChangeAndGetUsersData = {
  body: {
    data: data.optional(),
    id: id.optional(),
  },
  data: {
    Num,
    type,
  },
}
exports.UserLog = {
  data: {
    id,
    type,
  },
}
exports.CagUesrData = {
  body: {
    data,
    type,
    id,
  },
}

exports.cagUserPageData = {
  body: {
    cagUserName,
    articleId,
    func,
  },
  data: {
    type,
  },
}

exports.CagUesrPower = {
  body: {
    data: joi.string().allow(),
    user,
  },
  data: {
    type,
  },
}
