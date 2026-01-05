const ExecuteFunc = require('../../Implement/ExecuteFunction')
/*
 * 全站用户 统计
 * 男女占比 统计
 * 用户IP 源 统计
 * 文章数 获赞数 获收藏数 粉丝数 关注数
 * 操作统计
 * */
// 展示 历史月份注册人数
const ShowRegisterUser = async (req, res) => {
  const result = await ExecuteFunc(`
    SELECT 
    DATE_FORMAT(FROM_UNIXTIME(registerDate / 1000), '%Y-%m') AS month,
    COUNT(*) AS count
FROM ev_users
WHERE isact = 1
  AND registerDate IS NOT NULL
  AND registerDate > 0
GROUP BY DATE_FORMAT(FROM_UNIXTIME(registerDate / 1000), '%Y-%m')
ORDER BY month ASC;`)
  return res.send({
    status: 200,
    message: '数据加载成功',
    data: result,
  })
}

// 展示男女占比 管理员和普通用户占比
const ShowRoleUser = async (req, res) => {
  const roleCount = await ExecuteFunc(`
    SELECT 
    CASE useridentity
        WHEN 'manager' THEN '管理员'
        ELSE '用户'
    END AS role,
    COUNT(*) AS count
    FROM ev_users
    WHERE state = 0 AND isact = 1
    GROUP BY role;
    `)
  const genderCount = await ExecuteFunc(`
    SELECT 
    CASE sex
        WHEN '男' THEN '男'
        WHEN '女' THEN '女'
        ELSE '其他'
    END AS gender,
    COUNT(*) AS count
    FROM ev_users
    WHERE state = 0 AND isact = 1
    GROUP BY gender;
    `)
  return res.send({
    status: 200,
    message: '数据加载成功',
    data: {
      role: roleCount,
      gender: genderCount,
    },
  })
}

module.exports = {
  ShowRegisterUser,
  ShowRoleUser
}