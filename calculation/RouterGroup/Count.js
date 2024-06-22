const express = require('express')
const router = express.Router()
const expressJoi = require('@escook/express-joi')

const ARF = require('../RouterFunction/Article')

// API接口
router.get('/data', ARF.CountArticleDataByDeticle)

module.exports = router
