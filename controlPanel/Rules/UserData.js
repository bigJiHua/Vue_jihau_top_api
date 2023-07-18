const joi = require('joi')

// const email = joi.string().email().required()
const cagUserName = joi.string().required()
const articleId = joi.string().required()
const func = joi.string().required()
const type = joi.string().required()

exports.user_cagPageData = {
    body: {
        cagUserName,
        articleId,
        func
    },
    data: {
        type
    }
}
