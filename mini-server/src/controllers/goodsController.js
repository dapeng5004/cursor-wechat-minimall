const { executeQuery, paginate } = require('../utils/database')
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
    
    let sql = 'SELECT g.*, c.name as category_name FROM goods g LEFT JOIN categories c ON g.category_id = c.id WHERE g.status = 1'
    let params = []
    
    // 分类筛选
    if (category_id) {
      sql += ' AND g.category_id = ?'
      params.push(category_id)
    }
    
    // 关键词搜索
    if (keyword) {
      sql += ' AND (g.name LIKE ? OR g.description LIKE ?)'
      params.push(`%${keyword}%`)
      params.push(`%${keyword}%`)
    }
    
    // 价格筛选
    if (min_price) {
      sql += ' AND g.price >= ?'
      params.push(min_price)
    }
    
    if (max_price) {
      sql += ' AND g.price <= ?'
      params.push(max_price)
    }
    
    // 排序
    const allowedSorts = ['created_at', 'price', 'sales', 'updated_at']
    const allowedOrders = ['asc', 'desc']
    
    if (allowedSorts.includes(sort) && allowedOrders.includes(order)) {
      sql += ` ORDER BY g.${sort} ${order.toUpperCase()}`
    } else {
      sql += ' ORDER BY g.created_at DESC'
    }
    
    const result = await paginate(sql, params, page, pageSize)
    
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
    
    const goods = await executeQuery(
      `SELECT g.*, c.name as category_name 
       FROM goods g 
       LEFT JOIN categories c ON g.category_id = c.id 
       WHERE g.id = ? AND g.status = 1`,
      [id]
    )
    
    if (goods.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '商品不存在'
      })
    }
    
    // 增加浏览量（这里可以添加浏览记录表）
    await executeQuery(
      'UPDATE goods SET sales = sales + 1 WHERE id = ?',
      [id]
    )
    
    log.info('获取商品详情成功', { goodsId: id })
    
    res.json({
      code: 200,
      message: '获取成功',
      data: goods[0]
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
    
    const goods = await executeQuery(
      `SELECT g.*, c.name as category_name 
       FROM goods g 
       LEFT JOIN categories c ON g.category_id = c.id 
       WHERE g.status = 1 AND g.is_recommend = 1 
       ORDER BY g.sales DESC, g.created_at DESC 
       LIMIT ?`,
      [parseInt(limit)]
    )
    
    log.info('获取推荐商品成功', { limit })
    
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

// 获取热销商品
const getHotGoods = async (req, res) => {
  try {
    const { limit = 10 } = req.query
    
    const goods = await executeQuery(
      `SELECT g.*, c.name as category_name 
       FROM goods g 
       LEFT JOIN categories c ON g.category_id = c.id 
       WHERE g.status = 1 
       ORDER BY g.sales DESC 
       LIMIT ?`,
      [parseInt(limit)]
    )
    
    log.info('获取热销商品成功', { limit })
    
    res.json({
      code: 200,
      message: '获取成功',
      data: goods
    })
  } catch (error) {
    log.error('获取热销商品失败', { error: error.message })
    res.status(500).json({
      code: 500,
      message: '获取热销商品失败'
    })
  }
}

// 搜索商品
const searchGoods = async (req, res) => {
  try {
    const { 
      keyword, 
      page = 1, 
      pageSize = 10,
      category_id 
    } = req.query
    
    if (!keyword) {
      return res.status(400).json({
        code: 400,
        message: '请输入搜索关键词'
      })
    }
    
    let sql = `SELECT g.*, c.name as category_name 
                FROM goods g 
                LEFT JOIN categories c ON g.category_id = c.id 
                WHERE g.status = 1 AND (g.name LIKE ? OR g.description LIKE ?)`
    let params = [`%${keyword}%`, `%${keyword}%`]
    
    if (category_id) {
      sql += ' AND g.category_id = ?'
      params.push(category_id)
    }
    
    sql += ' ORDER BY g.sales DESC, g.created_at DESC'
    
    const result = await paginate(sql, params, page, pageSize)
    
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
