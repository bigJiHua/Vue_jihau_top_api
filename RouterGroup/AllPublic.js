/* 这个data所有接口均是get 接口，只能获取数据*/
const express = require('express')
const router = express.Router()
const expressJoi = require('@escook/express-joi')
const config = require('../config')
const ExecuteFuncData = require('../Implement/ExecuteFunctionData')
/* 路由处理模块 */
const User_Feedback = require('../RouterFunction/AllPublic/feedback')
const User_Public = require('../RouterFunction/AllPublic/index')

/* 路由规则 */
const AllPublic = require('../Rules/AllPublic')

/* Router */
router.post('/spsPost', expressJoi(AllPublic.spsPostData), User_Feedback.user_post_spslist) // 提交友链申请
router.get(
  '/captcha',
  async (req, res, next) => {
    const page = req.body.page ?? req.query.page
    let selectValue = ''
    if (page === 'sps') selectValue = 'spsport'
    const checkPowerSql = `Select * from website_settings where setting_key =? AND value_type = 'boolean'`
    const checkPower = await ExecuteFuncData(checkPowerSql, selectValue)
    // if (checkPower.length === 0) next()
    if (checkPower.length !== 0) {
      const isTrue = checkPower[0].setting_value === 'true'
      if (isTrue) next()
      else return res.cc('此功能已关闭！', 404)
    }
    return 
  },
  User_Public.user_get_captcha,
) // 获取验证码
router.post('/captcha', expressJoi(AllPublic.getFuntion), User_Public.user_get_captcha) // 校验验证码
module.exports = router
