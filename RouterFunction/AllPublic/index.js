// 这是一个关于反馈的预处理方法 不涉及直接写入数据库公开的方法
const bcrypt = require('bcryptjs/dist/bcrypt')
// 导入生成token 处理模块
const dayjs = require('dayjs')
const svgCaptcha = require('svg-captcha')
const session = require('express-session')
const config = require('../../config')
const ExecuteFunc = require('../../Implement/ExecuteFunction')
const ExecuteFuncData = require('../../Implement/ExecuteFunctionData')

// 获取和校验验证码
exports.user_get_captcha = async (req, res) => {
  const met = req.body.met ?? req.query.met // 兼容 GET 和 POST
  if (!met) return res.cc('错误', 404)
  // 1. 生成验证码并返回 SVG
  if (met === 'get') {
    const captcha = svgCaptcha.create({
      size: 5,
      noise: 5,
      background: '#f2f2f2',
      color: true,
    })
    // 存入 session
    req.session.captcha = captcha.text
    // 返回 SVG 图像
    res.type('svg')
    // 测试验证码发送功能
    // req.session.save((err) => {
    //     if (err) {
    //         console.error('Error saving session:', err);
    //     }
    // });
    return res.send(captcha.data)
  }
  // 2. 校验验证码
  else if (met === 'verify') {
    const inputCode = req.body.captcha
    const savedCode = req.session.captcha
    if (!inputCode) return res.cc('前端验证码错误')
    if (!savedCode) return res.cc('Session验证码错误')
    const isValid = inputCode.toLowerCase() === savedCode.toLowerCase()
    // 清除验证码，防止重复使用
    req.session.captcha = null
    return isValid ? res.cc('验证通过', 200) : res.cc('验证码错误', 400)
  }
  return res.cc('非法请求', 404)
}
