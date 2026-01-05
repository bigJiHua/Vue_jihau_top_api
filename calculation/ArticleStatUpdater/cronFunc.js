const cron = require("node-cron");
const ExecuteFuncData = require("../../Implement/ExecuteFunctionData");
const GetArticlesData = require("./index"); // 就是我们之前写的批量统计方法

// 定时任务：每天凌晨 2 点执行
cron.schedule("0 2 * * *", async () => {
// cron.schedule("*/1 * * * *", async () => {
  console.log("每分钟跑一次测试:", new Date().toLocaleString());
  console.log("开始批量统计文章数据:", new Date().toLocaleString());

  try {
    // 1️⃣ 获取所有文章ID（这里可以改成只取最近30天的文章，避免全表扫描）
    const articles = await ExecuteFuncData(`
      SELECT article_id FROM ev_articles WHERE is_delete = 0
    `);

    const articleIDs = articles.map(a => a.article_id);

    // 2️⃣ 分批处理（每次1000篇，避免SQL过大）
    const batchSize = 1000;
    for (let i = 0; i < articleIDs.length; i += batchSize) {
      const batch = articleIDs.slice(i, i + batchSize);

      // 调用批量统计方法
      const stats = await GetArticlesData(batch);

      // 3️⃣ 写入 ev_articlecount 表（存在则更新，不存在则插入）
      for (const row of stats) {
        await ExecuteFuncData(`
          INSERT INTO ev_articlecount 
          (username, user_id, article_id, pub_date, readnum, goodnum, collectnum, commentnum, sharenum, reportnum, title_attractiveness, interactions, wordnum, state)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            readnum = VALUES(readnum),
            goodnum = VALUES(goodnum),
            collectnum = VALUES(collectnum),
            commentnum = VALUES(commentnum),
            sharenum = VALUES(sharenum),
            reportnum = VALUES(reportnum),
            title_attractiveness = VALUES(title_attractiveness),
            interactions = VALUES(interactions),
            wordnum = VALUES(wordnum),
            state = VALUES(state)
        `, [
          row.username, row.user_id, row.article_id, row.pub_date,
          row.readnum, row.goodnum, row.collectnum, row.commentnum,
          row.sharenum, row.reportnum, row.title_attractiveness,
          row.interactions, row.wordnum, row.state
        ]);
      }

      console.log(`✅ 已处理 ${i + batch.length}/${articleIDs.length} 篇文章`);
    }

    console.log("🎉 批量统计完成:", new Date().toLocaleString());
  } catch (err) {
    console.error("❌ 批量统计失败:", err);
  }
});
