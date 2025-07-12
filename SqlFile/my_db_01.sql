-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- 主机： 127.0.0.1:3306
-- 生成日期： 2025-07-12 06:46:00
-- 服务器版本： 5.7.40
-- PHP 版本： 8.0.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 数据库： `my_db_01`
--

-- --------------------------------------------------------

--
-- 表的结构 `ev_articlecount`
--

DROP TABLE IF EXISTS `ev_articlecount`;
CREATE TABLE IF NOT EXISTS `ev_articlecount` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `username` varchar(20) NOT NULL COMMENT '用户名',
  `user_id` varchar(25) NOT NULL COMMENT '用户ID',
  `article_id` varchar(15) NOT NULL COMMENT '文章id',
  `pub_date` varchar(255) NOT NULL COMMENT '发布日期',
  `readnum` int(11) NOT NULL COMMENT '阅读数',
  `goodnum` int(255) UNSIGNED NOT NULL DEFAULT '0' COMMENT '点赞数',
  `collectnum` int(255) UNSIGNED NOT NULL DEFAULT '0' COMMENT '收藏数',
  `commentnum` int(255) UNSIGNED NOT NULL DEFAULT '0' COMMENT '评论数',
  `sharenum` int(255) UNSIGNED DEFAULT '0' COMMENT '分享数量',
  `reportnum` int(11) NOT NULL DEFAULT '0' COMMENT '举报数',
  `title_attractiveness` int(255) UNSIGNED DEFAULT '0' COMMENT '标题吸引力',
  `interactions` int(255) UNSIGNED NOT NULL DEFAULT '0' COMMENT '互动数统计',
  `wordnum` int(255) UNSIGNED NOT NULL DEFAULT '0' COMMENT '总词数',
  `set_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `state` int(1) NOT NULL DEFAULT '0' COMMENT '发布状态',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_2` (`id`),
  KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='文章数据统计表';

-- --------------------------------------------------------

--
-- 表的结构 `ev_articles`
--

