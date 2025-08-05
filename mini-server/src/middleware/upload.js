const multer = require('multer')
const path = require('path')
const fs = require('fs')
const appConfig = require('../config/app')

// 确保上传目录存在
const ensureUploadDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

// 配置存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadType = req.params.type || 'general'
    const uploadPath = path.join(appConfig.upload.path, uploadType)
    ensureUploadDir(uploadPath)
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now()
    const random = Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    const filename = `${uploadType}-${timestamp}-${random}${ext}`
    cb(null, filename)
  }
})

// 文件过滤器
const fileFilter = (req, file, cb) => {
  if (appConfig.upload.allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('不支持的文件类型'), false)
  }
}

// 创建multer实例
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: appConfig.upload.maxSize
  }
})

// 单文件上传中间件
const uploadSingle = (fieldName) => {
  return upload.single(fieldName)
}

// 多文件上传中间件
const uploadMultiple = (fieldName, maxCount = 10) => {
  return upload.array(fieldName, maxCount)
}

// 错误处理中间件
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        code: 400,
        message: '文件大小超出限制'
      })
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        code: 400,
        message: '文件数量超出限制'
      })
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        code: 400,
        message: '意外的文件字段'
      })
    }
  }
  
  if (err.message === '不支持的文件类型') {
    return res.status(400).json({
      code: 400,
      message: '不支持的文件类型'
    })
  }
  
  next(err)
}

module.exports = {
  uploadSingle,
  uploadMultiple,
  handleUploadError
} 