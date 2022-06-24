const db = require('../database/linkdb')
const bcrypt = require('bcryptjs/dist/bcrypt')
const {json} = require("express"); // 用户信息修改密码加密

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
  const body = req.body
  res.send({
    status: 500,
    message:'!WARN 闭环测试状态，注销用户功能暂不提供'
  })
}

// 用户行动

function action(body) {
  switch(body.actmenthos) {
    case 'goodnum':
      return data = {
        message: '点赞',
        data: {
          username: body.username,
          goodnum : 1,
          article_id: body.articleid,
        }
      }
      break
    case 'collect':
      return data = {
        message: '收藏',
        data: {
          username: body.username,
          collect : 1,
          article_id: body.articleid,
        }
      }
      break
    case 'comment':
      return data = {
        message: '评论',
        data: {
          username: body.username,
          comment : body.comment,
          article_id: body.articleid
        }
      }
      break
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
      break
    case 'collect':
      return data = {
        message: '取消收藏',
        data: {
          username: body.username,
          collect : 0,
          article_id: body.articleid,
        }
      }
      break
    case 'comment':
      return data = {
        message: '删除评论',
        data: {
          username: body.username,
          comment : '',
          article_id: body.articleid
        }
      }
      break
  }
}

exports.UserActive = (req,res) => {
  const body = req.query
  const data = action(body)
  const func = body.actmenthos
  const cledata = clearaction(body)
  const articleid = body.articleid
  console.log(req.query)
  if (articleid !== undefined) {
    const sql = `select article_id from ev_userartdata where username=? and article_id=?`
    db.query(sql,[body.username,articleid], (err, results) => {
      console.log(results)
      if (err) return res.cc(err)
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
      if(results.length > 0) {
        const sql = `select ${func} from ev_userartdata where username=? and article_id=?`
        db.query(sql,[body.username,articleid], (err,results) => {
          if(err) return res.cc(err)
          if(results.length === 0) return res.cc('操作错误')
          const rval0 = JSON.parse(JSON.stringify(results))[0]
          const k = Object.values(rval0)[0]
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
  } else {
    res.status(500).send({
      status: 500,
      message: '文章id错误'
    })
  }

}
/*
*
*
    const rval = JSON.parse(JSON.stringify(results))
    const getdata = rval[0][`${func}`]
    if(err) return res.cc(err)
    if(getdata.length) {
      res.status(200).send({
        status: 200,
        message: '点赞成功',
        data: data
      })
    }
    if (results.length === 0) {
      const sql = 'insert into ev_userartdata set ?'
      db.query(sql,data,(err,results) => {
        if(err) return res.cc(err)
        if(results.affectedRows !== 1 ) return res.cc(`${data.message}失败`)
        res.send({
          status: 200,
          message: `${data.message}成功`
        })
      })
    }
    if (results.length >= 1) {
      const sql = `select ${body.actmenthos} from ev_userartdata where username=?`
      db.query(sql,body.username,(err,results) => {
        if(err) return res.cc(err)
        if(results.value === 0 ) {
          const sql = 'insert into ev_userartdata set ?'
          db.query(sql,body.actmenthos,(err,results) =>{
            if(err) return res.cc(err)
            if(results.length === 0) res.cc('操作失败')
            res.status(200).send({
              status:200,
              message: `${body.actmenthos}成功`
            })
          })
        }
        const sql = `update ev_userartdata set ? where username=?`
        const cledata = clearaction(body)
        db.query(sql,[cledata.data,body.username],(err,results) => {
          if(err) return res.cc(err)
          if(results.length ===0 ) return res.cc('取消失败')
          res.status(200).send({
            status:200,
            message: `${cledata.message}成功`,
          })
        })
      })
    }
*
* */
