/* 这是一个关于文章的【路由模块】 */
const db = require('../database/linkdb')
const express = require('express')
const router = express.Router()
const expressJoi = require('@escook/express-joi')

const { artsear_id_schema } = require('../schema/put_article')
router.get('/:id',expressJoi(artsear_id_schema),(req, res) => {
  const UID = req.params.id
  const sql = `select * from ev_articles where article_id=?`
  db.query(sql, UID, (err, results) => {
    if (err) return res.cc(err)
    if (results[0] === undefined)
      return res.send({
        message: '404 NOT FOUND'
      })
    res.send(
        `
        <script>
            window.location.replace("https://jihau.top/article/${UID}")
        </script>
    `
    )
  })
})


module.exports = router
