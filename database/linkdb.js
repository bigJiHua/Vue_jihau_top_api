const mysql = require('mysql')

const db = mysql.createPool({
    host:'',
    user:'node_mysql',
    password:'admin',
    database:'my_db_01'
})

module.exports = db
