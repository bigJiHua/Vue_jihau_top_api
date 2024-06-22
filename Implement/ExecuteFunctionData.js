const db = require('../DataBase/linkdb')
const { setSystemLogFunc } = require('./ExecuteSystemLog')

function ExecuteFunctionData(sql, data) {
  return new Promise((resolve, reject) => {
    db.query(sql, data, async (err, results) => {
        if (err) {
          await setSystemLogFunc(err, 'ExecuteFunction查询错误', '0', 'admin')
          return reject(err)
        } else {
          resolve(results)
        }
    })
  })
}

module.exports = ExecuteFunctionData
