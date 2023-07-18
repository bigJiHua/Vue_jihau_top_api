// APi设置面板
// API端口
/*
*  部署三件事！！！
*  1. 修改端口号
*  2. 添加Mail密钥
*  3. 修改上传文件的访问路径 和 app.js静态资源文件访问目录
*  4. 数据库账密
*  5. 修改密钥
* */
const Port = 80
// 文件上传路径
const path = './public/uploads'
// 文件访问路径
const selpath = 'https://127.0.0.1/public/uploads/'
// 文件上传条数Max
const MaxFile = 10
/*　生成格式化日期 */
const dayjs = require('dayjs')
let d = new Date()
const pub_date = dayjs(d).format('YYYY-MM-DD')
const pub_month = dayjs(d).format('MM')
// 生成随机ＵＩＤ
const art_idnum = Math.floor(Math.random() * (100 - 10 + 1)) + 10
let str = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
// 随机数生成
function generateMixed(n) {
  let res = "";
  for (let i = 0; i < n; i++) {
    let id = Math.ceil(Math.random() * 35);
    res += str[id];
  }
  return res + art_idnum;
}
// 中文过滤器
function FilterContent (content,limit) {
  const FilterContentData = []
  for (const Value in content) {
    if (content[Value].match(/\p{sc=Han}/gu)) {
      FilterContentData.push(content[Value])
    }
  }
  return FilterContentData.splice(0, limit).join('')
}
// 挑选内容
const SelectContent = function (data,limit) {
  // 过滤筛出中文
  const CZFilterData = []
  data.forEach((value,index)=>{
    const data = value
    data.content = FilterContent(data.content,limit) === '' ? data.title : FilterContent(data.content,limit)
    CZFilterData.push(data)
  })
  return CZFilterData
}
// 配置一个token加密密钥
const jwtSecretKey = 'jihua is a good man !'
// token的有效期
const expiresIn = '10h'

const options = {
  secret: jwtSecretKey,
  algorithms: ['HS256'],
  credentialsRequired: true
}
// 生成用户唯一id
const { v4: uuid } = require('uuid');
const generateUserId = () => {
  return uuid().replace(/-/g,'').substring(0, 6)
};

module.exports = {
  Port,
  path,
  selpath,
  MaxFile,
  pub_date,
  pub_month,
  jwtSecretKey,
  expiresIn,
  generateMixed,
  SelectContent,
  generateUserId,
  options
}
