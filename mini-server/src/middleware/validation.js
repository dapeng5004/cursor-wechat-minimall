const { validationResult } = require('express-validator')
const { ValidationError } = require('./errorHandler')

// 验证中间件
const validate = (req, res, next) => {
  const errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }))
    
    throw new ValidationError('数据验证失败', errorMessages)
  }
  
  next()
}

// 通用验证规则
const commonValidators = {
  // 手机号验证
  phone: {
    in: ['body'],
    isMobilePhone: {
      options: ['zh-CN'],
      errorMessage: '请输入正确的手机号'
    }
  },
  
  // 邮箱验证
  email: {
    in: ['body'],
    isEmail: {
      errorMessage: '请输入正确的邮箱地址'
    }
  },
  
  // 密码验证
  password: {
    in: ['body'],
    isLength: {
      options: { min: 6, max: 20 },
      errorMessage: '密码长度应在6-20位之间'
    }
  },
  
  // ID验证
  id: {
    in: ['params'],
    isInt: {
      options: { min: 1 },
      errorMessage: 'ID必须是正整数'
    }
  },
  
  // 分页参数验证
  page: {
    in: ['query'],
    optional: true,
    isInt: {
      options: { min: 1 },
      errorMessage: '页码必须是正整数'
    }
  },
  
  pageSize: {
    in: ['query'],
    optional: true,
    isInt: {
      options: { min: 1, max: 100 },
      errorMessage: '每页数量必须在1-100之间'
    }
  }
}

module.exports = {
  validate,
  commonValidators
} 