// 这是一个关于反馈的预处理方法 不涉及直接写入数据库公开的方法
const bcrypt = require('bcryptjs/dist/bcrypt')
// 导入生成token 处理模块
const dayjs = require('dayjs')
const config = require('../../config')
const ExecuteFunc = require('../../Implement/ExecuteFunction')
const ExecuteFuncData = require('../../Implement/ExecuteFunctionData')

// 友链申请
exports.user_post_spslist = async (req, res) => {
  const { set_title, set_url, set_difault, set_time } = req.body
  const fromData = {
    name: set_title,
    UserUrl: set_url,
    LogoUrl: set_difault,
    SubTime: set_time === '' ? dayjs(new Date()).format('YYYY-MM-DD') : set_time,
  }
  const data = {
    form_id: config.generateUserId(21),
    submitted_at: new Date().getTime(),
    status: 0,
    data_json: JSON.stringify(fromData),
    tag: 'spsReq',
    location: '',
    referrer: '/feedback/class/spslist',
  }
  if (data.set_title === 'JiHua') return res.cc('禁止使用默认值', 404)
  // 写入新的 然后标记为待审核
  const setSpsReqSql = `insert into ev_fromdata set ?`
  const setSpsReq = await ExecuteFuncData(setSpsReqSql, data)
  if (setSpsReq.affectedRows !== 1) return res.cc('申请失败', 404)
  return res.status(200).send({
    status: 200,
    message: '申请成功',
    ismessage: false,
  })
}
