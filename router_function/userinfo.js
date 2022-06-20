const db = require('../database/linkdb')
const bcrypt = require('bcryptjs/dist/bcrypt')
const e = require('express')
const expressJoi = require("@escook/express-joi")

exports.getUserInfo = (req,res) => {
  const sql = `SELECT * FROM ev_users`
  db.query(sql,(err,results)=>{
    if(err) return res.cc(err)
    //if (results.length !== 1) return res.cc('获取用户信息列表为空')
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
      return res.send({
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
