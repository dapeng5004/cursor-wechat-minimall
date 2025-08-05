const express = require('express')
const { body } = require('express-validator')
const adminController = require('../../controllers/adminController')
const { adminAuth } = require('../../middleware/auth')
const { validate } = require('../../middleware/validation')

const router = express.Router()

// 管理员登录
router.post('/login', [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('password').notEmpty().withMessage('密码不能为空')
], validate, adminController.login)

// 获取管理员信息
router.get('/info', adminAuth, adminController.getAdminInfo)

// 管理员退出登录
router.post('/logout', adminAuth, adminController.logout)

module.exports = router
