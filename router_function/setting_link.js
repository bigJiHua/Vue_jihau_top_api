const db = require('../database/linkdb')
const setting = require('../setting')

exports.router_getSetting = (req, res) => {
    const getValue = req.query.value
    if (getValue === 'Lunbo') {
        const sql = `select 
        ev_setting.set_url,ev_setting.set_difault,ev_setting.set_title,ev_setting.set_change
        from ev_setting where set_name=?`
        db.query(sql, getValue, (err, results) => {
            if (err) return res.cc(err)
            if (results.length === 0) return res.cc('什么也没找到', 404)
            res.status(200).send({
                status: 200,
                message: '获取成功',
                data: results
            })
        })
    } else if (getValue === 'DevP') {
        const sql = `select * from ev_setting where set_name='DevP'`
        db.query(sql, getValue, (err, results) => {
            if (err) return res.cc(err)
            if (results.length === 0) return res.cc('什么也没找到', 404)
            res.status(200).send({
                status: 200,
                message: '获取成功',
                data: results
            })
        })
    } else if (getValue === 'Sps') {
        const sql = `select * from ev_setting where set_name='PriceUser'`
        db.query(sql, getValue, (err, results) => {
            if (err) return res.cc(err)
            if (results.length === 0) return res.cc('什么也没找到', 404)
            res.status(200).send({
                status: 200,
                message: '获取成功',
                data: results
            })
        })
    }
}

// 后台面板 实现获取 改变 轮播
exports.router_setLunbo = (req, res) => {
    const getmet = req.body.met
    const getUser = req.body.username
    const useridentity = '管理员'
    const sql = `select * from ev_users where username=? and useridentity=?`
    db.query(sql, [getUser, useridentity], async (err, results) => {
        if (err) return res.cc(err, 500)
        if (results.length === 0) {
            res.status(202).send({
                status: 404,
                message: '非管理员禁止操作!'
            })
        } else {
            if (getmet === 'get') {
                const sql = `select * from ev_setting where set_name='Lunbo'`
                const data = await Setting(sql)
                res.status(200).send({
                    status: 200,
                    message: '获取成功',
                    data: data
                })
            } else if (getmet === 'cag') {
                const data = JSON.parse(req.body.data)
                const id = data.id
                const sql = `update ev_setting set ? where id=${id}`
                const state = await Setting(sql, data)
                if (state.affectedRows === 1) {
                    res.status(200).send({
                        status: 200,
                        message: '数据更新成功'
                    })
                } else {
                    res.status(500).send({
                        status: 500,
                        message: '数据更新失败'
                    })
                }
            }
        }
    })
}

// 控制面板 实现获取 改变 发展历程的信息
exports.router_setDevp = (req, res) => {
    const getmet = req.body.met
    const getUser = req.body.username
    const useridentity = '管理员'
    const sql = `select * from ev_users where username=? and useridentity=?`
    db.query(sql, [getUser, useridentity], async (err, results) => {
        if (err) return res.cc(err, 500)
        if (results.length === 0) {
            res.status(202).send({
                status: 404,
                message: '非管理员禁止操作!'
            })
        } else {
            if (getmet === 'get') {
                const sql = `select * from ev_setting where set_name='DevP'`
                const data = await Setting(sql)
                res.status(200).send({
                    status: 200,
                    message: '获取成功',
                    data: data
                })
            } else if (getmet === 'cag') {
                const data = JSON.parse(req.body.data)
                if (data.set_time !== '') data.set_time = setting.pub_date
                data.set_user = getUser
                const id = data.id
                const sql = `update ev_setting set ? where id=${id}`
                const state = await Setting(sql, data)
                if (state.affectedRows === 1) {
                    res.status(200).send({
                        status: 200,
                        message: '数据更新成功'
                    })
                } else {
                    res.status(500).send({
                        status: 500,
                        message: '数据更新失败'
                    })
                }
            } else if (getmet === 'add') {
                const data = JSON.parse(req.body.data)
                data.set_time = setting.pub_date
                data.set_user = getUser
                const sql = 'insert into ev_setting set ?'
                const state = await Setting(sql, data)
                if (state.affectedRows === 1) {
                    res.status(200).send({
                        status: 200,
                        message: '新增发展历程成功!'
                    })
                } else {
                    res.status(500).send({
                        status: 500,
                        message: '新增发展历程失败'
                    })
                }
            } else if (getmet === 'del') {
                const data = JSON.parse(req.body.data)
                const id = data.id
                const sql = `delete from ev_setting where id=${id}`
                const state = await Setting(sql)
                if (state.affectedRows === 1) {
                    res.status(200).send({
                        status: 200,
                        message: '删除发展历程成功!'
                    })
                } else {
                    res.status(500).send({
                        status: 500,
                        message: '删除发展历程失败'
                    })
                }
            }
        }
    })
}

// 控制面板 实现获取 改变 发展历程的信息
exports.router_setSpsList = (req, res) => {
    const getmet = req.body.met
    const getUser = req.body.username
    const useridentity = '管理员'
    const sql = `select * from ev_users where username=? and useridentity=?`
    db.query(sql, [getUser, useridentity], async (err, results) => {
        if (err) return res.cc(err, 500)
        if (results.length === 0) {
            res.status(202).send({
                status: 404,
                message: '非管理员禁止操作!'
            })
        } else {
            if (getmet === 'get') {
                const sql = `select * from ev_setting where set_name='PriceUser'`
                const data = await Setting(sql)
                res.status(200).send({
                    status: 200,
                    message: '获取成功',
                    data: data
                })
            } else if (getmet === 'cag') {
                const data = JSON.parse(req.body.data)
                if (data.set_time !== '') data.set_time = setting.pub_date
                data.set_user = getUser
                const id = data.id
                const sql = `update ev_setting set ? where id=${id}`
                const state = await Setting(sql, data)
                if (state.affectedRows === 1) {
                    res.status(200).send({
                        status: 200,
                        message: '数据更新成功'
                    })
                } else {
                    res.status(500).send({
                        status: 500,
                        message: '数据更新失败'
                    })
                }
            } else if (getmet === 'add') {
                const data = JSON.parse(req.body.data)
                data.set_time = setting.pub_date
                data.set_user = getUser
                const sql = 'insert into ev_setting set ?'
                const state = await Setting(sql, data)
                if (state.affectedRows === 1) {
                    res.status(200).send({
                        status: 200,
                        message: '新增金主爸爸成功!'
                    })
                } else {
                    res.status(500).send({
                        status: 500,
                        message: '新增金主爸爸失败'
                    })
                }
            } else if (getmet === 'del') {
                const data = JSON.parse(req.body.data)
                const id = data.id
                const sql = `delete from ev_setting where id=${id}`
                const state = await Setting(sql)
                if (state.affectedRows === 1) {
                    res.status(200).send({
                        status: 200,
                        message: '删除金主爸爸成功!'
                    })
                } else {
                    res.status(500).send({
                        status: 500,
                        message: '删除金主爸爸失败'
                    })
                }
            }
        }
    })
}

function Setting(sql, data) {
    if (data) {
        return new Promise((resolve, reject) => {
            db.query(sql, data, (err, results) => {
                if (err) {
                    reject(err)
                    return
                }
                resolve(results)
            })
        })
    } else {
        return new Promise((resolve, reject) => {
            db.query(sql, (err, results) => {
                if (err) {
                    reject(err)
                    return
                }
                resolve(results)
            })
        })
    }
}
