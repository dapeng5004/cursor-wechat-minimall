const express = require('express')
const goodsController = require('../../controllers/goodsController')

const router = express.Router()

// 获取商品列表（根路径）
router.get('/', goodsController.getGoodsList)

// 获取商品列表（兼容旧路径）
router.get('/list', goodsController.getGoodsList)

// 获取推荐商品（必须在 /:id 之前）
router.get('/recommend', goodsController.getRecommendGoods)

// 获取热门商品（必须在 /:id 之前）
router.get('/hot', goodsController.getHotGoods)

// 搜索商品（必须在 /:id 之前）
router.get('/search', goodsController.searchGoods)

// 获取商品详情
router.get('/:id', goodsController.getGoodsDetail)

// 获取商品详情（兼容旧路径）
router.get('/detail/:id', goodsController.getGoodsDetail)

module.exports = router
