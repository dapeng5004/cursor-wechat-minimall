const { executeQuery, paginate } = require('../utils/database')

// 商品模型
class GoodsModel {
  // 获取商品列表
  static async getList(filters = {}, page = 1, pageSize = 10) {
    let sql = 'SELECT g.*, c.name as category_name FROM goods g LEFT JOIN categories c ON g.category_id = c.id WHERE g.status = 1'
    let params = []
    
    // 分类筛选
    if (filters.category_id) {
      sql += ' AND g.category_id = ?'
      params.push(filters.category_id)
    }
    
    // 关键词搜索
    if (filters.keyword) {
      sql += ' AND (g.name LIKE ? OR g.description LIKE ?)'
      params.push(`%${filters.keyword}%`)
      params.push(`%${filters.keyword}%`)
    }
    
    // 价格筛选
    if (filters.min_price) {
      sql += ' AND g.price >= ?'
      params.push(filters.min_price)
    }
    
    if (filters.max_price) {
      sql += ' AND g.price <= ?'
      params.push(filters.max_price)
    }
    
    // 排序
    const allowedSorts = ['created_at', 'price', 'sales', 'updated_at']
    const allowedOrders = ['asc', 'desc']
    
    if (allowedSorts.includes(filters.sort) && allowedOrders.includes(filters.order)) {
      sql += ` ORDER BY g.${filters.sort} ${filters.order.toUpperCase()}`
    } else {
      sql += ' ORDER BY g.created_at DESC'
    }
    
    return await paginate(sql, params, page, pageSize)
  }

  // 根据 ID 获取商品详情
  static async findById(id) {
    const goods = await executeQuery(
      `SELECT g.*, c.name as category_name 
       FROM goods g 
       LEFT JOIN categories c ON g.category_id = c.id 
       WHERE g.id = ? AND g.status = 1`,
      [id]
    )
    return goods[0] || null
  }

  // 创建商品
  static async create(goodsData) {
    const { 
      name, 
      description, 
      price, 
      original_price, 
      category_id, 
      image,
      images, 
      stock, 
      sales = 0,
      status = 1,
      is_recommend = 0
    } = goodsData
    
    const result = await executeQuery(
      `INSERT INTO goods (name, description, price, original_price, category_id, image, images, stock, sales, status, is_recommend) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description, price, original_price, category_id, image, images, stock, sales, status, is_recommend]
    )
    
    return this.findById(result.insertId)
  }

  // 更新商品信息
  static async update(id, updateData) {
    const { 
      name, 
      description, 
      price, 
      original_price, 
      category_id, 
      image,
      images, 
      stock, 
      status,
      is_recommend
    } = updateData
    
    const updateFields = []
    const params = []
    
    if (name !== undefined) {
      updateFields.push('name = ?')
      params.push(name)
    }
    if (description !== undefined) {
      updateFields.push('description = ?')
      params.push(description)
    }
    if (price !== undefined) {
      updateFields.push('price = ?')
      params.push(price)
    }
    if (original_price !== undefined) {
      updateFields.push('original_price = ?')
      params.push(original_price)
    }
    if (category_id !== undefined) {
      updateFields.push('category_id = ?')
      params.push(category_id)
    }
    if (image !== undefined) {
      updateFields.push('image = ?')
      params.push(image)
    }
    if (images !== undefined) {
      updateFields.push('images = ?')
      params.push(images)
    }
    if (stock !== undefined) {
      updateFields.push('stock = ?')
      params.push(stock)
    }
    if (status !== undefined) {
      updateFields.push('status = ?')
      params.push(status)
    }
    if (is_recommend !== undefined) {
      updateFields.push('is_recommend = ?')
      params.push(is_recommend)
    }
    
    if (updateFields.length === 0) {
      return null
    }
    
    updateFields.push('updated_at = NOW()')
    params.push(id)
    
    await executeQuery(
      `UPDATE goods SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    )
    
    return this.findById(id)
  }

  // 更新商品销量
  static async updateSales(id, quantity) {
    await executeQuery(
      'UPDATE goods SET sales = sales + ?, updated_at = NOW() WHERE id = ?',
      [quantity, id]
    )
  }

  // 更新商品库存
  static async updateStock(id, quantity) {
    await executeQuery(
      'UPDATE goods SET stock = stock - ?, updated_at = NOW() WHERE id = ?',
      [quantity, id]
    )
  }

  // 获取推荐商品
  static async getRecommend(limit = 10) {
    try {
      const limitNum = parseInt(limit) || 10
      const sql = `SELECT g.*, c.name as category_name 
                   FROM goods g 
                   LEFT JOIN categories c ON g.category_id = c.id 
                   WHERE g.status = 1 AND g.is_recommend = 1
                   ORDER BY g.sales DESC, g.created_at DESC 
                   LIMIT ${limitNum}`
      return await executeQuery(sql)
    } catch (error) {
      console.error('获取推荐商品失败:', error)
      return []
    }
  }

  // 获取热门商品
  static async getHot(limit = 10) {
    try {
      const limitNum = parseInt(limit) || 10
      const sql = `SELECT g.*, c.name as category_name 
                   FROM goods g 
                   LEFT JOIN categories c ON g.category_id = c.id 
                   WHERE g.status = 1 
                   ORDER BY g.sales DESC 
                   LIMIT ${limitNum}`
      return await executeQuery(sql)
    } catch (error) {
      console.error('获取热门商品失败:', error)
      return []
    }
  }

  // 搜索商品
  static async search(keyword, page = 1, pageSize = 10) {
    const sql = `SELECT g.*, c.name as category_name 
                 FROM goods g 
                 LEFT JOIN categories c ON g.category_id = c.id 
                 WHERE g.status = 1 
                 AND (g.name LIKE ? OR g.description LIKE ?)`
    const params = [`%${keyword}%`, `%${keyword}%`]
    
    return await paginate(sql, params, page, pageSize)
  }

  // 获取商品统计信息
  static async getStats() {
    const stats = await executeQuery(`
      SELECT 
        COUNT(*) as total_goods,
        COUNT(CASE WHEN status = 1 THEN 1 END) as active_goods,
        COUNT(CASE WHEN status = 0 THEN 1 END) as inactive_goods,
        SUM(sales) as total_sales,
        SUM(stock) as total_stock
      FROM goods
    `)
    return stats[0]
  }
}

module.exports = GoodsModel
