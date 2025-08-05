const { executeQuery } = require('../utils/database')
const log = require('../utils/logger')

// 获取购物车列表
const getCartList = async (req, res) => {
  try {
    const userId = req.user.id
    
    const cartItems = await executeQuery(
      `SELECT c.*, g.name as goods_name, g.image as goods_image, g.price as goods_price, g.stock as goods_stock
       FROM cart c
       LEFT JOIN goods g ON c.goods_id = g.id
       WHERE c.user_id = ? AND g.status = 1
       ORDER BY c.created_at DESC`,
      [userId]
    )
    
    log.info('获取购物车列表成功', { userId, count: cartItems.length })
    
    res.json({
      code: 200,
      message: '获取成功',
      data: cartItems
    })
  } catch (error) {
    log.error('获取购物车列表失败', { error: error.message })
    res.status(500).json({
      code: 500,
      message: '获取购物车列表失败'
    })
  }
}

// 添加商品到购物车
const addToCart = async (req, res) => {
  try {
    const userId = req.user.id
    const { goods_id, quantity = 1 } = req.body
    
    if (!goods_id) {
      return res.status(400).json({
        code: 400,
        message: '商品ID不能为空'
      })
    }
    
    // 验证商品是否存在且上架
    const goods = await executeQuery(
      'SELECT * FROM goods WHERE id = ? AND status = 1',
      [goods_id]
    )
    
    if (goods.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '商品不存在或已下架'
      })
    }
    
    // 检查库存
    if (goods[0].stock < quantity) {
      return res.status(400).json({
        code: 400,
        message: '商品库存不足'
      })
    }
    
    // 检查购物车是否已有该商品
    const existingCart = await executeQuery(
      'SELECT * FROM cart WHERE user_id = ? AND goods_id = ?',
      [userId, goods_id]
    )
    
    if (existingCart.length > 0) {
      // 更新数量
      const newQuantity = existingCart[0].quantity + quantity
      if (goods[0].stock < newQuantity) {
        return res.status(400).json({
          code: 400,
          message: '商品库存不足'
        })
      }
      
      await executeQuery(
        'UPDATE cart SET quantity = ? WHERE id = ?',
        [newQuantity, existingCart[0].id]
      )
      
      log.info('更新购物车商品数量成功', { userId, goodsId: goods_id, quantity: newQuantity })
    } else {
      // 新增购物车项
      await executeQuery(
        'INSERT INTO cart (user_id, goods_id, quantity) VALUES (?, ?, ?)',
        [userId, goods_id, quantity]
      )
      
      log.info('添加商品到购物车成功', { userId, goodsId: goods_id, quantity })
    }
    
    res.json({
      code: 200,
      message: '添加成功'
    })
  } catch (error) {
    log.error('添加商品到购物车失败', { error: error.message })
    res.status(500).json({
      code: 500,
      message: '添加商品到购物车失败'
    })
  }
}

// 更新购物车商品数量
const updateCartQuantity = async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params
    const { quantity } = req.body
    
    if (!quantity || quantity < 1) {
      return res.status(400).json({
        code: 400,
        message: '商品数量必须大于0'
      })
    }
    
    // 验证购物车项是否存在
    const cartItem = await executeQuery(
      'SELECT c.*, g.stock FROM cart c LEFT JOIN goods g ON c.goods_id = g.id WHERE c.id = ? AND c.user_id = ?',
      [id, userId]
    )
    
    if (cartItem.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '购物车商品不存在'
      })
    }
    
    // 检查库存
    if (cartItem[0].stock < quantity) {
      return res.status(400).json({
        code: 400,
        message: '商品库存不足'
      })
    }
    
    await executeQuery(
      'UPDATE cart SET quantity = ? WHERE id = ?',
      [quantity, id]
    )
    
    log.info('更新购物车商品数量成功', { userId, cartId: id, quantity })
    
    res.json({
      code: 200,
      message: '更新成功'
    })
  } catch (error) {
    log.error('更新购物车商品数量失败', { error: error.message })
    res.status(500).json({
      code: 500,
      message: '更新购物车商品数量失败'
    })
  }
}

// 删除购物车商品
const deleteCartItem = async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params
    
    // 验证购物车项是否存在
    const cartItem = await executeQuery(
      'SELECT * FROM cart WHERE id = ? AND user_id = ?',
      [id, userId]
    )
    
    if (cartItem.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '购物车商品不存在'
      })
    }
    
    await executeQuery(
      'DELETE FROM cart WHERE id = ?',
      [id]
    )
    
    log.info('删除购物车商品成功', { userId, cartId: id })
    
    res.json({
      code: 200,
      message: '删除成功'
    })
  } catch (error) {
    log.error('删除购物车商品失败', { error: error.message })
    res.status(500).json({
      code: 500,
      message: '删除购物车商品失败'
    })
  }
}

// 清空购物车
const clearCart = async (req, res) => {
  try {
    const userId = req.user.id
    
    await executeQuery(
      'DELETE FROM cart WHERE user_id = ?',
      [userId]
    )
    
    log.info('清空购物车成功', { userId })
    
    res.json({
      code: 200,
      message: '清空成功'
    })
  } catch (error) {
    log.error('清空购物车失败', { error: error.message })
    res.status(500).json({
      code: 500,
      message: '清空购物车失败'
    })
  }
}

module.exports = {
  getCartList,
  addToCart,
  updateCartQuantity,
  deleteCartItem,
  clearCart
}
