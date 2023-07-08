const joi = require('joi')
const {required} = require("joi");

const email = joi.string().email().required()
const cagUserName = joi.string().required()
const articleId = joi.string().required()
const func = joi.string().required()

exports.user_cagPageData = {
    body: {
        cagUserName,
        articleId,
        func
    }
}
