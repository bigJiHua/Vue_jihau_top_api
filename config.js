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
const Port = 666
// 文件上传路径
const path = './public/uploads/'
// 文件访问路径
const selpath = 'http://127.0.0.1/public/uploads/'
// 文件上传条数Max
const MaxFile = 100
/*　生成格式化日期 */
const dayjs = require('dayjs')
let d = new Date()
const pub_date = dayjs(d).format('YYYY-MM-DD')
const pub_month = dayjs(d).format('MM')
// 生成随机ＵＩＤ
const art_idnum = Math.floor(Math.random() * (100 - 10 + 1)) + 10
let str = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
]
// 随机数生成
function generateMixed(n) {
  let res = ''
  for (let i = 0; i < n; i++) {
    let id = Math.ceil(Math.random() * 35)
    res += str[id]
  }
  return res + art_idnum
}
// 中文过滤器
function FilterContent(content, limit) {
  const FilterContentData = []
  for (const Value in content) {
    if (content[Value].match(/\p{sc=Han}/gu)) {
      FilterContentData.push(content[Value])
    }
  }
  return FilterContentData.splice(0, limit).join('')
}
// 挑选内容
const SelectContent = function (data, limit) {
  // 过滤筛出中文
  const CZFilterData = []
  data.forEach((value) => {
    const data = value
    data.content =
      FilterContent(data.content, limit) === '' ? data.title : FilterContent(data.content, limit)
    CZFilterData.push(data)
  })
  return CZFilterData
}

// 搜索功能过滤关键词
function filterSqlInjection(input, res) {
  // 定义要过滤的危险关键词的正则表达式
  const dangerousKeywords =
    /(\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE){0,1}|INSERT( +INTO){0,1}|MERGE|REPLACE|SELECT( +DISTINCT){0,1}|TRUNCATE|UPDATE)\b|\b(UNION( +ALL){0,1}|AND|OR|NOT|LIKE)\b)/i
  // 检查输入是否包含危险关键词
  if (dangerousKeywords.test(input)) {
    // TODO　写入ｅｒｏｏｒ表记录
    // 如果包含危险关键词，则进行相应处理（例如抛出异常、返回错误提示等）
    return res.cc('警告！输入危险关键词！', 404)
  }
  // 输入通过检查，没有包含危险关键词
  return input
}

// 配置一个token加密密钥
const jwtSecretKey = 'jihua is a good man !'
// token的有效期
const expiresIn = '10h'

const options = {
  secret: jwtSecretKey,
  algorithms: ['HS256'],
  credentialsRequired: true,
}
// 生成用户唯一id
const { v4: uuid } = require('uuid')
const generateUserId = (num) => {
  return uuid().replace(/-/g, '').substring(1, num)
}
const defaultUserLogo = `data:image/png;base64,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`
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
  options,
  filterSqlInjection,
  defaultUserLogo,
}
