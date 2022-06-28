const db = require('../database/linkdb')
const bcrypt = require('bcryptjs/dist/bcrypt')// 用户信息修改密码加密
const setting = require('../setting')

exports.getUserInfo = (req,res) => {
  const sql = `SELECT * FROM ev_users`
  db.query(sql,(err,results)=>{
    if(err) return res.cc(err)
    if (results.length === 0) return res.cc('获取用户信息列表为空')
    const data = results
    res.status(200).send({
      status:200,
      message:'获取用户信息列表成功',
      data
    })
  })
}
// 根据用户名查数据
exports.getUserInfoUN = (req, res) => {
  const UN = req.params.username
  const sql = `select * from ev_users where username=?`
  db.query(sql, UN, (err, results) => {
    if (err) return res.cc(err)
    if (results[0] === undefined)
      return res.status(204).send({
        status: 204,
        message: '数据查找失败 || 无符合条件数据'
      })
    res.send({
      status: 200,
      message: '用户信息数据获取成功！',
      data: {...results[0], password:null}
    })
  })
}

exports.cagUserInfo = (req,res) => {
  const body = req.body
  const sql = `select * from ev_users where id=?`
  db.query(sql,body.id,(err,results)=>{
    if(err) return res.cc(err)
    if(results.length !== 1 ) return res.cc('非法id ！')
    const sql = `update ev_users set ? where id=?`
    db.query(sql,[body,body.id],(err,results)=>{
      if(err) return res.cc(err)
      if (results.affectedRows !== 1) return res.cc('更新用户数据失败')
      res.status(200).send({
        status: 200,
        message:'信息更改成功'
      })
    })
  })
}
exports.delUserInfo = (req,res) => {
  // console.log(req.query.user)
  res.send({
    status: 406,
    message:'WARN 406! 闭环测试状态，注销用户功能暂不提供'
  })
}

// 用户行动
function action(body) {
  if (body.actmenthos === 'goodnum') {
    return data = {
      message: '点赞',
      data: {
        username: body.username,
        goodnum: 1,
        article_id: body.articleid,
      }
    }
  } else if (body.actmenthos === 'collect') {
    return data = {
      message: '收藏',
      data: {
        username: body.username,
        collect: 1,
        article_id: body.articleid,
      }
    }
  } else if (body.actmenthos === 'comment') {
    return data = {
      message: '评论',
      data: {
        username: body.username,
        comment: body.comment,
        article_id: body.articleid,
        pub_date: setting.pub_date
      }
    }
  }
}
function clearaction(body) {
  switch(body.actmenthos) {
    case 'goodnum':
      return data = {
        message: '取消点赞',
        data: {
          username: body.username,
          goodnum : 0,
          article_id: body.articleid,
        }
      }
    case 'collect':
      return data = {
        message: '取消收藏',
        data: {
          username: body.username,
          collect : 0,
          article_id: body.articleid,
        }
      }
  }
}
exports.UserActive = (req,res) => {
  const body = req.query
  const func = body.actmenthos
  const delcomment = body.delcomment
  const articleid = body.articleid
  const data = action(body)
  const cledata = clearaction(body)
  // 如果查询的文章ID为undefined 则打回去报错
  if (articleid !== undefined) {
    // 判断func 用于区分作者是点赞收藏还是评论
    if (func === 'goodnum' || func === 'collect') {
      // 查询这个用户之前有没有操作过 （如果有操作过是可以查询到article_id的）
      const sql = `select article_id from ev_userartdata where username=? and article_id=?`
      db.query(sql,[body.username,articleid], (err, results) => {
        if (err) return res.cc(err)
        // 如果没有操作过 则新插入
        if (results.length === 0) {
          const sql = 'insert into ev_userartdata set ?'
          db.query(sql,data.data,(err,results) => {
            if(err) return res.cc(err)
            if(results.affectedRows !== 1 ) return res.cc(`${data.message}失败`)
            res.send({
              status: 200,
              message: `${data.message}成功`
            })
          })
        }
        // 如果操作过 则更新之前的操作 【例如 点赞、收藏变为取消】
        if(results.length > 0) {
          const sql = `select ${func} from ev_userartdata where username=? and article_id=?`
          db.query(sql,[body.username,articleid], (err,results) => {
            if(err) return res.cc(err)
            if(results.length === 0) return res.cc('操作错误')
            const rval0 = JSON.parse(JSON.stringify(results))[0]
            const k = Object.values(rval0)[0]
            // k = 1 意思就是查到的操作在该文章已经点赞过或者收藏过，则就 反向操作进行取消
            if(k === '1'){
              const sql = `update ev_userartdata set ? where username=? and article_id=?`
              db.query(sql,[cledata.data,body.username,articleid],(err,results) =>{
                if(err) return res.cc(err)
                if(results.affectedRows !== 1 ) return res.cc('操作失败')
                res.status(200).send({
                  status:200,
                  message: cledata.message + '成功'
                })
              })
            } else {
              const sql = `update ev_userartdata set ? where username=? and article_id=?`
              db.query(sql,[data.data,body.username,articleid],(err,results) =>{
                if(err) return res.cc(err)
                if(results.affectedRows !== 1 ) return res.cc('操作失败')
                res.status(200).send({
                  status:200,
                  message: data.message + '成功'
                })
              })
            }
          })
        }
      })
    } else if(func==='comment'){
      if(delcomment){
        const sql=`delete from ev_usercomment where username=? and article_id=?`
        db.query(sql,[body.username,articleid],(err,results)=>{
          if(err) return  res.cc(err)
          if(results.affectedRows!==1)  return  res.cc('删除失败')
          res.status(200).send({
            status:200,
            message:'删除成功'
          })
        })
      }else{
        const sql='insert into ev_usercomment set ?'
        db.query(sql,data.data,(err,results)=>{
          if(err) return res.cc(err)
          if(results.affectedRows!==1)return res.cc(`${data.message}失败`)
          res.status(200).send({
            status:200,
            message:'评论成功!'
          })
        })
      }
    }
  } else {
    res.status(500).send({
      status: 500,
      message: '文章id错误'
    })
  }
}

