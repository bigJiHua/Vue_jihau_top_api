/* 这是一个关于文章的 路由【处理模块】 */
// 导入数据库
const db = require('../database/linkdb')
const setting = require('../setting')

// 获取文章列表
exports.article_list = (req, res) => {
  const sql = `select * from ev_articles where is_delete=0`
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
    results.forEach((item) =>{
      const obj = {
        id    : item.id,
        month : item.pub_month,
        title : item.title,
        hurl  : item.article_id
        }
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
  const user = req.query.username
  const sql = 'SELECT * FROM ev_articles WHERE username=? AND is_delete=0'
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
  put_data.pub_date = setting.pub_date
  put_data.pub_month = setting.pub_month
  const UID = setting.generateMixed(4)
  const sql = `select * from ev_articles where article_id=?`
  db.query(sql, UID, (err, results) => {
    if (err) return res.cc(err)
    if (results.length !== 0) return res.cc('UID重复!WARN! 备份好数据，请重新发布')
    put_data.article_id = UID
    const sql = `SELECT * FROM ev_articles WHERE title=?`
    db.query(sql,put_data.title, (err, results) => {
      const err1 = '文章已经被发布过啦！请换一个标题吧!'
      if (err) return res.cc(err)
      if (results.length !== 0) return res.cc(err1)
      // 插入sql
      put_data.state = '已发布'
      const sql = `insert into ev_articles set ?`
      db.query(sql, put_data, (err, results) => {
        if (err) return res.cc(err)
        if (results.affectedRows !== 1) return res.cc('发布文章失败，请重新再试')
        res.status(200).send({
          message: '发布文章成功!',
          article: UID
        })
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
// 更改文章
exports.article_cag = (req,res) => {
  const username = req.body.username
  const artid = req.body.article_id
  const  sqlus = `select * from ev_articles where username=? and article_id=?`
  db.query(sqlus,[username,artid],(err, results)=>{
    if(err) return res.cc(err)
    if(results.length === 0 ) return res.cc('非法用户或非法文章ID，请复制保存好您的文章数据再次提交修改')
    const sql = `update ev_articles set ? where username=? and article_id=?`
    db.query(sql,[req.body,username,artid],(err,results)=>{
      if(err) return res.cc(err)
      if(results.affectedRows !== 1 ) return res.cc('更新文章失败，请保存好数据重新提交')
      res.status(200).send({
        status: 200,
        message: '文章更新成功'
      })
    })
  })
}


// 发布文章分类
exports.article_upd = (req, res) => {
  const put_data = req.body
  put_data.pub_date = setting.put_date
  const sql = `insert into ev_articles set ?`
  db.query(sql, put_data, (err, results) => {
    if (err) return res.cc(err)
    if (results.length === 0) return res.cc('发布文章失败 !')
    res.cc('发布文章成功！')
  })
}


// 获取名下图库
exports.article_image = (req,res) => {
  const username = req.body.picusername
  if (username === 'undefined') return res.cc('用户名不能为undefined')
  const sql = 'select * from ev_userimage where username=? and state=0'
  db.query(sql, username, (err, results) => {
    if(err) return res.cc(err)
    if(results.length === 0) return res.cc('空空如也')
    res.status(200).send({
      status: 200,
      message: '获取图片成功',
      data: results
    })
  })
}

// 新增名下图库照片
exports.article_upimage = (req,res) => {
  const path = setting.selpath + req.file.originalname
  const username = req.body.username
  if (req.file.length === 0) res.cc('上传文件不能为空')
  const data = {
    username: username,
    userimage: path
  }
  const sql = `insert into ev_userimage set ?`
  db.query(sql,data,(err,results)=>{
    if(err) return res.cc(err)
    if (results.affectedRows !== 1) return res.cc('存储失败，请重新再试',406)
    res.status(200).send({
      status:200,
      message: '文件接收成功'
    })
  })
}

// 删除名下图库照片
exports.article_imagedel = (req,res) => {
  const body = req.body
  const sql = `select * from ev_userimage where username=?`
  db.query(sql,body.picusername,(err,results)=>{
    if(err) return res.cc(err,500)
    if(results.length === 0 ) return res.cc('操作错误',406)
    const sql = `delete from ev_userimage where id=?`
    db.query(sql,body.id,(err,results)=>{
      if(err) return res.cc(err)
      if (results.affectedRows !== 1) return res.cc('删除失败',406)
      res.status(200).send({
        status: 200,
        message:'删除成功'
      })
    })
  })
}
