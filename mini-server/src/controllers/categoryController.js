const CategoryModel = require('../models/categoryModel')
const GoodsModel = require('../models/goodsModel')
const log = require('../utils/logger')

// 获取分类列表
const getCategoryList = async (req, res) => {
  try {
    const categories = await CategoryModel.getAll()
    
    log.info('获取分类列表成功', { count: categories.length })
    
    res.json({
      code: 200,
      message: '获取成功',
      data: categories
    })
  } catch (error) {
    log.error('获取分类列表失败', { error: error.message })
    res.status(500).json({
      code: 500,
      message: '获取分类列表失败'
    })
  }
}

// 获取分类详情
const getCategoryDetail = async (req, res) => {
  try {
    const { id } = req.params
    
    const category = await CategoryModel.findById(id)
    
    if (!category) {
      return res.status(404).json({
        code: 404,
        message: '分类不存在'
      })
    }
    
    log.info('获取分类详情成功', { categoryId: id })
    
    res.json({
      code: 200,
      message: '获取成功',
      data: category
    })
  } catch (error) {
    log.error('获取分类详情失败', { error: error.message })
    res.status(500).json({
      code: 500,
      message: '获取分类详情失败'
    })
  }
}

// 获取分类下的商品列表
const getCategoryGoods = async (req, res) => {
  try {
    const { id } = req.params
    const { 
      page = 1, 
      pageSize = 10,
      sort = 'created_at',
      order = 'desc'
    } = req.query
    
    // 验证分类是否存在
    const category = await CategoryModel.findById(id)
    
    if (!category) {
      return res.status(404).json({
        code: 404,
        message: '分类不存在'
      })
    }
    
    const filters = {
      category_id: id,
      sort,
      order
    }
    
    const result = await GoodsModel.getList(filters, page, pageSize)
    
    log.info('获取分类商品成功', { 
      categoryId: id, 
      page, 
      pageSize, 
      total: result.total 
    })
    
    res.json({
      code: 200,
      message: '获取成功',
      data: {
        category,
        goods: result
      }
    })
  } catch (error) {
    log.error('获取分类商品失败', { error: error.message })
    res.status(500).json({
      code: 500,
      message: '获取分类商品失败'
    })
  }
}

// 获取首页分类
const getHomeCategories = async (req, res) => {
  try {
    const { limit = 3 } = req.query
    const categories = await CategoryModel.getByParentId(0)
    
    // 为每个分类查询商品
    for (const category of categories) {
      try {
        const goodsResult = await GoodsModel.getList(
          { category_id: category.id }, 
          1, 
          parseInt(limit)
        )
        category.goods = goodsResult.list || []
      } catch (goodsError) {
        console.error(`获取分类 ${category.id} 商品失败:`, goodsError)
        category.goods = []
      }
    }
    
    log.info('获取首页分类成功', { count: categories.length })
    
    res.json({
      code: 200,
      message: '获取成功',
      data: categories
    })
  } catch (error) {
    log.error('获取首页分类失败', { error: error.message })
    res.status(500).json({
      code: 500,
      message: '获取首页分类失败'
    })
  }
}

// 获取分类树
const getCategoryTree = async (req, res) => {
  try {
    const tree = await CategoryModel.getTree()
    
    log.info('获取分类树成功', { count: tree.length })
    
    res.json({
      code: 200,
      message: '获取成功',
      data: tree
    })
  } catch (error) {
    log.error('获取分类树失败', { error: error.message })
    res.status(500).json({
      code: 500,
      message: '获取分类树失败'
    })
  }
}

module.exports = {
  getCategoryList,
  getCategoryDetail,
  getCategoryGoods,
  getHomeCategories,
  getCategoryTree
}
