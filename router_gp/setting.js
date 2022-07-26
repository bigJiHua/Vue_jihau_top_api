const express = require('express')
const router = express.Router()
const expressJoi = require('@escook/express-joi')

const Setting_schema_M = require('../schema/Setting')
const Setting_Router = require('../router_function/setting_link')

router.post('/Lunbo',expressJoi(Setting_schema_M.getSetting),Setting_Router.router_setLunbo)
router.post('/DevP',expressJoi(Setting_schema_M.DevPSetting),Setting_Router.router_setDevp)
router.post('/SpsList',expressJoi(Setting_schema_M.DevPSetting),Setting_Router.router_setSpsList)

module.exports = router
