const express = require('express')
const goodsController = require('../../controllers/goodsController')

const router = express.Router()

// 获取商品列表
router.get('/list', goodsController.getGoodsList)

// 获取商品详情
router.get('/detail/:id', goodsController.getGoodsDetail)

// 获取推荐商品
router.get('/recommend', goodsController.getRecommendGoods)

// 获取热销商品
router.get('/hot', goodsController.getHotGoods)

// 搜索商品
router.get('/search', goodsController.searchGoods)

module.exports = router
