const express = require('express')
const bannerController = require('../../controllers/bannerController')

const router = express.Router()

// 获取轮播图列表
router.get('/list', bannerController.getBannerList)

// 获取轮播图详情
router.get('/detail/:id', bannerController.getBannerDetail)

module.exports = router
