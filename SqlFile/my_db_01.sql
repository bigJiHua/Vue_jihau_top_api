-- phpMyAdmin SQL Dump
-- version 4.4.15.10
-- https://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: 2022-08-02 15:24:03
-- 服务器版本： 5.6.50-log
-- PHP Version: 5.6.40

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `my_db_01`
--

-- --------------------------------------------------------

--
-- 表的结构 `ev_articles`
--

CREATE TABLE IF NOT EXISTS `ev_articles` (
  `id` int(10) NOT NULL COMMENT 'id主键',
  `article_id` varchar(10000) NOT NULL COMMENT '文章id(唯一)',
  `username` varchar(15) NOT NULL COMMENT '文章作者',
  `title` varchar(255) NOT NULL COMMENT '文章标题',
  `content` text NOT NULL COMMENT '文章内容',
  `cover_img` varchar(255) NOT NULL COMMENT '文章图片路径',
  `pub_date` varchar(255) NOT NULL COMMENT '文章发表日期',
  `pub_month` int(5) NOT NULL COMMENT '发布月份',
  `state` varchar(255) NOT NULL COMMENT '文章发布状态',
  `is_delete` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否删除、0正常1删除',
  `lable` varchar(255) NOT NULL DEFAULT '新文章' COMMENT '标签',
  `keyword` varchar(255) NOT NULL COMMENT '关键词'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='文章表';

-- --------------------------------------------------------

--
-- 表的结构 `ev_article_cate`
--

CREATE TABLE IF NOT EXISTS `ev_article_cate` (
  `id` int(11) NOT NULL COMMENT 'id',
  `name` varchar(255) NOT NULL COMMENT '文章标题',
  `alias` varchar(255) NOT NULL COMMENT '文章别名',
  `is_delete` tinyint(1) NOT NULL DEFAULT '0' COMMENT '判断是否删除，0默认正常，1则删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 表的结构 `ev_error_log`
--

CREATE TABLE IF NOT EXISTS `ev_error_log` (
  `id` int(10) NOT NULL,
  `err` varchar(2000) NOT NULL,
  `log` varchar(12000) NOT NULL,
  `todo` varchar(255) NOT NULL,
  `user` varchar(255) NOT NULL,
  `pub_date` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='错误和日志';

-- --------------------------------------------------------

--
-- 表的结构 `ev_setting`
--

CREATE TABLE IF NOT EXISTS `ev_setting` (
  `id` int(10) NOT NULL,
  `set_name` varchar(255) NOT NULL COMMENT '设置名称',
  `set_title` varchar(255) NOT NULL COMMENT '文字',
  `set_url` varchar(255) NOT NULL COMMENT '链接',
  `set_difault` varchar(255) NOT NULL COMMENT '默认值',
  `set_difault01` varchar(255) NOT NULL COMMENT '另设2',
  `set_change` varchar(255) NOT NULL COMMENT '改变值',
  `set_user` varchar(255) NOT NULL COMMENT '改变者',
  `set_time` varchar(255) NOT NULL COMMENT '设置时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='系统设置表';

-- --------------------------------------------------------

--
-- 表的结构 `ev_userartdata`
--

CREATE TABLE IF NOT EXISTS `ev_userartdata` (
  `id` int(10) NOT NULL,
  `username` varchar(255) NOT NULL COMMENT '用户名',
  `article_id` varchar(255) NOT NULL COMMENT '文章',
  `goodnum` varchar(12000) NOT NULL DEFAULT '0' COMMENT '喜欢',
  `collect` varchar(1200) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL DEFAULT '0' COMMENT '收藏',
  `state` int(1) NOT NULL DEFAULT '0' COMMENT '状态'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户在文章相关操作表';

-- --------------------------------------------------------

--
-- 表的结构 `ev_usercomment`
--

CREATE TABLE IF NOT EXISTS `ev_usercomment` (
  `id` int(10) NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户名',
  `article_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '文章id',
  `comment` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '评论数据',
  `pub_date` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '评论时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户评论表';

-- --------------------------------------------------------

--
-- 表的结构 `ev_userimage`
--

CREATE TABLE IF NOT EXISTS `ev_userimage` (
  `id` int(10) unsigned NOT NULL COMMENT '唯一Id',
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户名',
  `userimage` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '图片base64',
  `data` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '图片信息',
  `state` int(1) NOT NULL DEFAULT '0' COMMENT '状态1删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户图库表';

-- --------------------------------------------------------

--
-- 表的结构 `ev_users`
--

CREATE TABLE IF NOT EXISTS `ev_users` (
  `id` int(10) unsigned NOT NULL COMMENT 'id',
  `username` varchar(15) NOT NULL COMMENT '用户名',
  `password` varchar(255) NOT NULL COMMENT '用户密码',
  `useridentity` varchar(4) NOT NULL DEFAULT '用户' COMMENT '用户身份',
  `nickname` varchar(10) DEFAULT '' COMMENT '显示用户名',
  `sex` varchar(2) NOT NULL COMMENT '性别',
  `city` varchar(30) NOT NULL COMMENT '城市',
  `email` varchar(255) DEFAULT '' COMMENT '用户电子邮箱',
  `user_pic` mediumtext COMMENT '用户头像',
  `state` int(1) NOT NULL DEFAULT '0' COMMENT '用户状态，是否注销',
  `user_content` varchar(255) DEFAULT '我就是我，不一样的烟火' COMMENT '个性签名',
  `birthday` varchar(15) NOT NULL COMMENT '生日'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户信息表';

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ev_articles`
--
ALTER TABLE `ev_articles`
  ADD PRIMARY KEY (`id`),
  ADD FULLTEXT KEY `content` (`content`);

--
-- Indexes for table `ev_article_cate`
--
ALTER TABLE `ev_article_cate`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ev_error_log`
--
ALTER TABLE `ev_error_log`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ev_setting`
--
ALTER TABLE `ev_setting`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ev_userartdata`
--
ALTER TABLE `ev_userartdata`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ev_usercomment`
--
ALTER TABLE `ev_usercomment`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ev_userimage`
--
ALTER TABLE `ev_userimage`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ev_users`
--
ALTER TABLE `ev_users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ev_articles`
--
ALTER TABLE `ev_articles`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT COMMENT 'id主键';
--
-- AUTO_INCREMENT for table `ev_article_cate`
--
ALTER TABLE `ev_article_cate`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id';
--
-- AUTO_INCREMENT for table `ev_error_log`
--
ALTER TABLE `ev_error_log`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `ev_setting`
--
ALTER TABLE `ev_setting`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `ev_userartdata`
--
ALTER TABLE `ev_userartdata`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `ev_usercomment`
--
ALTER TABLE `ev_usercomment`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `ev_userimage`
--
ALTER TABLE `ev_userimage`
  MODIFY `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '唯一Id';
--
-- AUTO_INCREMENT for table `ev_users`
--
ALTER TABLE `ev_users`
  MODIFY `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'id';
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
