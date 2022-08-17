const joi = require('joi')

const username = joi.string().min(3).max(15).required() //.alphanum()
const password = joi.string().pattern(/^[\S]{6,12}$/).required()
const email = joi.string().email().required()
const sex = joi.string().allow(null, '')
const city = joi.string().allow(null, '')
const user_content = joi.string().allow(null, '')
const user_pic = joi.string().allow(null, '')
const birthday = joi.string().allow(null, '')

exports.user_loginRouter = {
    body: {
        username,
        password
    }
}
exports.user_regUserRM = {
    body: {
        username,
        password,
        email,
        birthday,
        sex,
        city,
        user_content,
        user_pic
    }
}
