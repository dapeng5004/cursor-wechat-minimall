const GoodsModel = require('../models/goodsModel')
const log = require('../utils/logger')

// 获取商品列表
const getGoodsList = async (req, res) => {
  try {
    const { 
      page = 1, 
      pageSize = 10, 
      category_id, 
      keyword,
      min_price,
      max_price,
      sort = 'created_at',
      order = 'desc'
    } = req.query
    
    const filters = {
      category_id,
      keyword,
      min_price,
      max_price,
      sort,
      order
    }
    
    const result = await GoodsModel.getList(filters, page, pageSize)
    
    log.info('获取商品列表成功', { 
      page, 
      pageSize, 
      total: result.total,
      category_id,
      keyword 
    })
    
    res.json({
      code: 200,
      message: '获取成功',
      data: result
    })
  } catch (error) {
    log.error('获取商品列表失败', { error: error.message })
    res.status(500).json({
      code: 500,
      message: '获取商品列表失败'
    })
  }
}

// 获取商品详情
const getGoodsDetail = async (req, res) => {
  try {
    const { id } = req.params
    
    const goods = await GoodsModel.findById(id)
    
    if (!goods) {
      return res.status(404).json({
        code: 404,
        message: '商品不存在'
      })
    }
    
    // 增加浏览量（这里可以添加浏览记录表）
    await GoodsModel.update(id, { views: goods.views + 1 })
    
    log.info('获取商品详情成功', { goodsId: id })
    
    res.json({
      code: 200,
      message: '获取成功',
      data: goods
    })
  } catch (error) {
    log.error('获取商品详情失败', { error: error.message })
    res.status(500).json({
      code: 500,
      message: '获取商品详情失败'
    })
  }
}

// 获取推荐商品
const getRecommendGoods = async (req, res) => {
  try {
    const { limit = 10 } = req.query
    
    const goods = await GoodsModel.getRecommend(limit)
    
    log.info('获取推荐商品成功', { limit, count: goods.length })
    
    res.json({
      code: 200,
      message: '获取成功',
      data: goods
    })
  } catch (error) {
    log.error('获取推荐商品失败', { error: error.message })
    res.status(500).json({
      code: 500,
      message: '获取推荐商品失败'
    })
  }
}

// 获取热门商品
const getHotGoods = async (req, res) => {
  try {
    const { limit = 10 } = req.query
    
    const goods = await GoodsModel.getHot(limit)
    
    log.info('获取热门商品成功', { limit, count: goods.length })
    
    res.json({
      code: 200,
      message: '获取成功',
      data: goods
    })
  } catch (error) {
    log.error('获取热门商品失败', { error: error.message })
    res.status(500).json({
      code: 500,
      message: '获取热门商品失败'
    })
  }
}

// 搜索商品
const searchGoods = async (req, res) => {
  try {
    const { keyword, page = 1, pageSize = 10 } = req.query
    
    if (!keyword || keyword.trim().length === 0) {
      return res.status(400).json({
        code: 400,
        message: '搜索关键词不能为空'
      })
    }
    
    const result = await GoodsModel.search(keyword, page, pageSize)
    
    log.info('搜索商品成功', { keyword, page, pageSize, total: result.total })
    
    res.json({
      code: 200,
      message: '搜索成功',
      data: result
    })
  } catch (error) {
    log.error('搜索商品失败', { error: error.message })
    res.status(500).json({
      code: 500,
      message: '搜索商品失败'
    })
  }
}

module.exports = {
  getGoodsList,
  getGoodsDetail,
  getRecommendGoods,
  getHotGoods,
  searchGoods
}
