const mysql = require('mysql')
const config = require('../config')

const db = mysql.createPool({
  host: '127.0.0.1',
  user: config.dbUser,
  password: config.dbPassword,
  database: config.dbBase,
})
module.exports = db
