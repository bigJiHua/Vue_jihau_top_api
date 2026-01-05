/* 这是一个用于校验管理员身份的中间件 */
const config = require('../../config')
const ExecuteFunc = require('../ExecuteFunction')
const ExecuteFuncData = require('../ExecuteFunctionData')
const { setSystemLogFunc } = require('../ExecuteSystemLog')

// 用于更新用户文章权限的一个中间件， 用于处理旧数据脚本
// 逻辑 1. 旧的文章没有默认权限 2.当某个用户访问到旧的文章/作者主动打开旧的文章时，自动添加权限
exports.UpdateUserArticlePower = async (req, res, next) => {
  const articleID = req.query.id ?? ''
  if (articleID === '') {
    next()
  } else {
    // 索引权限
    // 插入默认权限
    const data = {
      article_id: articleID,
      username: '',
      user_id: '',
      created_at: config.pub_timestamp,
    }
    // 获取文章用户名同时获取user表里的用户id
    // 不管用户注销没注销 都要找到数据
    const getUserDataSql = `
        SELECT
        a.username,
        a.is_delete,
        u.user_id
        FROM ev_articles AS a
        JOIN ev_users AS u
            ON a.username = u.username
        WHERE a.is_delete = 0 AND a.article_id = ?
    `
    const CheckisHave = await ExecuteFuncData(`select * from ev_artpower where article_id = ?;`, articleID)
    if (CheckisHave.length === 0) {
      const getUserData = await ExecuteFuncData(getUserDataSql, articleID)
      if (getUserData.length !== 0) {
        data.username = getUserData[0]?.username
        data.user_id = getUserData[0]?.user_id
        try {
          await ExecuteFuncData(`insert into ev_artpower set ?;`, data)
        } catch (error) {
          console.log(error);          
          await setSystemLogFunc(error, 'UpdateArtPowerData', '404', 'system')
        }
      }
    }
    next()
  }
}