const db = require('../DataBase/linkdb')
const res = require('express')

function ExecuteFunction(sql) {
    if (sql) {
        return new Promise((resolve, reject) => {
            db.query(sql, (err, results) => {
                if (err) {
                    return res.cc(err, 500)
                }
                resolve(results)
            })
        })
    } else {
        return res.cc('缺失Sql语句', 500)
    }
}

module.exports = ExecuteFunction
