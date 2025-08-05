const express = require('express')
const categoryController = require('../../controllers/categoryController')

const router = express.Router()

// 获取分类列表（根路径）
router.get('/', categoryController.getCategoryList)

// 获取分类列表（兼容旧路径）
router.get('/list', categoryController.getCategoryList)

// 获取首页分类（必须在 /:id 之前）
router.get('/home', categoryController.getHomeCategories)

// 获取分类树（必须在 /:id 之前）
router.get('/tree', categoryController.getCategoryTree)

// 获取分类详情
router.get('/:id', categoryController.getCategoryDetail)

// 获取分类详情（兼容旧路径）
router.get('/detail/:id', categoryController.getCategoryDetail)

// 获取分类下的商品列表
router.get('/:id/goods', categoryController.getCategoryGoods)

// 获取分类下的商品列表（兼容旧路径）
router.get('/goods/:id', categoryController.getCategoryGoods)

module.exports = router
