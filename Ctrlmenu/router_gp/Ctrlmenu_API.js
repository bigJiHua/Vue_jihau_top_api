/* 后台管理 */
const express = require('express')
const router = express.Router()
const expressJoi = require('@escook/express-joi')

// TODO　后台管理面板测试API
router.get('/',(req,res)=>{
    res.status(200).send({
        status: 200,
        message: 'Hello World'
    })
})

module.exports = router
