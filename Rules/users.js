const joi = require('joi')

const username = joi.string().min(3).max(15).required() //.alphanum()
const password = joi
  .string()
  .pattern(/^[\S]{6,30}$/)
  .required()
const email = joi.string().email().required()

exports.user_loginRouter = {
  body: {
    username,
    password,
  },
}
exports.user_regUserRM = {
  body: {
    username,
    password,
    email,
  },
}