DROP TABLE IF EXISTS `ev_articles`;
CREATE TABLE IF NOT EXISTS `ev_articles` (
  `id` int(10) NOT NULL AUTO_INCREMENT COMMENT 'id主键',
  `article_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '文章id(唯一)',
  `username` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '文章作者',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '文章标题',
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '文章内容',
  `cover_img` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '文章图片路径',
  `pub_date` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '文章发表日期',
  `pub_month` int(5) NOT NULL COMMENT '发布月份',
  `state` int(1) NOT NULL DEFAULT '0' COMMENT '文章发布状态,0正常 1驳回',
  `is_delete` int(1) NOT NULL DEFAULT '0' COMMENT '是否删除、0正常1删除',
  `lable` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '新文章' COMMENT '标签',
  `keyword` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '关键词',
  `describes` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '新文章！又一篇来自用户的文章' COMMENT '文章描述',
  `read_num` int(6) UNSIGNED NOT NULL DEFAULT '0' COMMENT '阅读数',
  `share_num` int(10) UNSIGNED NOT NULL DEFAULT '0' COMMENT '分享数量',
  `report_num` int(10) UNSIGNED NOT NULL DEFAULT '0' COMMENT '举报数',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章表';

-- --------------------------------------------------------

--
-- 表的结构 `ev_cagarticlelog`
--

DROP TABLE IF EXISTS `ev_cagarticlelog`;
CREATE TABLE IF NOT EXISTS `ev_cagarticlelog` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL COMMENT '用户名，谁的文章',
  `article_id` varchar(15) NOT NULL COMMENT '文章ID',
  `source_article` varchar(10000) NOT NULL COMMENT '源文章',
  `cag_article` varchar(10000) NOT NULL COMMENT '修改后的文章',
  `cagdate` varchar(15) NOT NULL COMMENT '执行日期',
  `reason` varchar(500) NOT NULL COMMENT '原因',
  `cagmanage` varchar(20) NOT NULL COMMENT '谁改的666',
  `change_num` int(30) NOT NULL DEFAULT '0' COMMENT '修改次数，超过30为禁止',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='被驳回，被修改的文章存放地';

-- --------------------------------------------------------

--
-- 表的结构 `ev_dbdl`
--

DROP TABLE IF EXISTS `ev_dbdl`;
CREATE TABLE IF NOT EXISTS `ev_dbdl` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '索引',
  `tablename` varchar(255) NOT NULL COMMENT '表名',
  `COLUMN_NAME` varchar(255) NOT NULL COMMENT '结构名称',
  `DATA_TYPE` varchar(255) NOT NULL COMMENT '结构数据类型',
  `CHARACTER_MAXIMUM_LENGTH` varchar(255) DEFAULT NULL COMMENT '结构数据最大长度',
  `IS_NULLABLE` varchar(255) DEFAULT NULL COMMENT '是否NULL',
  `COLUMN_DEFAULT` varchar(255) DEFAULT NULL COMMENT '结构默认值',
  `COLUMN_COMMENT` varchar(255) DEFAULT NULL COMMENT '结构注释',
  `isdev` int(1) DEFAULT '1' COMMENT '结构是否开发',
  `table_isdev` int(1) DEFAULT '1' COMMENT '该表是否开发',
  `todo` varchar(255) DEFAULT NULL COMMENT '要做',
  `time` varchar(255) NOT NULL COMMENT '时间',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 表的结构 `ev_error_log`
--

DROP TABLE IF EXISTS `ev_error_log`;
CREATE TABLE IF NOT EXISTS `ev_error_log` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `err` varchar(2000) NOT NULL,
  `log` varchar(12000) NOT NULL,
  `todo` varchar(255) NOT NULL DEFAULT '0',
  `user` varchar(255) NOT NULL DEFAULT 'admin',
  `pub_date` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='错误和日志';

-- --------------------------------------------------------

--
-- 表的结构 `ev_fromdata`
--

DROP TABLE IF EXISTS `ev_fromdata`;
CREATE TABLE IF NOT EXISTS `ev_fromdata` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `form_id` varchar(100) NOT NULL,
  `user_id` varchar(255) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `submitted_at` varchar(255) NOT NULL COMMENT '表单创建时间',
  `changetime` varchar(255) DEFAULT NULL COMMENT '后台提交修改时间',
  `status` int(4) DEFAULT '0',
  `data_json` text,
  `extra_1` text,
  `extra_2` text,
  `tag` varchar(100) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `referrer` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- 表的结构 `ev_login_log`
--

DROP TABLE IF EXISTS `ev_login_log`;
CREATE TABLE IF NOT EXISTS `ev_login_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '登录日志ID',
  `user_id` varchar(25) NOT NULL COMMENT '用户ID',
  `token` varchar(20000) DEFAULT NULL,
  `login_time` varchar(40) NOT NULL COMMENT '登录时间',
  `login_ip` varchar(255) NOT NULL COMMENT '登录IP地址',
  `login_device` varchar(255) NOT NULL COMMENT '登录设备',
  `login_lang` varchar(255) NOT NULL COMMENT '登录语言',
  `status` int(1) NOT NULL DEFAULT '0' COMMENT '登录状态',
  `error_message` varchar(255) NOT NULL COMMENT '登录错误消息',
  `user_agent` varchar(255) NOT NULL COMMENT '用户代理信息',
  `path` varchar(255) NOT NULL COMMENT '来源去向',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='用户登录日志表';

-- --------------------------------------------------------

--
-- 表的结构 `ev_notify`
--

DROP TABLE IF EXISTS `ev_notify`;
CREATE TABLE IF NOT EXISTS `ev_notify` (
  `id` int(10) NOT NULL AUTO_INCREMENT COMMENT 'id主键',
  `notify_id` varchar(255) NOT NULL COMMENT '文章id(唯一)',
  `username` varchar(15) NOT NULL COMMENT '谁发的通知',
  `title` varchar(255) NOT NULL COMMENT '文章标题',
  `content` mediumtext NOT NULL COMMENT '文章内容',
  `lable` varchar(255) NOT NULL DEFAULT '新文章' COMMENT '标签',
  `keyword` varchar(255) NOT NULL DEFAULT '新文章' COMMENT '关键词',
  `describes` varchar(200) NOT NULL DEFAULT '新文章！又一篇来自用户的文章' COMMENT '文章描述',
  `read_num` int(255) UNSIGNED NOT NULL DEFAULT '0' COMMENT '阅读数',
  `whosee` int(1) NOT NULL DEFAULT '0' COMMENT '谁能看，0大众，1管理员',
  `pub_date` varchar(255) NOT NULL COMMENT '文章发表日期',
  `state` int(1) NOT NULL DEFAULT '0' COMMENT '文章发布状态,0正常 1待发布',
  `is_delete` int(1) NOT NULL DEFAULT '0' COMMENT '是否删除、0正常1删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='文章表';

-- --------------------------------------------------------

--
-- 表的结构 `ev_setting`
--

DROP TABLE IF EXISTS `ev_setting`;
CREATE TABLE IF NOT EXISTS `ev_setting` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `set_name` varchar(255) NOT NULL COMMENT '设置名称',
  `set_title` varchar(255) NOT NULL COMMENT '文字',
  `set_url` varchar(255) NOT NULL COMMENT '链接',
  `set_difault` varchar(255) NOT NULL COMMENT '默认值',
  `set_difault01` varchar(255) NOT NULL COMMENT '另设01',
  `set_change` varchar(255) NOT NULL COMMENT '改变值',
  `set_user` varchar(255) NOT NULL COMMENT '改变者',
  `set_time` varchar(255) NOT NULL COMMENT '设置时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='系统设置表';

-- --------------------------------------------------------

--
-- 表的结构 `ev_sitemsg`
--

DROP TABLE IF EXISTS `ev_sitemsg`;
CREATE TABLE IF NOT EXISTS `ev_sitemsg` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `type` varchar(25) NOT NULL COMMENT '消息类型',
  `title` varchar(30) NOT NULL COMMENT '消息标题',
  `label` varchar(15) NOT NULL DEFAULT 'default' COMMENT '标签',
  `senduser` varchar(255) NOT NULL COMMENT '发送者',
  `getuser` varchar(255) NOT NULL COMMENT '接收者',
  `content` varchar(500) NOT NULL COMMENT '内容',
  `pub_date` varchar(25) NOT NULL COMMENT '时间',
  `state` int(1) NOT NULL DEFAULT '0' COMMENT '是否查看',
  `is_delete` int(11) NOT NULL DEFAULT '0' COMMENT '是否删除',
  UNIQUE KEY `id` (`id`),
  KEY `index` (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='站内通知表';

-- --------------------------------------------------------

--
-- 表的结构 `ev_userartdata`
--

DROP TABLE IF EXISTS `ev_userartdata`;
CREATE TABLE IF NOT EXISTS `ev_userartdata` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL COMMENT '用户名',
  `user_id` varchar(15) NOT NULL COMMENT '用户ID',
  `article_id` varchar(255) NOT NULL COMMENT '文章',
  `goodnum` varchar(1) NOT NULL DEFAULT '0' COMMENT '喜欢',
  `goodtime` varchar(255) NOT NULL DEFAULT '0' COMMENT '点赞时间',
  `collect` varchar(1) NOT NULL DEFAULT '0' COMMENT '收藏',
  `collecttime` varchar(255) NOT NULL DEFAULT '0' COMMENT '收藏时间',
  `cate` varchar(25) NOT NULL DEFAULT 'defalut' COMMENT '收藏分类',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户在文章相关操作表';

-- --------------------------------------------------------

--
-- 表的结构 `ev_usercomment`
--

DROP TABLE IF EXISTS `ev_usercomment`;
CREATE TABLE IF NOT EXISTS `ev_usercomment` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL COMMENT '用户名',
  `article_id` varchar(255) NOT NULL COMMENT '文章id',
  `comment` varchar(255) NOT NULL COMMENT '评论数据',
  `pub_date` varchar(15) NOT NULL COMMENT '评论时间',
  `commentid` varchar(25) NOT NULL COMMENT '评论id',
  `parent_comid` varchar(25) DEFAULT NULL COMMENT '父亲id，默认为空',
  `target_userid` varchar(255) DEFAULT NULL COMMENT '回复的谁',
  `level` int(5) NOT NULL DEFAULT '1' COMMENT '评论等级',
  `likenum` int(255) UNSIGNED NOT NULL DEFAULT '0' COMMENT '评论点赞数',
  `reportnum` int(100) UNSIGNED NOT NULL DEFAULT '0' COMMENT '举报数',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户评论表';

-- --------------------------------------------------------

--
-- 表的结构 `ev_usereqm`
--

DROP TABLE IF EXISTS `ev_usereqm`;
CREATE TABLE IF NOT EXISTS `ev_usereqm` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_agent_string` varchar(255) NOT NULL,
  `os_info` varchar(255) DEFAULT NULL,
  `browser_info` varchar(255) DEFAULT NULL,
  `engine_info` varchar(255) DEFAULT NULL,
  `viewport_width` varchar(255) DEFAULT NULL,
  `viewport_height` varchar(255) DEFAULT NULL,
  `pixel_ratio` varchar(255) DEFAULT NULL,
  `navigator_platform` varchar(255) DEFAULT NULL,
  `created_at` varchar(255) DEFAULT NULL,
  `count` int(10) UNSIGNED NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 表的结构 `ev_userimage`
--

DROP TABLE IF EXISTS `ev_userimage`;
CREATE TABLE IF NOT EXISTS `ev_userimage` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '唯一Id',
  `username` varchar(255) NOT NULL COMMENT '用户名',
  `userimage` mediumtext NOT NULL COMMENT '图片base64',
  `data` varchar(255) NOT NULL COMMENT '图片信息',
  `state` int(1) NOT NULL DEFAULT '0' COMMENT '状态1删除',
  `date` varchar(50) NOT NULL COMMENT '日期',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户图库表';

-- --------------------------------------------------------

--
-- 表的结构 `ev_usermsg`
--

DROP TABLE IF EXISTS `ev_usermsg`;
CREATE TABLE IF NOT EXISTS `ev_usermsg` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `type` varchar(25) NOT NULL COMMENT '消息类型',
  `title` varchar(30) NOT NULL COMMENT '消息标题',
  `label` varchar(15) NOT NULL DEFAULT 'defalut' COMMENT '分类',
  `senduser` varchar(255) NOT NULL COMMENT '发送者',
  `getuser` varchar(255) NOT NULL COMMENT '接收者',
  `content` varchar(500) NOT NULL COMMENT '内容',
  `pub_date` varchar(25) NOT NULL COMMENT '时间',
  `state` int(11) NOT NULL DEFAULT '0' COMMENT '阅读状态',
  `is_delete` int(1) NOT NULL DEFAULT '0' COMMENT '是否删除',
  UNIQUE KEY `id` (`id`),
  KEY `index` (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='站内通知表';

-- --------------------------------------------------------

--
-- 表的结构 `ev_userpower`
--

DROP TABLE IF EXISTS `ev_userpower`;
CREATE TABLE IF NOT EXISTS `ev_userpower` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(15) NOT NULL,
  `username` varchar(25) NOT NULL,
  `isadmin` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否设置为管理员',
  `iscom` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否允许评论',
  `isart` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否允许发布文章',
  `isupimg` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否允许上传图片',
  `isrel` int(1) NOT NULL DEFAULT '1' COMMENT '访问关注权限',
  `isspace` int(1) NOT NULL DEFAULT '1' COMMENT '是否显示我的空间',
  `islike` int(1) NOT NULL DEFAULT '1' COMMENT '是否显示我的最爱',
  `iscol` int(1) NOT NULL DEFAULT '1' COMMENT '是否显示我的收藏列表',
  `isfans` int(1) NOT NULL DEFAULT '1' COMMENT '粉丝列表',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id_2` (`user_id`),
  UNIQUE KEY `username` (`username`),
  KEY `user_id` (`user_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 表的结构 `ev_userrelation`
--

DROP TABLE IF EXISTS `ev_userrelation`;
CREATE TABLE IF NOT EXISTS `ev_userrelation` (
  `id` int(255) UNSIGNED NOT NULL AUTO_INCREMENT,
  `author` varchar(25) NOT NULL COMMENT '被关注者',
  `author_id` varchar(255) NOT NULL COMMENT '被关注者ID',
  `username` varchar(255) NOT NULL COMMENT '关注者',
  `user_id` varchar(20) DEFAULT NULL COMMENT '关注id',
  `relation` int(1) NOT NULL DEFAULT '0' COMMENT '0关注，1取关',
  `pub_date` varchar(25) NOT NULL COMMENT '构建日期',
  PRIMARY KEY (`id`),
  KEY `author_idx` (`author`),
  KEY `userid_idx` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 表的结构 `ev_users`
--

DROP TABLE IF EXISTS `ev_users`;
CREATE TABLE IF NOT EXISTS `ev_users` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'id',
  `username` varchar(15) NOT NULL COMMENT '用户名',
  `user_id` varchar(20) NOT NULL COMMENT '用户id',
  `password` varchar(255) NOT NULL COMMENT '用户密码',
  `useridentity` varchar(10) NOT NULL DEFAULT 'user' COMMENT '用户身份',
  `sex` varchar(4) DEFAULT '男' COMMENT '性别',
  `city` varchar(30) DEFAULT NULL COMMENT '城市',
  `email` varchar(255) NOT NULL DEFAULT '' COMMENT '用户电子邮箱',
  `user_pic` mediumtext COMMENT '用户头像',
  `user_bgc` mediumtext COMMENT 'space背景图',
  `state` int(1) NOT NULL DEFAULT '0' COMMENT '用户状态，是否注销',
  `user_content` varchar(255) DEFAULT '我就是我，不一样的烟火' COMMENT '个性签名',
  `birthday` varchar(15) DEFAULT NULL COMMENT '生日',
  `registerDate` bigint(20) NOT NULL COMMENT '注册日期',
  `isact` int(1) NOT NULL DEFAULT '0' COMMENT '是否激活账户',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户信息表';

-- --------------------------------------------------------

--
-- 表的结构 `ev_usershare`
--

DROP TABLE IF EXISTS `ev_usershare`;
CREATE TABLE IF NOT EXISTS `ev_usershare` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL COMMENT '用户名',
  `user_id` varchar(255) NOT NULL COMMENT '用户id',
  `author` varchar(255) NOT NULL COMMENT '原作者',
  `article_id` varchar(255) NOT NULL COMMENT '原文id',
  `sharetime` varchar(255) NOT NULL COMMENT '分享时间',
  `state` int(1) NOT NULL COMMENT '分享状态',
  `share_id` varchar(255) NOT NULL COMMENT '分享id',
  KEY `id` (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='用户分享表(用于空间动态';

-- --------------------------------------------------------

--
-- 表的结构 `ev_usersharedata`
--

DROP TABLE IF EXISTS `ev_usersharedata`;
CREATE TABLE IF NOT EXISTS `ev_usersharedata` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL COMMENT '用户名',
  `user_id` varchar(255) NOT NULL,
  `author` varchar(255) NOT NULL,
  KEY `id` (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 表的结构 `ev_users_vercode`
--

DROP TABLE IF EXISTS `ev_users_vercode`;
CREATE TABLE IF NOT EXISTS `ev_users_vercode` (
  `id` int(255) UNSIGNED NOT NULL AUTO_INCREMENT,
  `type` varchar(15) NOT NULL COMMENT '验证码类型',
  `username` varchar(20) NOT NULL COMMENT '用户名',
  `code` varchar(20) NOT NULL COMMENT '代码',
  `time` varchar(15) NOT NULL COMMENT '时间',
  `is_check` int(11) NOT NULL DEFAULT '0' COMMENT '是否验证',
  `sendsum` int(3) NOT NULL DEFAULT '0' COMMENT '发送次数',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_2` (`id`),
  KEY `id` (`id`),
  KEY `id_3` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 表的结构 `website_settings`
--

DROP TABLE IF EXISTS `website_settings`;
CREATE TABLE IF NOT EXISTS `website_settings` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键 ID',
  `group_key` varchar(64) NOT NULL DEFAULT '' COMMENT '配置分组，如 site、seo、upload',
  `setting_key` varchar(64) NOT NULL DEFAULT '' COMMENT '配置键，如 site_name、enable_register',
  `setting_value` text NOT NULL COMMENT '配置值，支持字符串、JSON 等',
  `value_type` enum('string','number','boolean','json') NOT NULL DEFAULT 'string' COMMENT '值类型，用于解析与展示控制',
  `description` varchar(255) DEFAULT NULL COMMENT '配置项说明',
  `updated_by` varchar(64) NOT NULL COMMENT '最后修改人',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '最后修改时间',
  `is_system` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否系统保留项（0=是，1=否）',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_group_key_setting_key` (`group_key`,`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='网站基础设置表';
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
