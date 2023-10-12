const mysql = require('mysql')

// const db = mysql.createPool({
//   host: '47.115.225.101',
//   user: 'my_db_01',
//   password: 'admin',
//   database: 'my_db_01'
// })

const db = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'my_db_01',
})
module.exports = db
