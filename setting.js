// APi设置面板
// API端口
const kuo = 80 // 20907
// 不进行token验证的子口
// const api = [/^\/data|\/my|\/archives\/|\/public\/|^\/sitemap/]
// 部署API
const api = [/^\/api\/data|\/api\/my|\/api\/archives\/|\/api\/public\/|^\/sitemap/]
// 文件上传路径
const path = '/www/wwwroot/jihau_top/public/uploads'
// 文件访问路径
const selpath = 'https://jihau.top/api/public/uploads/'
/*　生成格式化日期 */
const dayjs = require('dayjs')
let d = new Date()
const pub_date = dayjs(d).format('YYYY-MM-DD')
const pub_month = dayjs(d).format('MM')
// 生成随机ＵＩＤ
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


module.exports={
      kuo,
    path,
    selpath,
      api,
      pub_date,
      pub_month,
      generateMixed,
}
