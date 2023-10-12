const config = require('../config')
const ExecuteFunc = require('../Implement/ExecuteFunction')
const ExecuteFuncData = require('../Implement/ExecuteFunctionData')

// 获取轮播 发展史 友链
exports.router_getSetting = async (req, res) => {
  const getValue = req.query.value
  if (getValue === 'Lunbo') {
    // 获取设置轮播图选项 Get set carousel options
    const GetSetCarouselOptionsSql = `select 
        ev_setting.set_url,ev_setting.set_difault,ev_setting.set_title,ev_setting.set_change
        from ev_setting where set_name=?`
    const GetSetCarouselOptions = await ExecuteFuncData(GetSetCarouselOptionsSql, getValue)
    if (GetSetCarouselOptions.length === 0) return res.cc('什么也没找到', 404)
    res.status(200).send({
      status: 200,
      message: '获取成功',
      data: GetSetCarouselOptions,
    })
  } else if (getValue === 'DevP') {
    // 获取设置发展历史选项 GetSetDevelopmentHistoryOptions
    const GetSetDevelopmentHistoryOptionsSql = `select * from ev_setting where set_name='DevP'`
    const GetSetDevelopmentHistoryOptions = await ExecuteFunc(GetSetDevelopmentHistoryOptionsSql)
    if (GetSetDevelopmentHistoryOptions.length === 0) return res.cc('什么也没找到', 404)
    res.status(200).send({
      status: 200,
      message: '获取成功',
      data: GetSetDevelopmentHistoryOptions,
    })
  } else if (getValue === 'Sps') {
    // 获取设置友联选项  Get Settings Union Options
    const GetSettingsUnionOptionsSql = `select * from ev_setting where set_name='PriceUser'`
    const GetSettingsUnionOptions = await ExecuteFunc(GetSettingsUnionOptionsSql)
    if (GetSettingsUnionOptions.length === 0) return res.cc('什么也没找到', 404)
    res.status(200).send({
      status: 200,
      message: '获取成功',
      data: GetSettingsUnionOptions,
    })
  }
}

// 后台面板 实现获取 改变 轮播
exports.router_setLunbo = async (req, res) => {
  const getmet = req.body.met
  if (getmet === 'get') {
    // 获取轮播图设置 Get carousel settings
    const GetCarouselSettingsSql = `select * from ev_setting where set_name='Lunbo'`
    const GetCarouselSettings = await ExecuteFunc(GetCarouselSettingsSql)
    res.status(200).send({
      status: 200,
      message: '获取成功',
      data: GetCarouselSettings,
    })
  } else if (getmet === 'cag') {
    const data = JSON.parse(req.body.data)
    const id = data.id
    // 更新轮播图设置 Update carousel settings
    const UpdateCarouselSettingsSql = `update ev_setting set ? where id=${id}`
    const UpdateCarouselSettings = await ExecuteFuncData(UpdateCarouselSettingsSql, data)
    if (UpdateCarouselSettings.affectedRows === 1) {
      res.status(200).send({
        status: 200,
        message: '数据更新成功',
      })
    } else {
      res.status(500).send({
        status: 500,
        message: '数据更新失败',
      })
    }
  }
}

// 控制面板 实现获取 改变 发展历程的信息
exports.router_setDevp = async (req, res) => {
  const getmet = req.body.met // 执行方法
  const getUser = req.body.username
  if (getmet === 'get') {
    const sql = `select * from ev_setting where set_name='DevP'`
    const data = await ExecuteFunc(sql)
    res.status(200).send({
      status: 200,
      message: '获取成功',
      data: data,
    })
  } else if (getmet === 'cag') {
    const data = JSON.parse(req.body.data)
    const id = data.id
    if (data.set_time !== '') data.set_time = config.pub_date
    data.set_user = getUser
    const sql = `update ev_setting set ? where id=${id}`
    const state = await ExecuteFuncData(sql, data)
    if (state.affectedRows === 1) {
      res.status(200).send({
        status: 200,
        message: '数据更新成功',
      })
    } else {
      res.status(500).send({
        status: 500,
        message: '数据更新失败',
      })
    }
  } else if (getmet === 'add') {
    const data = JSON.parse(req.body.data)
    data.set_time = config.pub_date
    data.set_user = getUser
    const sql = 'insert into ev_setting set ?'
    const state = await ExecuteFuncData(sql, data)
    if (state.affectedRows === 1) {
      res.status(200).send({
        status: 200,
        message: '新增发展历程成功!',
      })
    } else {
      res.status(500).send({
        status: 500,
        message: '新增发展历程失败',
      })
    }
  } else if (getmet === 'del') {
    const data = JSON.parse(req.body.data)
    const id = data.id
    const sql = `delete from ev_setting where id=${id}`
    const state = await ExecuteFunc(sql)
    if (state.affectedRows === 1) {
      res.status(200).send({
        status: 200,
        message: '删除发展历程成功!',
      })
    } else {
      res.status(500).send({
        status: 500,
        message: '删除发展历程失败',
      })
    }
  }
}

// 控制面板 实现获取 改变 发展历程的信息
exports.router_setSpsList = async (req, res) => {
  const getmet = req.body.met
  const getUser = req.body.username
  if (getmet === 'get') {
    const sql = `select * from ev_setting where set_name='PriceUser'`
    const data = await ExecuteFunc(sql)
    res.status(200).send({
      status: 200,
      message: '获取成功',
      data: data,
    })
  } else if (getmet === 'cag') {
    const data = JSON.parse(req.body.data)
    if (data.set_time !== '') data.set_time = config.pub_date
    data.set_user = getUser
    const id = data.id
    const sql = `update ev_setting set ? where id=${id}`
    const state = await ExecuteFuncData(sql, data)
    if (state.affectedRows === 1) {
      res.status(200).send({
        status: 200,
        message: '数据更新成功',
      })
    } else {
      res.status(500).send({
        status: 500,
        message: '数据更新失败',
      })
    }
  } else if (getmet === 'add') {
    const data = JSON.parse(req.body.data)
    data.set_time = config.pub_date
    data.set_user = getUser
    const sql = 'insert into ev_setting set ?'
    const state = await ExecuteFuncData(sql, data)
    if (state.affectedRows === 1) {
      res.status(200).send({
        status: 200,
        message: '新增成功了喵',
      })
    } else {
      res.status(500).send({
        status: 500,
        message: '新增失败了喵',
      })
    }
  } else if (getmet === 'del') {
    const data = JSON.parse(req.body.data)
    const id = data.id
    const sql = `delete from ev_setting where id=${id}`
    const state = await ExecuteFunc(sql)
    if (state.affectedRows === 1) {
      res.status(200).send({
        status: 200,
        message: '删除成功了喵',
      })
    } else {
      res.status(500).send({
        status: 500,
        message: '删除失败了喵',
      })
    }
  }
}
