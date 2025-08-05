const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const pool = require('../config/database')
const auth = require('../middleware/auth')

const router = express.Router()

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// 配置multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const uploadPath = path.join(uploadDir, `${year}/${month}/${day}`)
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    cb(null, file.fieldname + '-' + uniqueSuffix + ext)
  }
})

// 文件过滤器
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('不支持的文件类型'), false)
  }
}

// 配置multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  }
})

// 上传单个文件
router.post('/file', auth, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: '请选择要上传的文件'
      })
    }

    // 获取相对于uploads目录的路径
    const relativePath = path.relative(path.join(__dirname, '../uploads'), req.file.path)
    const fileUrl = `/uploads/${relativePath.replace(/\\/g, '/')}`
    
    res.json({
      code: 200,
      message: '上传成功',
      data: {
        url: fileUrl,
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size
      }
    })
  } catch (error) {
    console.error('文件上传错误:', error)
    res.status(500).json({
      code: 500,
      message: '上传失败：' + error.message
    })
  }
})

// 上传图片
router.post('/image', auth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: '请选择要上传的图片'
      })
    }

    // 获取相对于uploads目录的路径
    const relativePath = path.relative(path.join(__dirname, '../uploads'), req.file.path)
    const fileUrl = `/uploads/${relativePath.replace(/\\/g, '/')}`
    
    res.json({
      code: 200,
      message: '上传成功',
      data: {
        url: fileUrl,
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size
      }
    })
  } catch (error) {
    console.error('图片上传错误:', error)
    res.status(500).json({
      code: 500,
      message: '上传失败：' + error.message
    })
  }
})

// 批量上传图片
router.post('/images', auth, upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请选择要上传的图片'
      })
    }

    const files = req.files.map(file => {
      // 获取相对于uploads目录的路径
      const relativePath = path.relative(path.join(__dirname, '../uploads'), file.path)
      const fileUrl = `/uploads/${relativePath.replace(/\\/g, '/')}`
      
      return {
        url: fileUrl,
        filename: file.filename,
        originalname: file.originalname,
        size: file.size
      }
    })
    
    res.json({
      code: 200,
      message: '上传成功',
      data: files
    })
  } catch (error) {
    console.error('批量上传错误:', error)
    res.status(500).json({
      code: 500,
      message: '上传失败：' + error.message
    })
  }
})

// 删除文件
router.post('/delete', auth, (req, res) => {
  try {
    const { fileUrl } = req.body
    
    if (!fileUrl) {
      return res.status(400).json({
        code: 400,
        message: '请提供要删除的文件路径'
      })
    }

    const filePath = path.join(__dirname, '..', fileUrl)
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      res.json({
        code: 200,
        message: '删除成功'
      })
    } else {
      res.status(404).json({
        code: 404,
        message: '文件不存在'
      })
    }
  } catch (error) {
    console.error('删除文件错误:', error)
    res.status(500).json({
      code: 500,
      message: '删除失败：' + error.message
    })
  }
})

module.exports = router 