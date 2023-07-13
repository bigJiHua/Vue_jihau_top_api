const mysql = require('mysql')

const db = mysql.createPool({
  host: '',
  user: '',
  password: '',
  database: ''
})

module.exports = db
