const mysql = require('mysql')

const db = mysql.createPool({
  host: '127.0.0.2',
  user: 'admin',
  password: 'admin',
  database: 'admin'
})

module.exports = db
