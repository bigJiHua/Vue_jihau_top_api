const db = require('../database/linkdb')
const setting = require('../setting')

exports.router_getSetting = (req,res) => {
    const getValue = req.query.value
    if (getValue === 'Lunbo') {
        const sql = `select * from ev_setting where set_name=?`
        db.query(sql,getValue,(err, results) => {
            if(err) return res.cc(err)
            if(results.length === 0 ) return res.cc('什么也没找到', 404)
            res.status(200).send({
                status: 200,
                message: '获取成功',
                data: results
            })
        })
    }
}
