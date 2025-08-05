const express = require('express')
const categoryController = require('../../controllers/categoryController')

const router = express.Router()

// 获取分类列表
router.get('/list', categoryController.getCategoryList)

// 获取分类详情
router.get('/detail/:id', categoryController.getCategoryDetail)

// 获取分类下的商品列表
router.get('/goods/:id', categoryController.getCategoryGoods)

// 获取首页分类及商品
router.get('/home', categoryController.getHomeCategories)

module.exports = router
