const express = require('express')
const router = express.Router()
const expressJoi = require('@escook/express-joi')

const Setting_schema_M = require('../Rules/Setting')
const Setting_Router = require('../RouterFunction/Setting_link')
const {VerifyAdministratorIdentity} = require('../Implement/middleware/VerifyAdministrator-identity')
router.post('/Lunbo', expressJoi(Setting_schema_M.getSetting), (req,res,next) => {
    VerifyAdministratorIdentity(req,res,next)
} , Setting_Router.router_setLunbo)
router.post('/DevP', expressJoi(Setting_schema_M.DevPSetting), (req,res,next) => {
    VerifyAdministratorIdentity(req,res,next)
} ,  Setting_Router.router_setDevp)
router.post('/SpsList', expressJoi(Setting_schema_M.DevPSetting), (req,res,next) => {
    VerifyAdministratorIdentity(req,res,next)
} ,  Setting_Router.router_setSpsList)

module.exports = router
