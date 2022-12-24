const db = require('../DataBase/linkdb')
const res = require('express')

function ExecuteFunction(sql) {
    if (sql) {
        return new Promise((resolve, reject) => {
            db.query(sql, (err, results) => {
                if (err) {
                    console.error(err, 500)
                    return
                }
                resolve(results)
            })
        })
    }
}

module.exports = ExecuteFunction
