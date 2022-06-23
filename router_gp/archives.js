/* 这是一个关于文章的【路由模块】 */
const db = require('../database/linkdb')
const express = require('express')
const router = express.Router()


router.get('/?',(req, res) => {
  const UID = req.query.id
  const sql = `select * from ev_articles where article_id=?`
  db.query(sql, UID, (err, results) => {
    if (err) return res.cc(err)
    if (results[0] === 0)
      return res.status(404).send({
        status: 404,
        message: '404 NOT FOUND',
        data: {
          content: '<h1>404 NOT FOUND</h1>'
        }
      })
    res.status(200).send({
      status: 200,
      message: '获取文章成功',
      data: results[0]
    })
  })
})


module.exports = router
