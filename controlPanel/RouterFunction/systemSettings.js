const config = require('../../config')
const ExecuteFunc = require('../../Implement/ExecuteFunction')
const ExecuteFuncData = require('../../Implement/ExecuteFunctionData')
const joi = require('joi')
const dayjs = require('dayjs')

// 数据库 明细方法
exports.router_dbDataList = async (req, res) => {
  const met = req.body.met
  const table = req.body.table
  /*
   * met = getlist 返回 数据库表名称
   * 查询功能 用户返回tablename参数进行获取 该表的结构所有数据
   * 修改功能 用户返回data 对该表的结构所有数据状态进行修改 可修改的有 COLUMN_COMMENT isdev table_isdev _todo 四个参数
   * 在修改或者Update时都要打上最新的时间戳 time
   * 数据重构
   * */
  switch (met) {
    case 'getList': {
      // 获取数据库列表
      const GetDataBaseNameList = await ExecuteFunc(
        `SELECT TABLE_NAME AS TableName FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '${config.dbBase}'`,
      )
      if (GetDataBaseNameList.length === 0) return res.cc('系统错误', 500)
      const SelectDbText = await ExecuteFuncData(
        `Select * from ev_dbdl Where COLUMN_NAME = 'table_setting'`,
      )
      return res.send({
        status: 200,
        message: '获取数据成功',
        data: GetDataBaseNameList,
        text: SelectDbText,
      })
    }
    case 'get': {
      if (table === '' || table === undefined) return res.cc('数据表参数非法', 404)
      // 检索是否有数据 没有就增加 有就返回
      const CheckisData = await ExecuteFuncData(
        `SELECT * FROM ev_dbdl WHERE tablename = ? AND COLUMN_NAME != 'table_setting'`,
        table,
      )
      if (CheckisData.length === 0) {
        // 如果没有该数据，则获取列信息并插入
        const GetORDbDataSql = `SELECT COLUMN_NAME AS a, DATA_TYPE AS b, CHARACTER_MAXIMUM_LENGTH AS c, IS_NULLABLE AS d, COLUMN_DEFAULT AS e, COLUMN_COMMENT AS f FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ?`
        const GetOrdbData = await ExecuteFuncData(GetORDbDataSql, table)
        for (const item of GetOrdbData) {
          const data = {
            tablename: table,
            COLUMN_NAME: item.a,
            DATA_TYPE: item.b,
            CHARACTER_MAXIMUM_LENGTH: item.c,
            IS_NULLABLE: item.d,
            COLUMN_DEFAULT: item.e,
            COLUMN_COMMENT: item.f,
            time: String(new Date().getTime()),
          }
          // 检查ev_dbdl表中是否已经存在该列名的数据
          const checkColumnData = await ExecuteFuncData(
            `SELECT * FROM ev_dbdl WHERE tablename = ? AND COLUMN_NAME = ?`,
            [table, item.a],
          )
          if (checkColumnData.length === 0) {
            // 如果该列数据不存在，则插入
            try {
              await ExecuteFuncData(`INSERT INTO ev_dbdl SET ?`, data)
            } catch (e) {
              await ExecuteFuncData('Delete * from ev_dbdl where tablename = ?', table)
              return res.cc('插入错误,已删除插入数据 ，重新再试', 500)
            }
          }
        }
        // 返回获取的数据
        return res.status(200).send({
          message: '成功',
          status: 200,
          data: CheckisData,
        })
      }
      return res.status(200).send({
        message: '获取成功',
        status: 200,
        data: CheckisData,
      })
    }
    case 'cag': {
      let data = {}
      try {
        data = JSON.parse(req.body.data)
      } catch (e) {
        return res.cc('错误参数', 202)
      }
      if (data.key === undefined || data.value === undefined || data.value === '')
        return res.cc('参数错误')
      // 更新字段
      const updateSql = `UPDATE ev_dbdl SET ${data.key} = ? WHERE id = ? AND tablename = ?`
      const update = await ExecuteFuncData(updateSql, [data.value, data.id, table])
      if (update.affectedRows !== 1) return res.cc('修改错误！', 500)
      return res.cc('成功', 200)
    }
    case 'add': {
      let data = {}
      try {
        data = JSON.parse(req.body.data)
      } catch (e) {
        return res.cc('错误参数', 202)
      }
      // 校验是否有重复值
      const CheckDataisOk = await ExecuteFuncData(
        `Select * from ev_dbdl where tablename = ? AND COLUMN_NAME = 'table_setting'`,
        table,
      )
      switch (CheckDataisOk.length) {
        case 0:
          // 插入数据
          const InsertDataisOk = await ExecuteFuncData(`INSERT INTO ev_dbdl SET ?`, data)
          if (InsertDataisOk.affectedRows !== 1) return res.cc('修改错误！', 500)
          return res.cc('新建成功', 200)
          break
        case 1:
          if (data.todo === '') delete data.todo
          // 数值覆盖
          const UpdateDataisOk = await ExecuteFuncData(
            `UPDATE ev_dbdl SET ? WHERE tablename = ? AND COLUMN_NAME = 'table_setting'`,
            [data, table],
          )
          if (UpdateDataisOk.affectedRows !== 1) return res.cc('修改错误！', 500)
          return res.cc('更新成功', 200)
          break
        default:
          // 删除数据
          await ExecuteFuncData(
            `Delete from ev_dbdl where tablename = ? AND COLUMN_NAME = 'table_setting' `,
            table,
          )
          return res.cc('重复数据已删除 重新添加该注释')
      }
    }
    case 'reset':
      const CheckTableisOk = await ExecuteFuncData(
        `SELECT * FROM ev_dbdl WHERE tablename = ? AND COLUMN_NAME != 'table_setting'`,
        table,
      )
      if (CheckTableisOk.length === 0)
        return res.cc('没有数据,无法操作该功能，请点击展示列表初始化数据', 400)

      // 获取当前表格的字段原数据
      const GetORDbDataSql = `SELECT COLUMN_NAME AS a, DATA_TYPE AS b, CHARACTER_MAXIMUM_LENGTH AS c, IS_NULLABLE AS d, COLUMN_DEFAULT AS e, COLUMN_COMMENT AS f 
                        FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ?`
      const GetOrdbData = await ExecuteFuncData(GetORDbDataSql, table)

      // 获取 ev_dbdl 表中的现有字段数据
      const existingColumnsData = await ExecuteFuncData(
        `SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT 
                                                   FROM ev_dbdl WHERE tablename = ? AND COLUMN_NAME != 'table_setting'`,
        table,
      )

      // 将现有字段数据存入一个 Map，方便后续对比
      const existingColumnsMap = new Map()
      existingColumnsData.forEach((item) => {
        existingColumnsMap.set(item.COLUMN_NAME, item)
      })
      // 遍历字段元数据
      for (const item of GetOrdbData) {
        // 检查该字段是否已经存在于 ev_dbdl 表中
        const existingColumn = existingColumnsMap.get(item.a)
        if (existingColumn) {
          // 如果字段已经存在，比较元数据是否发生变化
          if (
            existingColumn.DATA_TYPE !== item.b ||
            existingColumn.CHARACTER_MAXIMUM_LENGTH !== item.c ||
            existingColumn.IS_NULLABLE !== item.d ||
            existingColumn.COLUMN_DEFAULT !== item.e
          ) {
            // 如果字段的元数据发生了变化，执行更新操作
            const updateResultSql = `UPDATE ev_dbdl SET DATA_TYPE = ?, CHARACTER_MAXIMUM_LENGTH = ?, IS_NULLABLE = ?, COLUMN_DEFAULT = ?, time = ? 
                                     WHERE tablename = ? AND COLUMN_NAME = ? AND COLUMN_NAME != 'table_setting'`
            await ExecuteFuncData(updateResultSql, [
              item.b,
              item.c,
              item.d,
              item.e,
              new Date().getTime(),
              table,
              item.a,
            ])
          }
        } else {
          // 如果字段不存在，则插入新记录
          try {
            const data = {
              tablename: table,
              COLUMN_NAME: item.a,
              DATA_TYPE: item.b,
              CHARACTER_MAXIMUM_LENGTH: item.c,
              IS_NULLABLE: item.d,
              COLUMN_DEFAULT: item.e,
              COLUMN_COMMENT: item.f,
              time: String(new Date().getTime()),
            }
            // 插入新字段
            await ExecuteFuncData(`INSERT INTO ev_dbdl SET ?`, data)
          } catch (e) {
            console.error(`插入错误: ${e.message}`)
            return res.cc('插入错误, 已删除插入数据，重新再试', 500)
          }
        }
      }
      return res.cc('成功', 200)
    default: {
      return res.cc('未知方法', 400) // 如果传入的 `met` 值不匹配任何情况，返回一个默认的错误响应
    }
  }
}

