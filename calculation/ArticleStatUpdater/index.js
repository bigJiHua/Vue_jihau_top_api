const ExecuteFunc = require('../../Implement/ExecuteFunction')
const ExecuteFuncData = require('../../Implement/ExecuteFunctionData')
/*
  * 这是一个大工程 
  * 目的是 根据用户 获取文章数据 以及点赞收藏等操作触发该方法
  * 该方法的主要功能有：
  * 1. 获取ev_articles表中特定索引的id数据（由API传入）
  * 2. 根据文章id 获取该文章的点赞 收藏 评论 分享等数据
  * 3. 将数据写入ev_articlecount表中
  * 4. 如果该文章在ev_articlecount表中已存在 则更新数据
  * 
  * 下面是统计表需要的数据
  * username 用户名	user_id	用户ID	article_id	文章id	pub_date	发布日期	
  * readnum	阅读数	goodnum	点赞数	collectnum	收藏数	commentnum	评论数	
  * sharenum	分享数量	reportnum	举报数	title_attractiveness	标题吸引力	
  * interactions	互动数统计	wordnum	总词数	set_date	创建时间	state	发布状态
  * 
  * 获取的 ev_articles 表中的数据结构为
  * article_id 文章id(唯一) username 文章作者 title 文章标题 content 文章内容 
  * cover_img 文章图片路径 pub_date 文章发表日期 pub_month 发布月份
  * state 文章发布状态,0正常 1驳回   is_delete 是否删除、0正常1删除
  * lable 标签 keyword 关键词 describes 文章描述 
  * read_num 阅读数 share_num 分享数量 report_num 举报数
  * 
  * 获取的 ev_usercomment 表中的数据结构为
  * username 用户名 article_id 文章id comment 评论数据 pub_date 评论时间 
  * commentid 评论id parent_comid 父亲id，默认为空 target_userid 回复的谁 
  * level 评论等级 likenum 评论点赞数 reportnum 举报数
  * 
  * 获取用户的ID ev_users
  * username 用户名 user_id 用户id password 用户密码 useridentity 用户身份 
  * sex 性别 city 城市 email 用户电子邮箱 user_pic 用户头像 user_bgc space背景图 
  * state 用户状态，是否注销 user_content 个性签名 birthday 生日 
  * registerDate 注册日期 isact 是否激活账户
  * 
  * 获取 点赞数的表内结构 ev_userartdata
  * username 用户名 user_id 用户ID article_id 文章
  * goodnum 喜欢 goodtime 点赞时间 collect 收藏 collecttime 收藏时间 cate 收藏分类
*/
/**
 * 配置参数（可放到 config.js）
 */
const CONFIG = {
  weights: { like: 1, collect: 1.5, comment: 2, share: 2.5 }, // 各互动权重
  maxWeightedInteractions: 50,    // 历史最大加权互动分（归一化用）
  maxWordNum: 3000,               // 字数满分标准
  wordWeightFactor: 0.3,          // 字数加成系数
  smoothReadNum: 10,              // 阅读数平滑项，避免小样本放大
  interactionFactor: 2,           // 绝对互动加成系数
  maxScore: 5                     // 标题吸引力最大分
};

/**
 * 统计文章字数（中英文混合，排除 HTML/Markdown 标签、代码块、图片、链接等）
 * @param {string} content
 * @returns {number} 字数
 */
