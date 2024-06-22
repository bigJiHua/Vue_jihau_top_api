
const ExecuteFuncData = require('../Implement/ExecuteFunctionData')
const config = require('../config')
// 统计用户来源信息
const setUserPXData = async (req,res) => {
    if (req.headers.viewportwidth === undefined) return;
    const UserPXData = {
        user_agent_string: '', // 源平台数据
        os_info: '', // 操作系统
        browser_info: '', // 浏览器信息
        engine_info: '', // 浏览器引擎信息
        viewport_width: '', //视口宽度
        viewport_height: '', // 视口高度
        pixel_ratio: '', // 设备像素
        navigator_platform: '',
        created_at: new Date().getTime()
    }
    UserPXData.user_agent_string = req.headers['user-agent'];
    UserPXData.viewport_width = req.headers.viewportwidth;
    UserPXData.viewport_height = req.headers.viewportheight;
    UserPXData.pixel_ratio = req.headers.pixelratio;
    UserPXData.navigator_platform = req.headers.navigatorplatform;
    // 提取操作系统信息
    if (req.headers.navigatorplatform && req.headers.navigatorplatform !== '') {
        try {
            let osMatch = req.headers.navigatorplatform.match(/\(([^)]+)\)/);
            UserPXData.os_info = osMatch ? osMatch[1] : 'Unknown OS';
            // 提取浏览器信息
            let browserMatch = req.headers.navigatorplatform.match(/Chrome\/[^\s]+/);
            UserPXData.browser_info = browserMatch ? browserMatch[0] : 'Unknown Browser';
            // 提取浏览器引擎信息
            let engineMatch = req.headers.navigatorplatform.match(/AppleWebKit\/[^\s]+/);
            UserPXData.engine_info = engineMatch ? engineMatch[0] : 'Unknown Engine';
        } catch (err) {
            return console.log(err)
        }
    }
    try {
        // 检查视口宽高是否有统计过
        const CheckisWHSql = `Select * from ev_usereqm where viewport_width = ? and viewport_height = ?`
        const CheckisWH = await ExecuteFuncData(CheckisWHSql,[UserPXData.viewport_width,UserPXData.viewport_height])
        if (CheckisWH.length !== 0) {
            // 存在则不统计且写入count
            await ExecuteFuncData(`Update ev_usereqm set count = count + 1 where viewport_width = ? and viewport_height = ?`,[UserPXData.viewport_width,UserPXData.viewport_height])
            return
        } else if (CheckisWH.length === 0) {
            // 如果不存在则代表是新的宽高 则纳入统计
            const InsertNewUserPXDataSql = `Insert into ev_usereqm set ? `
            await ExecuteFuncData(InsertNewUserPXDataSql,UserPXData)
        }
    } catch (err) {
        return console.log(err)
    }
}
module.exports = {
    setUserPXData
}
