const express = require('express')
const { body } = require('express-validator')
const orderController = require('../../controllers/orderController')
const { auth } = require('../../middleware/auth')
const { validate } = require('../../middleware/validation')

const router = express.Router()

// 所有订单接口都需要身份认证
router.use(auth)

// 创建订单
router.post('/create', [
  body('address_id').isInt({ min: 1 }).withMessage('收货地址ID必须是正整数'),
  body('goods_list').isArray({ min: 1 }).withMessage('商品列表不能为空'),
  body('goods_list.*.goods_id').isInt({ min: 1 }).withMessage('商品ID必须是正整数'),
  body('goods_list.*.quantity').isInt({ min: 1 }).withMessage('商品数量必须是正整数'),
  body('remark').optional().isLength({ max: 255 }).withMessage('备注长度不能超过255字符')
], validate, orderController.createOrder)

// 获取订单列表
router.get('/list', orderController.getOrderList)

// 获取订单详情
router.get('/detail/:id', orderController.getOrderDetail)

// 发起支付
router.post('/pay', [
  body('order_id').isInt({ min: 1 }).withMessage('订单ID必须是正整数')
], validate, orderController.payOrder)

// 确认收货
router.put('/confirm/:id', orderController.confirmOrder)

// 取消订单
router.put('/cancel/:id', orderController.cancelOrder)

module.exports = router
