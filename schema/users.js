const joi = require('joi')

const username = joi.string().min(3).max(15).required() //.alphanum()
const password = joi.string().pattern(/^[\S]{6,12}$/).required()
const email = joi.string().email().required()


const sex = joi.number().min(1).max(1)
const city = joi.string()
const my_content = joi.string().max(60)
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
    sex,
    city,
    my_content
  }
}