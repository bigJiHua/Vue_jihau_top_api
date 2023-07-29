/* 这是一个关于文章的 后台管理面板路由【处理模块】 */
const config = require('../../config')
const ExecuteFunc = require('../../Implement/ExecuteFunction')
const ExecuteFuncData = require('../../Implement/ExecuteFunctionData')

// 获取文章/通知 列表
exports.ChangeAndGetUsersData = async (req, res) => {
    const GetType = req.query.type;
    const pageSize = 10; // 每页显示的数量
    let stateCondition = ''; // 状态条件
    // 根据 type 设置表名和状态条件
    if (GetType === 'user') {
        stateCondition = ' WHERE useridentity = "user" AND state = 0 AND isact = 1';
    } else if (GetType === 'manager') {
        stateCondition = ' WHERE useridentity = "manager" state = 0 AND isact = 1';
    } else if (GetType === 'deleteUser') {
        stateCondition = ' WHERE state = 1';
    }
    // 获取所有用户数目 做分页
    const GetALLArticlesAtATimeSql = `SELECT * FROM ev_users ${stateCondition}`;
    const GetALLArticlesAtATime = await ExecuteFuncData(GetALLArticlesAtATimeSql, GetType);
    const totalCount = GetALLArticlesAtATime.length; // 总数
    const currentPage = req.query.Num; // 当前页码
    const offset = Math.max(0, (currentPage - 1) * pageSize);
    const limit = Math.min(totalCount - offset, pageSize);
    // 每次只获取10条文章
    const GetOnly10ArticlesAtATimeSql = `SELECT birthday,city,email,id,nickname,registerDate,sex,state,user_content,user_id,user_pic,useridentity,username FROM ev_users ${stateCondition} ORDER BY ev_users.id ASC LIMIT ${limit} OFFSET ${offset}`;
    const GetOnly10ArticlesAtATime = await ExecuteFuncData(GetOnly10ArticlesAtATimeSql, GetType);
    if (GetOnly10ArticlesAtATime.length === 0) {
        return res.send({
            status: 204,
            message: '暂无最新数据',
            data: config.SelectContent(GetOnly10ArticlesAtATime, 30),
            totalNum: totalCount
        });
    }
    res.status(200).send({
        status: 200,
        message: '获取成功',
        data: config.SelectContent(GetOnly10ArticlesAtATime, 30),
        totalNum: totalCount
    });
}
