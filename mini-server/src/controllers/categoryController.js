const { executeQuery, paginate } = require('../utils/database')
const log = require('../utils/logger')

// 获取分类列表
const getCategoryList = async (req, res) => {
  try {
    const categories = await executeQuery(
      'SELECT * FROM categories WHERE status = 1 ORDER BY sort ASC, id ASC'
    )
    
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
    
    const categories = await executeQuery(
      'SELECT * FROM categories WHERE id = ? AND status = 1',
      [id]
    )
    
    if (categories.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '分类不存在'
      })
    }
    
    log.info('获取分类详情成功', { categoryId: id })
    
    res.json({
      code: 200,
      message: '获取成功',
      data: categories[0]
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
    const categories = await executeQuery(
      'SELECT * FROM categories WHERE id = ? AND status = 1',
      [id]
    )
    
    if (categories.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '分类不存在'
      })
    }
    
    let sql = `SELECT g.*, c.name as category_name 
                FROM goods g 
                LEFT JOIN categories c ON g.category_id = c.id 
                WHERE g.category_id = ? AND g.status = 1`
    let params = [id]
    
    // 排序
    const allowedSorts = ['created_at', 'price', 'sales', 'updated_at']
    const allowedOrders = ['asc', 'desc']
    
    if (allowedSorts.includes(sort) && allowedOrders.includes(order)) {
      sql += ` ORDER BY g.${sort} ${order.toUpperCase()}`
    } else {
      sql += ' ORDER BY g.created_at DESC'
    }
    
    const result = await paginate(sql, params, page, pageSize)
    
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
        category: categories[0],
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

// 获取首页分类及商品
const getHomeCategories = async (req, res) => {
  try {
    const { limit = 3 } = req.query
    
    // 获取分类列表
    const categories = await executeQuery(
      'SELECT * FROM categories WHERE status = 1 ORDER BY sort ASC, id ASC'
    )
    
    // 为每个分类获取商品
    const result = []
    for (const category of categories) {
      const goods = await executeQuery(
        `SELECT g.*, c.name as category_name 
         FROM goods g 
         LEFT JOIN categories c ON g.category_id = c.id 
         WHERE g.category_id = ? AND g.status = 1 
         ORDER BY g.is_recommend DESC, g.sales DESC, g.created_at DESC 
         LIMIT ?`,
        [category.id, parseInt(limit)]
      )
      
      result.push({
        ...category,
        goods
      })
    }
    
    log.info('获取首页分类成功', { categoryCount: categories.length, limit })
    
    res.json({
      code: 200,
      message: '获取成功',
      data: result
    })
  } catch (error) {
    log.error('获取首页分类失败', { error: error.message })
    res.status(500).json({
      code: 500,
      message: '获取首页分类失败'
    })
  }
}

module.exports = {
  getCategoryList,
  getCategoryDetail,
  getCategoryGoods,
  getHomeCategories
}
