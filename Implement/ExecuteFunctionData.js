const db = require('../DataBase/linkdb')

function ExecuteFunctionData(sql, data) {
    return new Promise((resolve, reject) => {
        db.query(sql, data, (err, results) => {
            if (err) {
                return reject(err)
            } else {
                resolve(results)
            }
        })
    })
}

module.exports = ExecuteFunctionData
