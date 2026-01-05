const ExecuteFunction = require("../Implement/ExecuteFunction")
const { setSystemLogFunc } = require('../Implement/ExecuteSystemLog')

const CheckWebSiteStatus = async (req, res, next) => {
  const CheckSystemStatus = await ExecuteFunction(`Select setting_value FROM website_settings WHERE setting_key = 'maintain'`)
  if (CheckSystemStatus.length === 0) {
    await setSystemLogFunc('System', '系统API缺少维护键值' + key + '数据', '404', 'system')
  }
  if (CheckSystemStatus[0].setting_value === 'true') {
    return res.status(503).json({
      status: 503,
      message: '系统维护中，请稍后再试',
      redirectUrl: '/error/503', // 可选的重定向地址
      estimatedRecoveryTime: '2024-01-01 12:00:00' // 预估恢复时间
    })
  } else {
    next()
  }
}
module.exports = { CheckWebSiteStatus }