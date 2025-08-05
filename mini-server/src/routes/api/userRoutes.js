const express = require('express')
const { body } = require('express-validator')
const userController = require('../../controllers/userController')
const { auth } = require('../../middleware/auth')
const { validate } = require('../../middleware/validation')

const router = express.Router()

// 用户登录（微信小程序）
router.post('/login', [
  body('code').notEmpty().withMessage('登录凭证不能为空')
], validate, userController.login)

// 获取用户信息
router.get('/info', auth, userController.getUserInfo)

// 更新用户信息
router.put('/info', auth, [
  body('nickname').optional().isLength({ min: 1, max: 50 }).withMessage('昵称长度应在1-50字符之间'),
  body('phone').optional().isMobilePhone('zh-CN').withMessage('请输入正确的手机号'),
  body('gender').optional().isIn([0, 1, 2]).withMessage('性别值无效')
], validate, userController.updateUserInfo)

// 用户退出登录
router.post('/logout', auth, userController.logout)

module.exports = router