// 反馈方法 1 友链申请
exports.feedback_case_sps = async (req, res) => {
  const met = req.body.met
  // 接口常带1 获取 审批数量
  const selectAllNumSql = `
        SELECT 
            COUNT(CASE WHEN status = 0 THEN 1 END) AS status_0_count,
            COUNT(CASE WHEN status = 1 THEN 1 END) AS status_1_count,
            COUNT(CASE WHEN status = 2 THEN 1 END) AS status_2_count
        FROM 
            ev_fromdata;`
  // 接口常带2 获取 申请通道权限是否开启
  const SelectReqPower = await ExecuteFunc(
    `Select * from website_settings where setting_key = 'spsport'`,
  )
  const selectAllNum = await ExecuteFunc(selectAllNumSql)
  if (met === 'get') {
    const status = req.body.status
    const getReqSql = `Select * from ev_fromdata where status = ? AND tag = 'spsReq'`
    const getReq = await ExecuteFuncData(getReqSql, status)
    return res.send({
      status: 200,
      message: '获取成功',
      Alldata: getReq.length !== 0 ? getReq : [],
      count: selectAllNum[0],
      power: SelectReqPower[0],
    })
  } else if (met === 'put') {
    const ID = req.body.id
    if (!ID) return res.cc('传输数据参数异常', 404)
    // 第一步获取 申请表数据
    const OrData = await ExecuteFuncData(`Select data_json from ev_fromdata where form_id =?`, ID)
    if (OrData.length === 0) return res.cc('申请不存在!', 404)
    const data_json = JSON.parse(OrData[0].data_json)
    const PutData = {
      set_name: 'PriceUser',
      set_title: data_json.name,
      set_url: data_json.UserUrl ? data_json.UserUrl : '',
      set_difault: data_json.LogoUrl ? data_json.LogoUrl : 'https://picsum.photos/80/80',
      set_difault01: 0,
      set_change: '',
      set_time: data_json.SubTime
        ? data_json.SubTime
        : dayjs(new Date().getTime()).format('YYYY-MM-DD'),
      set_user: '',
    }
    // 插入新的数据
    const insetDataSql = `insert into ev_setting set ?`
    const insetData = await ExecuteFuncData(insetDataSql, PutData)
    if (insetData.affectedRows !== 1) {
      try {
        await ExecuteFuncData('UPDATE ev_fromdata SET status = 0 WHERE form_id = ?', ID)
      } catch (e) {
        return res.cc('逻辑错误 服务端发生错误', 404)
      }
      return res.cc('插入失败 服务端发生错误', 404)
    }
    // 修改 申请表的状态
    const ChangeStatus = await ExecuteFuncData(
      'UPDATE ev_fromdata SET status = 1 WHERE form_id = ?',
      ID,
    )
    if (ChangeStatus.affectedRows !== 1) return res.cc('审批失败 服务端发生错误', 404)
    return res.send({
      status: 200,
      message: '审批成功',
    })
  } else if (met === 'del') {
    const ID = req.body.id
    if (!ID) return res.cc('传输数据参数异常', 404)
    const del = await ExecuteFuncData('UPDATE ev_fromdata SET status = 2 WHERE form_id = ?', ID)
    if (del.affectedRows !== 1) return res.cc('删除失败 服务端发生错误', 404)
    return res.send({
      status: 200,
      message: '拒绝审批成功！',
    })
  }
  return res.cc('参数异常', 404)
}

