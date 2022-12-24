const mysql = require('mysql')

const db = mysql.createPool({
  host: '127.0.0.1',
  user: 'admin',
  password: 'admin',
  database: 'admin'
})

module.exports = db
