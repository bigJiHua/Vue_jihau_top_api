// APi设置面板
// API端口
const kuo = 80
// 不进行token验证的子口
const api = [/^\/data|\/my|\/archives\/|\/public\//]
const cagapi = [/^\/api\/data|\/api\/my|\/api\/archives\/|\/api\/public\//]
// 文件上传路径
const path = 'C:\\Users\\jihua\\Desktop\\node\\api111\\api\\public/uploads'
const selpath = 'https://jihau.top/public/uploads/'
/*　生成格式化日期 */
const dayjs = require('dayjs')
let d = new Date()
const pub_date = dayjs(d).format('YYYY-MM-DD')
const pub_month = dayjs(d).format('MM')
/* 生成随机ＵＩＤ */
const art_idnum = Math.floor(Math.random() * (100 - 10 + 1)) + 10
let str = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
function generateMixed(n) {
    let res = "";
    for(let i = 0; i < n ; i ++) {
        let id = Math.ceil(Math.random() * 35);
        res += str[id];
      }
      return res + art_idnum;
}
//
// // 定时清理ev_userartdata 点赞和评论都为0的函数
// const db = require('./database/linkdb')
// function clearUserartdata () {
//     const promise = new Promise((resolve,reject)=>{
//         const sql = `select
//         ev_userartdata.goodnum,ev_userartdata.collect
//         from
//         ev_userartdata
//         where goodnum =0 and collect = 0
//         `
//         db.query(sql,(err,results) => {
//             if(err) {
//                 const data = {
//                     err: err,
//                     log: '自动化处理点赞和评论失败',
//                     user: 'admin',
//                     pub_date: pub_date
//                 }
//                 db.query(`insert into ev_error_log set ?`,data,(err,results)=>{
//                     if(err) return
//                 })
//             }
//             const sql = `update ev_userartdata set state=1 where goodnum=0 and collect=0`
//             db.query(sql,(err,results)=>{
//                 if(err) {
//                     const data = {
//                         err: err,
//                         log: '自动化处理点赞和评论失败',
//                         user: 'admin',
//                         pub_date: pub_date
//                     }
//                     db.query(`insert into ev_error_log set ?`,data,(err,results)=>{
//                         if(err) return
//                     })
//                 }
//                 const data = {
//                     err: results,
//                     log: '自动化处理点赞和评论成功',
//                     user: 'admin',
//                     pub_date: pub_date
//                 }
//                 db.query(`insert into ev_error_log set ?`,data,(err)=>{
//                     if(err) return
//                 })
//             })
//         })
//     })
//     console.log('执行')
// }
//
// setInterval(clearUserartdata,1000*60*60*18)

module.exports={
      kuo,
    path,
    selpath,
      api,
      pub_date,
      pub_month,
      generateMixed,
}
