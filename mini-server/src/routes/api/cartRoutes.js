const express = require('express')
const { body } = require('express-validator')
const cartController = require('../../controllers/cartController')
const { auth } = require('../../middleware/auth')
const { validate } = require('../../middleware/validation')

const router = express.Router()

// 所有购物车接口都需要身份认证
router.use(auth)

// 获取购物车列表
router.get('/list', cartController.getCartList)

// 添加商品到购物车
router.post('/add', [
  body('goods_id').isInt({ min: 1 }).withMessage('商品ID必须是正整数'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('商品数量必须是正整数')
], validate, cartController.addToCart)

// 更新购物车商品数量
router.put('/update/:id', [
  body('quantity').isInt({ min: 1 }).withMessage('商品数量必须是正整数')
], validate, cartController.updateCartQuantity)

// 删除购物车商品
router.delete('/delete/:id', cartController.deleteCartItem)

// 清空购物车
router.delete('/clear', cartController.clearCart)

module.exports = router
