/* 这是一个用于校验管理员身份的中间件 */
const config = require('../../config')
const ExecuteFunc = require('../ExecuteFunction')
const ExecuteFuncData = require('../ExecuteFunctionData')

exports.VerifyAdministratorIdentity = async (req, res, next) => {
    // 校验管理员身份 Verify administrator identity
    const getUser = req.body.username
    const useridentity = '管理员'
    // 校验身份 verify identity
    const verifyIdentitySql = `select * from ev_users where username=? and useridentity=?`
    const verifyIdentity = await ExecuteFuncData(verifyIdentitySql, [
        getUser,
        useridentity,
    ])
    if (verifyIdentity.length === 0) {
        res.status(202).send({
            status: 404,
            message: '非管理员禁止操作!',
        })
    } else {
        next()
    }
}
