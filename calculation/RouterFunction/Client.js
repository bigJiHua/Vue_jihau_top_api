const ExecuteFunc = require('../../Implement/ExecuteFunction')
/*
 * 统计客户端 设备类型 设备宽度 设备高度 设备分辨率
 */

// 获取客户端设备端信息
const getUserSourceDevice = async (req, res) => {
  const data = await ExecuteFunc(`
      SELECT 
      os_info,
      SUBSTRING_INDEX(browser_info, '/', 1) AS browser_name,
      SUM(count) AS total_count
      FROM ev_usereqm
      WHERE os_info IS NOT NULL 
        AND os_info <> ''
        AND browser_info IS NOT NULL 
        AND browser_info <> ''
      GROUP BY os_info, browser_name
      ORDER BY os_info, total_count DESC;`);
  res.send({
    status: 200,
    message: '获取成功',
    data
  });
}
// 获取客户端分辨率信息（组合统计）
const getUserSourcePixel = async (req, res) => {
  // 按组合统计
  const data = await ExecuteFunc(`
      SELECT 
        viewport_width, 
        viewport_height, 
        pixel_ratio, 
        SUM(count) AS total_count
      FROM ev_usereqm
      WHERE viewport_width IS NOT NULL AND viewport_width <> ''
        AND viewport_height IS NOT NULL AND viewport_height <> ''
        AND pixel_ratio IS NOT NULL AND pixel_ratio <> ''
      GROUP BY viewport_width, viewport_height, pixel_ratio
      ORDER BY total_count DESC
    `)
  res.send({
    status: 200,
    message: '获取成功',
    data
  })
}
const getUserSourceCity = async (req, res) => {
  const data = await ExecuteFunc(`
    SELECT 
    COALESCE(NULLIF(city, ''), '未知地区') AS city,
    COUNT(*) AS total_count
    FROM ev_users
    GROUP BY COALESCE(NULLIF(city, ''), '未知地区')
    ORDER BY total_count DESC;`)
  res.send({
    status: 200,
    message: '获取成功',
    data
  })
}

module.exports = {
  getUserSourceDevice,
  getUserSourcePixel,
  getUserSourceCity
}