const joi = require('joi')

const cagUserName = joi.string().required()
const articleId = joi.string().required()
const func = joi.string().required()
const type = joi.string().required()
const Num = joi.number().required()
const id = joi.required()
const data = joi.required()

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

exports.ChangeAndGetUsersData = {
    body: {
        data: data.optional(),
        id: id.optional()
    },
    data: {
        Num,
        type
    }
}
