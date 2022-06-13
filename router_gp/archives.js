/* 这是一个关于文章的【路由模块】 */
const db = require('../database/linkdb')
const express = require('express')
const router = express.Router()
const expressJoi = require('@escook/express-joi')

const { artsear_id_schema } = require('../schema/put_article')
router.get('/:id',expressJoi(artsear_id_schema),(req, res) => {
  const sql = `select * from ev_articles where article_id=?`
  db.query(sql, req.body.article_id, (err, results) => {
    if (err) return res.cc(err)
    if (results[0] === undefined) return res.cc('查询失败')
    const UID = results[0]
    res.send(
    `
        <script>
            window.location.replace("https://jihau.top/article/'${UID}'")
        </script>
    `
    )
  })
})


module.exports = router