// 获取点赞和评论
exports.UserActiveData = async (req,res) => {
  const body = req.query
  const data = {}
  const sqlg =  `select
    s.title,s.article_id,s.cover_img,s.username,s.content,d.id
    from ev_userartdata d,ev_articles s
    where d.article_id = s.article_id
    and d.goodnum = 1 and d.username=?`
  const sqls =  `select
    s.title,s.article_id,s.cover_img,s.username,s.content,d.id
    from ev_userartdata d,ev_articles s
    where d.article_id = s.article_id
    and d.collect = 1 and d.username=?`
  const sqlc =  `select
    s.article_id,s.title,s.username,d.comment,d.pub_date,s.cover_img,d.id
    from ev_usercomment d,ev_articles s
    where d.article_id = s.article_id
    and d.username=?`
  data.goodnum = await doActiveData(sqlg,body.user)
  data.collect = await doActiveData(sqls,body.user)
  data.comment = await doActiveData(sqlc,body.user)
  data.goodnums = data.goodnum.length
  data.collects = data.collect.length
  data.comments = data.comment.length
  res.status(200).send({
    status: 200,
    message: '获取消息成功',
    data: data
  })
}

function doActiveData (sql, username){
  const promise = new Promise((resolve, reject) => {
    db.query(sql,username,(err,results)=> {
      if(err){
        reject(err)
        return
      }
      resolve(results)
    })
  }).catch( err =>{
    return err
  })
  return promise
}



// 删除评论
exports.UserDelActive = async (req, res) => {
  const body = req.query
  if (body.username !== undefined) {
    const sql = `delete from ev_usercomment where id=? and username=? and article_id=?`
    db.query(sql,[body.id,body.username,body.article_id],(err,results) => {
      if(err) return res.cc(err)
      if(results.affectedRows === 0) res.cc('删除失败',500)
      res.status(200).send({
        status: 200,
        message: '删除成功'
      })
    })
  } else {
    res.status(404).send({
      status: 404,
      message: '用户名不能为undefined'
    })
  }
}
