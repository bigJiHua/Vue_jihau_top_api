const joi = require('joi')

const username = joi.string().min(3).max(15).required()
const password = joi.string().required().min(6).max(25)

exports.user_loginRouter = {
    body: {
        username,
        password
    }
}