const countWords = (content) => {
  if (!content) return 0;
  let text = content;

  // 去掉 HTML 标签
  text = text.replace(/<[^>]+>/g, "");
  // 去掉 Markdown 代码块和行内代码
  text = text.replace(/```[\s\S]*?```/g, "");
  text = text.replace(/`[^`]*`/g, "");
  // 去掉图片 ![alt](url) 和链接 [text](url)
  text = text.replace(/!\[.*?\]\(.*?\)/g, "");
  text = text.replace(/\[.*?\]\(.*?\)/g, "");
  // 去掉 Markdown 标记符号
  text = text.replace(/[#>*_\-]/g, "");
  // 多余空白替换成单空格
  text = text.replace(/\s+/g, " ").trim();

  const chineseChars = text.match(/[\u4e00-\u9fa5]/g) || [];
  const englishWords = text.match(/[a-zA-Z0-9]+/g) || [];

  return chineseChars.length + englishWords.length;
};

/**
 * 计算标题吸引力
 * 结合：
 * 1️⃣ 加权互动数
 * 2️⃣ 阅读数平滑项
 * 3️⃣ 字数加成
 * 4️⃣ 绝对互动分限制
 * @param {Object} stats 
 * @returns {number} 0~5 分
 */
const calcTitleAttractiveness = ({ weightedInteractions, readnum }) => {
  // 1️⃣ 互动占比得分（互动效率）
  const ratioScore = weightedInteractions / (readnum + CONFIG.smoothReadNum) * 2;

  // 2️⃣ 绝对互动得分（限制最大分）
  const absoluteScore = Math.min(2, (weightedInteractions / CONFIG.maxWeightedInteractions) * CONFIG.interactionFactor);

  // 3️⃣ 总分限制在 maxScore
  return Number(Math.min(CONFIG.maxScore, ratioScore + absoluteScore).toFixed(2));
};

/**
 * 批量获取文章数据及统计信息
 * @param {Array<number>} articleIDs - 文章ID数组
 * @returns {Array<Object>} 文章统计数据
 */
const GetArticleData = async (articleIDs = []) => {
  if (!articleIDs.length) return [];

  // 占位符拼接
  const placeholders = articleIDs.map(() => "?").join(",");

  // 🔹 查询文章基本信息 + 用户ID
  const Articles = await ExecuteFuncData(`
    SELECT a.article_id, a.username, a.pub_date, a.read_num, a.share_num, 
    a.report_num, a.content, a.state, u.user_id
    FROM ev_articles a
    LEFT JOIN ev_users u ON a.username = u.username
    WHERE a.article_id IN (${placeholders}) AND a.is_delete = 0
  `, articleIDs);

  // 🔹 查询点赞/收藏
  const ActionData = await ExecuteFuncData(`
    SELECT article_id,
      SUM(CASE WHEN goodnum = 1 THEN 1 ELSE 0 END) AS goodnum,
      SUM(CASE WHEN collect = 1 THEN 1 ELSE 0 END) AS collectnum
    FROM ev_userartdata
    WHERE article_id IN (${placeholders})
    GROUP BY article_id
  `, articleIDs);

  // 🔹 查询评论
  const CommData = await ExecuteFuncData(`
    SELECT article_id, COUNT(*) AS commentnum
    FROM ev_usercomment
    WHERE article_id IN (${placeholders})
    GROUP BY article_id
  `, articleIDs);

  // 🔹 转换为 Map，加快查找
  const actionMap = new Map(ActionData.map(a => [a.article_id, a]));
  const commMap = new Map(CommData.map(c => [c.article_id, c]));

  // 🔹 遍历文章，计算统计数据
  return Articles.map(article => {
    const { article_id, username, pub_date, read_num, share_num, report_num, content, state, user_id } = article;
    const { goodnum = 0, collectnum = 0 } = actionMap.get(article_id) || {};
    const { commentnum = 0 } = commMap.get(article_id) || {};

    // 🔹 转换成 Number
    const g = Number(goodnum);
    const c = Number(collectnum);
    const cm = Number(commentnum);
    const s = Number(share_num);
    const r = Number(read_num);

    // 🔹 文章字数及字数权重
    const wordCount = countWords(content);
    const wordWeight = 1 + CONFIG.wordWeightFactor * Math.min(1, wordCount / CONFIG.maxWordNum);

    // 🔹 加权互动分（含字数权重）
    const weightedInteractions = (g * CONFIG.weights.like +
      c * CONFIG.weights.collect +
      cm * CONFIG.weights.comment +
      s * CONFIG.weights.share) * wordWeight;

    // 🔹 归一化互动数 (0~5)
    const interactions = Number(Math.min(5, (weightedInteractions / CONFIG.maxWeightedInteractions) * 5).toFixed(2));

    // 🔹 标题吸引力 (0~5)，结合互动效率 + 绝对互动
    const title_attractiveness = calcTitleAttractiveness({ weightedInteractions, readnum: r });

    // 🔹 返回完整数据
    return {
      username,
      user_id,
      article_id,
      pub_date,
      readnum: r,
      goodnum: g,
      collectnum: c,
      commentnum: cm,
      sharenum: s,
      reportnum: report_num,
      title_attractiveness,
      interactions,
      wordnum: wordCount,
      set_date: Date.now(),
      state
    };
  });
};

module.exports = GetArticleData;
