const mysql = require('mysql')

const db = mysql.createPool({
    host: '43.129.172.233',
    user: 'node_mysql',
    password: 'admin',
    database: 'my_db_01'
})

module.exports = db
