const db = require('../DataBase/linkdb')
// 写入日志方法
const setSystemLogFunc = async (err, log, todo, user) => {
  if (err === '' || log === '') return
  const InsetErrorSql = `insert into ev_error_log set ?`
  const data = {
    err: JSON.stringify(err),
    log,
    todo: todo !== '' ? todo : '0',
    user: user !== '' ? user : 'admin',
    pub_date: new Date().getTime(),
  }
  db.query(InsetErrorSql, data, async (err) => {
    if (err) {
      console.log(err)
    }
  })
}
module.exports = {
  setSystemLogFunc,
}
