const { executeQuery } = require('../utils/database')
const log = require('../utils/logger')

// 获取地址列表
const getAddressList = async (req, res) => {
  try {
    const userId = req.user.id
    
    const addresses = await executeQuery(
      'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
      [userId]
    )
    
    log.info('获取地址列表成功', { userId, count: addresses.length })
    
    res.json({
      code: 200,
      message: '获取成功',
      data: addresses
    })
  } catch (error) {
    log.error('获取地址列表失败', { error: error.message })
    res.status(500).json({
      code: 500,
      message: '获取地址列表失败'
    })
  }
}

// 添加收货地址
const addAddress = async (req, res) => {
  try {
    const userId = req.user.id
    const { name, phone, province, city, district, detail, is_default = 0 } = req.body
    
    // 验证必填字段
    if (!name || !phone || !province || !city || !district || !detail) {
      return res.status(400).json({
        code: 400,
        message: '请填写完整的地址信息'
      })
    }
    
    // 如果设置为默认地址，先取消其他默认地址
    if (is_default) {
      await executeQuery(
        'UPDATE addresses SET is_default = 0 WHERE user_id = ?',
        [userId]
      )
    }
    
    const result = await executeQuery(
      'INSERT INTO addresses (user_id, name, phone, province, city, district, detail, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, name, phone, province, city, district, detail, is_default]
    )
    
    log.info('添加收货地址成功', { userId, addressId: result.insertId })
    
    res.json({
      code: 200,
      message: '添加成功',
      data: { id: result.insertId }
    })
  } catch (error) {
    log.error('添加收货地址失败', { error: error.message })
    res.status(500).json({
      code: 500,
      message: '添加收货地址失败'
    })
  }
}

// 更新收货地址
const updateAddress = async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params
    const { name, phone, province, city, district, detail, is_default } = req.body
    
    // 验证地址是否存在
    const address = await executeQuery(
      'SELECT * FROM addresses WHERE id = ? AND user_id = ?',
      [id, userId]
    )
    
    if (address.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '地址不存在'
      })
    }
    
    // 如果设置为默认地址，先取消其他默认地址
    if (is_default) {
      await executeQuery(
        'UPDATE addresses SET is_default = 0 WHERE user_id = ? AND id != ?',
        [userId, id]
      )
    }
    
    const updateFields = []
    const updateValues = []
    
    if (name !== undefined) {
      updateFields.push('name = ?')
      updateValues.push(name)
    }
    
    if (phone !== undefined) {
      updateFields.push('phone = ?')
      updateValues.push(phone)
    }
    
    if (province !== undefined) {
      updateFields.push('province = ?')
      updateValues.push(province)
    }
    
    if (city !== undefined) {
      updateFields.push('city = ?')
      updateValues.push(city)
    }
    
    if (district !== undefined) {
      updateFields.push('district = ?')
      updateValues.push(district)
    }
    
    if (detail !== undefined) {
      updateFields.push('detail = ?')
      updateValues.push(detail)
    }
    
    if (is_default !== undefined) {
      updateFields.push('is_default = ?')
      updateValues.push(is_default)
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '没有需要更新的字段'
      })
    }
    
    updateValues.push(id)
    
    await executeQuery(
      `UPDATE addresses SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    )
    
    log.info('更新收货地址成功', { userId, addressId: id })
    
    res.json({
      code: 200,
      message: '更新成功'
    })
  } catch (error) {
    log.error('更新收货地址失败', { error: error.message })
    res.status(500).json({
      code: 500,
      message: '更新收货地址失败'
    })
  }
}

// 删除收货地址
const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params
    
    // 验证地址是否存在
    const address = await executeQuery(
      'SELECT * FROM addresses WHERE id = ? AND user_id = ?',
      [id, userId]
    )
    
    if (address.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '地址不存在'
      })
    }
    
    await executeQuery(
      'DELETE FROM addresses WHERE id = ?',
      [id]
    )
    
    log.info('删除收货地址成功', { userId, addressId: id })
    
    res.json({
      code: 200,
      message: '删除成功'
    })
  } catch (error) {
    log.error('删除收货地址失败', { error: error.message })
    res.status(500).json({
      code: 500,
      message: '删除收货地址失败'
    })
  }
}

// 设置默认地址
const setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params
    
    // 验证地址是否存在
    const address = await executeQuery(
      'SELECT * FROM addresses WHERE id = ? AND user_id = ?',
      [id, userId]
    )
    
    if (address.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '地址不存在'
      })
    }
    
    // 先取消所有默认地址
    await executeQuery(
      'UPDATE addresses SET is_default = 0 WHERE user_id = ?',
      [userId]
    )
    
    // 设置新的默认地址
    await executeQuery(
      'UPDATE addresses SET is_default = 1 WHERE id = ?',
      [id]
    )
    
    log.info('设置默认地址成功', { userId, addressId: id })
    
    res.json({
      code: 200,
      message: '设置成功'
    })
  } catch (error) {
    log.error('设置默认地址失败', { error: error.message })
    res.status(500).json({
      code: 500,
      message: '设置默认地址失败'
    })
  }
}

// 获取默认地址
const getDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.id
    
    const addresses = await executeQuery(
      'SELECT * FROM addresses WHERE user_id = ? AND is_default = 1',
      [userId]
    )
    
    log.info('获取默认地址成功', { userId })
    
    res.json({
      code: 200,
      message: '获取成功',
      data: addresses.length > 0 ? addresses[0] : null
    })
  } catch (error) {
    log.error('获取默认地址失败', { error: error.message })
    res.status(500).json({
      code: 500,
      message: '获取默认地址失败'
    })
  }
}

module.exports = {
  getAddressList,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getDefaultAddress
}
