// APi设置面板
// API端口
const kuo = 80
// 不进行token验证的子口
// const api = ['/data/list','/data/cates','/my/reguser','/my/login','/uploads/','/archives/']
const api = [/^\/data|\/my|\/archives\/|\/uploads\//]
/*　生成格式化日期 */
const dayjs = require('dayjs')
let d = new Date()
const put_date = dayjs(d).format('YYYY-MM-DD')
/* 生成随机ＵＩＤ */
const art_idnum = Math.floor(Math.random() * (100 - 10 + 1)) + 10
var str = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
function generateMixed(n) {
      var res = "";
      for(var i = 0; i < n ; i ++) {
          var id = Math.ceil(Math.random()*35);
          res += str[id];
      }
      return res + art_idnum;
}

module.exports={
  kuo,
  api,
  put_date,
  generateMixed,
}