// 站点基础权限数据添加接口
exports.website_power = async (req, res) => {
  const SetData = {
    group_key: req.body.group_key,
    setting_key: req.body.setting_key,
    setting_value: req.body.setting_value,
    value_type: req.body.value_type,
    description: req.body.description,
    updated_by: req.auth.user_id,
  }
  const insetPowerSql = `INSERT INTO website_settings SET ?`
  try {
    const insetPower = await ExecuteFuncData(insetPowerSql, SetData)
    if (insetPower.affectedRows !== 1) {
      return res.cc('插入失败，未生效', 500)
    }
    return res.cc('配置插入成功', 200)
  } catch (err) {
    // MySQL 唯一键冲突错误码是 1062
    if (err.code === 'ER_DUP_ENTRY') {
      return res.cc('配置已存在，不能重复添加', 409)
    }
    // 其他数据库错误
    console.error('数据库插入失败：', err)
    return res.cc('插入失败，服务端发生错误', 500)
  }
  return res.cc('操作成功！', 200)
}
// 获取/更改站点权限基础数据
exports.powerdata = async (req, res) => {
  const met = req.body.met
  switch (met) {
    case 'get': {
      const GetPowerSql = `SELECT id,group_key, setting_key, setting_value, value_type, description, updated_by FROM website_settings`
      const GetPower = await ExecuteFunc(GetPowerSql)
      if (GetPower.length !== 0) {
        return res.send({
          status: 200,
          message: '获取成功',
          data: GetPower,
        })
      } else {
        return res.cc('暂无数据', 404)
      }
    }
    case 'cag': {
      const { id, group_key, setting_key, setting_value, value_type, description } = JSON.parse(
        req.body.data,
      )
      if (id === 0 || id === '' || id === '0') return res.cc('参数异常 ID不能为空', 400)
      const OrData = JSON.parse(req.body.data)
      // 简单非空判断
      const requiredFields = [
        'group_key',
        'setting_key',
        'setting_value',
        'value_type',
        'description',
      ]
      for (const field of requiredFields) {
        if (!OrData[field]) {
          return res.cc(`参数异常，缺少${field}`, 400)
        }
      }
      const data = {
        group_key,
        setting_key,
        setting_value,
        value_type,
        description,
        updated_by: req.auth.user_id,
      }
      const CagPowerSql = `
            UPDATE website_settings SET ? WHERE id = ?`
      const CagPower = await ExecuteFuncData(CagPowerSql, [data, id])
      if (CagPower.affectedRows !== 1) return res.cc('更新失败，未生效', 500)
      return res.cc('更新成功', 200)
    }
    default: {
      return res.cc('未知方法', 400)
    }
  }
}
