/* 这是一个关于文章的【路由模块】 */
const db = require('../database/linkdb')
const express = require('express')
const router = express.Router()


router.get('/?', (req, res) => {
    const UID = req.query.id
    const data = {
        article: '',
        comment: '',
        goodnum: 0,
        collect: 0
    }
    const sql = `select * from ev_articles where article_id=? and is_delete=0`
    db.query(sql, UID, (err, results) => {
        if (err) return res.cc(err)
        if (results.length === 0) return res.cc('404 NOT FOUNT', 404)
        data.article = results[0]
        const sql0 = `select
    ev_userartdata.goodnum,ev_userartdata.collect
    from ev_userartdata where article_id = ?`
        db.query(sql0, UID, (err, results) => {
            if (err) return res.cc(err)
            const newArry = JSON.parse(JSON.stringify(results))
            for (let key in newArry) {
                data.goodnum += parseInt(newArry[key].goodnum)
                data.collect += parseInt(newArry[key].collect)
            }
            const sql2 = `select 
        ev_userartdata.goodnum,ev_userartdata.collect
        from ev_userartdata where article_id=? and username=?`
            db.query(sql2, [UID, req.query.user], (err, results) => {
                if (err) return res.cc(err)
                const getdata = JSON.parse(JSON.stringify(results))[0]
                if (getdata) {
                    data.acgoodnum = parseInt(getdata.goodnum) === 1;
                    data.accollect = parseInt(getdata.collect) === 1;
                    const sql1 = `select * from ev_usercomment  where article_id = ?`
                    db.query(sql1, UID, (err, results) => {
                        if (err) return res.cc(err)
                        data.comment = results
                        // const user = [...new Set(results.map((word) => word.username))]
                        res.status(200).send({
                            status: 200,
                            message: '获取文章成功',
                            data: data
                        })
                    })
                } else {
                    const sql1 = `select * from ev_usercomment  where article_id = ?`
                    db.query(sql1, UID, (err, results) => {
                        if (err) return res.cc(err)
                        data.comment = results
                        res.status(200).send({
                            status: 200,
                            message: '获取文章成功',
                            data: data
                        })
                    })
                }
            })
        })
    })
})


module.exports = router
