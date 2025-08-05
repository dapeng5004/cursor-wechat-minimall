const express = require('express')
const { body } = require('express-validator')
const addressController = require('../../controllers/addressController')
const { auth } = require('../../middleware/auth')
const { validate } = require('../../middleware/validation')

const router = express.Router()

// 所有地址接口都需要身份认证
router.use(auth)

// 获取地址列表
router.get('/list', addressController.getAddressList)

// 添加收货地址
router.post('/add', [
  body('name').notEmpty().withMessage('收货人姓名不能为空'),
  body('phone').isMobilePhone('zh-CN').withMessage('请输入正确的手机号'),
  body('province').notEmpty().withMessage('省份不能为空'),
  body('city').notEmpty().withMessage('城市不能为空'),
  body('district').notEmpty().withMessage('区县不能为空'),
  body('detail').notEmpty().withMessage('详细地址不能为空'),
  body('is_default').optional().isBoolean().withMessage('默认地址值无效')
], validate, addressController.addAddress)

// 更新收货地址
router.put('/update/:id', [
  body('name').optional().notEmpty().withMessage('收货人姓名不能为空'),
  body('phone').optional().isMobilePhone('zh-CN').withMessage('请输入正确的手机号'),
  body('province').optional().notEmpty().withMessage('省份不能为空'),
  body('city').optional().notEmpty().withMessage('城市不能为空'),
  body('district').optional().notEmpty().withMessage('区县不能为空'),
  body('detail').optional().notEmpty().withMessage('详细地址不能为空'),
  body('is_default').optional().isBoolean().withMessage('默认地址值无效')
], validate, addressController.updateAddress)

// 删除收货地址
router.delete('/delete/:id', addressController.deleteAddress)

// 设置默认地址
router.put('/setDefault/:id', addressController.setDefaultAddress)

// 获取默认地址
router.get('/default', addressController.getDefaultAddress)

module.exports = router
