const db = require('../database/linkdb')
const bcrypt = require('bcryptjs/dist/bcrypt')
const e = require('express')

exports.getUserInfo = (req,res) => {
  const sql = `SELECT * FROM ev_users`
  db.query(sql,(err,results)=>{
    if(err) return res.cc(err)
    //if (results.length !== 1) return res.cc('获取用户信息列表为空')
    const data = results
    res.json({
      status:0,
      message:'获取用户信息列表成功',
      data
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
      res.send({
        status: 0,
        message:'信息更改成功'
      })
    })
  })

}
exports.delUserInfo = (req,res) => {
  const body = req.body
  res.send({
    status: 9,
    message:'!WARN 闭环测试状态，注销用户功能暂不提供'
  })
}
