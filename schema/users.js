const joi = require('joi')

const username = joi.string().min(3).max(15).required() //.alphanum()
const password = joi.string().pattern(/^[\S]{6,12}$/).required()
const email = joi.string().email().required()
const sex = joi.string()
const city = joi.string()
const my_content = joi.string()
const user_pic = joi.string()
const birthday = joi.string()

exports.user_loginRouter = {
  body:{
    username,
    password
  }
}
exports.user_regUserRM = {
  body:{
    username,
    password,
    email,
    birthday,
    sex,
    city,
    my_content,
    user_pic
  }
}
