const { executeQuery } = require('../utils/database')

// 购物车模型
class CartModel {
  // 获取用户购物车列表
  static async getUserCart(userId) {
    return await executeQuery(
      `SELECT c.*, g.name as goods_name, g.price as goods_price, g.images as goods_images, g.stock as goods_stock
       FROM cart c
       LEFT JOIN goods g ON c.goods_id = g.id
       WHERE c.user_id = ? AND c.status = 1
       ORDER BY c.created_at DESC`,
      [userId]
    )
  }

  // 根据 ID 获取购物车项
  static async findById(id) {
    const cartItems = await executeQuery(
      `SELECT c.*, g.name as goods_name, g.price as goods_price, g.images as goods_images, g.stock as goods_stock
       FROM cart c
       LEFT JOIN goods g ON c.goods_id = g.id
       WHERE c.id = ? AND c.status = 1`,
      [id]
    )
    return cartItems[0] || null
  }

  // 检查商品是否已在购物车中
  static async checkExists(userId, goodsId) {
    const cartItems = await executeQuery(
      'SELECT * FROM cart WHERE user_id = ? AND goods_id = ? AND status = 1',
      [userId, goodsId]
    )
    return cartItems[0] || null
  }

  // 添加商品到购物车
  static async add(userId, goodsId, quantity = 1) {
    // 检查商品是否存在
    const goods = await executeQuery(
      'SELECT * FROM goods WHERE id = ? AND status = 1',
      [goodsId]
    )
    
    if (goods.length === 0) {
      throw new Error('商品不存在')
    }
    
    if (goods[0].stock < quantity) {
      throw new Error('商品库存不足')
    }
    
    // 检查是否已在购物车中
    const existingItem = await this.checkExists(userId, goodsId)
    
    if (existingItem) {
      // 更新数量
      const newQuantity = existingItem.quantity + quantity
      if (goods[0].stock < newQuantity) {
        throw new Error('商品库存不足')
      }
      
      return await this.updateQuantity(existingItem.id, newQuantity)
    } else {
      // 新增购物车项
      const result = await executeQuery(
        'INSERT INTO cart (user_id, goods_id, quantity) VALUES (?, ?, ?)',
        [userId, goodsId, quantity]
      )
      
      return this.findById(result.insertId)
    }
  }

  // 更新购物车商品数量
  static async updateQuantity(id, quantity) {
    // 检查库存
    const cartItem = await this.findById(id)
    if (!cartItem) {
      throw new Error('购物车项不存在')
    }
    
    if (cartItem.goods_stock < quantity) {
      throw new Error('商品库存不足')
    }
    
    await executeQuery(
      'UPDATE cart SET quantity = ?, updated_at = NOW() WHERE id = ?',
      [quantity, id]
    )
    
    return this.findById(id)
  }

  // 删除购物车项
  static async delete(id) {
    await executeQuery(
      'UPDATE cart SET status = 0, updated_at = NOW() WHERE id = ?',
      [id]
    )
    
    return true
  }

  // 批量删除购物车项
  static async batchDelete(userId, ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error('请选择要删除的商品')
    }
    
    const placeholders = ids.map(() => '?').join(',')
    await executeQuery(
      `UPDATE cart SET status = 0, updated_at = NOW() WHERE user_id = ? AND id IN (${placeholders})`,
      [userId, ...ids]
    )
    
    return true
  }

  // 清空用户购物车
  static async clearUserCart(userId) {
    await executeQuery(
      'UPDATE cart SET status = 0, updated_at = NOW() WHERE user_id = ? AND status = 1',
      [userId]
    )
    
    return true
  }

  // 获取购物车统计信息
  static async getCartStats(userId) {
    const stats = await executeQuery(
      `SELECT 
        COUNT(*) as total_items,
        SUM(c.quantity) as total_quantity,
        SUM(c.quantity * g.price) as total_amount
       FROM cart c
       LEFT JOIN goods g ON c.goods_id = g.id
       WHERE c.user_id = ? AND c.status = 1`,
      [userId]
    )
    
    return {
      total_items: stats[0].total_items || 0,
      total_quantity: stats[0].total_quantity || 0,
      total_amount: stats[0].total_amount || 0
    }
  }

  // 检查购物车商品库存
  static async checkStock(userId) {
    const cartItems = await executeQuery(
      `SELECT c.*, g.stock as goods_stock, g.name as goods_name
       FROM cart c
       LEFT JOIN goods g ON c.goods_id = g.id
       WHERE c.user_id = ? AND c.status = 1`,
      [userId]
    )
    
    const invalidItems = []
    
    for (const item of cartItems) {
      if (item.quantity > item.goods_stock) {
        invalidItems.push({
          id: item.id,
          goods_name: item.goods_name,
          quantity: item.quantity,
          stock: item.goods_stock
        })
      }
    }
    
    return invalidItems
  }

  // 获取购物车商品详情（用于结算）
  static async getCartForCheckout(userId) {
    return await executeQuery(
      `SELECT c.*, g.name as goods_name, g.price as goods_price, g.images as goods_images, g.stock as goods_stock
       FROM cart c
       LEFT JOIN goods g ON c.goods_id = g.id
       WHERE c.user_id = ? AND c.status = 1 AND c.quantity <= g.stock
       ORDER BY c.created_at DESC`,
      [userId]
    )
  }
}

module.exports = CartModel
