const express = require('express')
const bannerController = require('../../controllers/bannerController')

const router = express.Router()

// 获取轮播图列表（根路径）
router.get('/', bannerController.getBannerList)

// 获取轮播图列表（兼容旧路径）
router.get('/list', bannerController.getBannerList)

// 获取轮播图位置（必须在 /:id 之前）
router.get('/positions', bannerController.getBannerPositions)

// 获取轮播图详情
router.get('/:id', bannerController.getBannerDetail)

// 获取轮播图详情（兼容旧路径）
router.get('/detail/:id', bannerController.getBannerDetail)

module.exports = router
