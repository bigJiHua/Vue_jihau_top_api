// 写入日志方法
const ExecuteFuncData = require('../Implement/ExecuteFunctionData')
const config = require('../config')

exports.setUserLoginLog = async (req, { user_id, token, status, err_message }) => {
  const insertUserLogSql = `INSERT INTO ev_login_log set ? `
  // 记录操作日志
  const UserLogData = {
    user_id: user_id,
    token: token,
    login_time: new Date().getTime(),
    login_ip: req.headers.host,
    login_device: JSON.stringify(req.headers['user-agent']),
    login_lang: JSON.stringify(req.headers['accept-language']),
    status: status,
    error_message: err_message,
    user_agent: req.headers['user-agent'],
    path: req.headers.origin + ' to ' + req.headers.referer,
  }
  try {
    // // 执行log
    await ExecuteFuncData(insertUserLogSql, [UserLogData])
  } catch (err) {
    // 计入错误日志
    const insertErrorLogSql = `INSERT INTO ev_error_log set ?`
    await ExecuteFuncData(
      insertErrorLogSql,
      [err.code + ' AND ' + err.sqlMessage],
      err.sql,
      '',
      user_id,
      config.pub_date,
    )
  }
}
