// Implement/middleware/CheckWebsiteApiPort.js
const ExecuteFunction = require('../ExecuteFunction')
const ExecuteFunctionData = require('../ExecuteFunctionData')
const { setSystemLogFunc } = require('../ExecuteSystemLog')

// ✅ 高阶函数
const CheckWebSiteAPIPort = (settingKey) => {
  return async (req, res, next) => {
    if (!settingKey) {
      return res.status(500).json({
        message: '缺少系统配置键',
      })
    }

    const rows = await ExecuteFunctionData(
      'SELECT setting_value FROM website_settings WHERE setting_key = ?',
      [settingKey],
    )

    if (rows.length === 0) {
      await setSystemLogFunc(
        'System',
        `系统API缺少维护键值 ${settingKey}`,
        '404',
        'system',
      )
    }

    if (rows[0].setting_value === 'true') {
      return next()
    }

    return res.status(404).json({
      status: 404,
      message: '请求地址不可达！',
    })
  }
}

module.exports = { CheckWebSiteAPIPort }
