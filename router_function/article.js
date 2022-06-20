/* 这是一个关于文章的 路由【处理模块】 */
// 导入数据库
const db = require('../database/linkdb')
const session = require('express-session')
const setting = require('../setting')
// 获取文章列表
exports.article_list = (req, res) => {
  const sql = `select *from ev_articles where is_delete=0`
  db.query(sql, (err, results) => {
    if (err) return res.cc(err)
    res.status(200).send({
      status: 200,
      message: '获取成功',
      data: results
    })
  })
}
// 获取文章归档
exports.article_archive = (req, res) => {
  const sql = `select *from ev_articles where is_delete=0`
  db.query(sql, (err, results) => {
    const newArry = []
    results.forEach((item,index) =>{
      const obj = new Object
      obj.id = item.id
      obj.month = item.pub_date
      obj.title = item.title
      obj.hurl = item.article_id
      newArry.push(obj)
    })
    if (err) return res.cc(err)
    res.status(200).send({
      status: 200,
      message: '获取成功',
      data: newArry
    })
  })
}
// 获取文章分类
exports.article_cates = (req, res) => {
  const sql = `select * from ev_article_cate`
  db.query(sql, (err, results) => {
    if (err) return res.cc(err)
    res.status(200).send({
      status: 200,
      message: '获取成功',
      data: results,
    })
  })
}
// 查找名下的文章
exports.article_uget = (req, res) => {
  const user = req.params.username
  const sql = 'SELECT * FROM ev_articles WHERE username=?'
  db.query(sql, user, (err,results) => {
    if (err) return res.cc(err)
    if (results.length === 0) return res.cc('当前用户没有文章')
    res.status(200).send({
      status: 200,
      message: '获取用户文章成功',
      data: results
    })
  })
}
// 发布文章
exports.article_put = (req, res) => {
  const put_data = req.body
  put_data.pub_date = setting.put_date
  const UID = setting.generateMixed(4)
  const sql = `select * from ev_articles where article_id=?`
  db.query(sql, UID, (err, results) => {
    if (err) return res.cc(err)
    if (results.length === 2) return res.cc('UID重复!WARN')
    put_data.article_id = UID
    const sql = `SELECT * FROM ev_articles WHERE title=? or article_id=?`
    db.query(sql, [put_data.title, put_data.article_id], (err, results) => {
      const err1 = '文章已经被发布过啦！请换一个标题吧!'
      const err2 = `文章标题和文章id被占用！`
      const err3 = `!WARN 文章id被占用!`
      if (err) return res.cc(err)
      if (results.length === 2) return res.cc(err1)
      if (
        results.length === 1 &&
        results[0].title === put_data.title &&
        results[0].article_id === put_data.article_id
      )
        return res.cc(err1)
      if (results.length === 1 && results[0].title === put_data.title)
        return res.cc(err2)
      if (results.length === 1 && results[0].article_id === put_data.article_id)
        return res.cc(err3)
      // 插入sql
      const sql = `insert into ev_articles set ?`
      db.query(sql, put_data, (err, results) => {
        if (err) return res.cc(err)
        if (err) return res.cc(err)
        if (results.affectedRows !== 1)
          return res.cc('发布文章失败，请重新再试')
        if (results.length === 0) return res.cc('发布文章失败 !')
        res.cc('发布文章成功！')
      })
    })
  })
}
// 删除文章
exports.article_del = (req, res) => {
  const sql = `update ev_articles set is_delete=1 where id=?`
  db.query(sql, req.body.id, (err, results) => {
    if (err) return res.cc(err)
    if (results.affectedRows !== 1) return res.cc('删除文章失败，请重新再试')
    res.send({
      status: 200,
      message: '删除成功!',
    })
  })
}
// 发布文章分类
exports.article_upd = (req, res) => {
  const put_data = req.body
  put_data.pub_date = put_date
  const sql = `insert into ev_articles set ?`
  db.query(sql, put_data, (err, results) => {
    if (err) return res.cc(err)
    if (results.length === 0) return res.cc('发布文章失败 !')
    res.cc('发布文章成功！')
  })
}
