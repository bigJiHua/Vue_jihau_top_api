/* 这个data所有接口均是get 接口，只能获取数据*/
const express = require('express')
const router = express.Router()
const expressJoi = require('@escook/express-joi')
/* 路由处理模块 */
const article_function = require('../RouterFunction/Article')
const getSetting_function = require('../RouterFunction/Setting_link')
const get_archives_Router = require('../RouterFunction/Archives')
const userinfoRM = require('../RouterFunction/Userinfo')
const space_Router = require('../RouterFunction/SpaceData')
/* 路由规则 */
const ArchiveRules = require('../Rules/Archives')
const userinfoRules = require('../Rules/userinfo')
/* 处理中间件 */
const {
  CheckUserisTrue,
  verifyToken,
} = require('../Implement/middleware/CheckUserMiddleware')
const {
  UpdateUserArticlePower,
} = require('../Implement/middleware/UpdateSomeData')
const {
  CheckWebSiteAPIPort,
} = require('../Implement/middleware/CheckWebsiteApiPort')
// 获取非权限接口的权限信息
router.use((req, res, next) => {
  verifyToken(req, res, next)
})

/* Router */
router.get('/list', article_function.article_list) // 首页列表
router.get('/archive', article_function.article_archive) // 文章归档
router.get('/notify', article_function.getNotifyList) // 获取通知展示列表
router.get('/Setting', getSetting_function.router_getSetting) // 首页设置信息
router.get(
  '/article',
  expressJoi(ArchiveRules.getArticleId),
  async (req, res, next) => {
    await UpdateUserArticlePower(req, res, next)
  },
  get_archives_Router.getArticle,
) // 请求获得文章数据
router.get(
  '/artdata',
  expressJoi(ArchiveRules.getArticleId),
  get_archives_Router.getArticleData,
) // 请求获得文章数据（点赞等等...
router.get(
  '/artcom',
  expressJoi(ArchiveRules.getArticleId),
  CheckWebSiteAPIPort('enable_comment'),
  get_archives_Router.getArticleComment,
) // 请求获得文章数据（评论
router.get(
  '/page',
  expressJoi(ArchiveRules.getArticleId),
  get_archives_Router.getPage,
) // 请求获得通知数据
router.get(
  '/UpreadNum',
  expressJoi(ArchiveRules.getArticleId),
  get_archives_Router.UpdateReadNum,
) // 增加阅读数
router.get('/authData', expressJoi(userinfoRules.authData), userinfoRM.authData) // 获取作者信息
router.get(
  '/search',
  expressJoi(ArchiveRules.SearchKeyWorld),
  get_archives_Router.SearchApi,
) //搜索接口
router.get(
  '/space',
  expressJoi(userinfoRules.userData),
  async (req, res, next) => {
    await CheckUserisTrue(req, res, next, 'space')
  },
  userinfoRM.getSpaceData,
) // 获取个人空间个人信息
router.get(
  '/spaceart',
  expressJoi(userinfoRules.authArticleData),
  async (req, res, next) => {
    await CheckUserisTrue(req, res, next, 'art')
  },
  space_Router.spaceArt,
) // 获取空间作者文章
router.get(
  '/spacecol',
  expressJoi(userinfoRules.authArticleData),
  async (req, res, next) => {
    await CheckUserisTrue(req, res, next, 'col')
  },
  space_Router.spaceCol,
) // 获取空间作者收藏
router.get(
  '/spacelike',
  expressJoi(userinfoRules.authArticleData),
  async (req, res, next) => {
    await CheckUserisTrue(req, res, next, 'like')
  },
  space_Router.spaceLike,
) // 获取空间作者喜欢
router.get('/spaceul', space_Router.spaceUserList)
router.get(
  '/relation',
  expressJoi(userinfoRules.getRelationData),
  async (req, res, next) => {
    const type = req.query.met === 'Beflist' ? 'fans' : 'rel'
    await CheckUserisTrue(req, res, next, type)
  },
  space_Router.getUserRelation,
) // 查两人关系 以及获取关系列表

router.get('/sitemap', get_archives_Router.sitemapData) // 获取sitemap数据
module.exports = router
