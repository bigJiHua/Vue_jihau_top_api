/* 这是一个关于文章的【路由模块】 */
const db = require('../database/linkdb')
const express = require('express')
const router = express.Router()


router.get('/?',(req, res) => {
  const UID = req.query.id
  const sql = `select * from ev_articles where article_id=? and is_delete=0`
  db.query(sql, UID, (err, results) => {
    if (err) return res.cc(err)
    if (results.length === 0) return res.cc('404 NOT FOUNT',404)
    res.status(200).send({
      status: 200,
      message: '获取文章成功',
      data: results[0]
    })
  })
})


module.exports = router
