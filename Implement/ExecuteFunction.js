const db = require('../DataBase/linkdb')
const { setSystemLogFunc } = require('./ExecuteSystemLog')

function ExecuteFunction(sql) {
  if (sql) {
    return new Promise((resolve, reject) => {
      db.query(sql, async (err, results) => {
        if (err) {
          await setSystemLogFunc(err, 'ExecuteFunction查询错误', '0', 'admin')
          return reject(err)
        }
        return resolve(results)
      })
    })
  }
}

module.exports = ExecuteFunction
