const { executeQuery } = require('../utils/database')

// 地址模型
class AddressModel {
  // 获取用户地址列表
  static async getUserAddresses(userId) {
    return await executeQuery(
      'SELECT * FROM addresses WHERE user_id = ? AND status = 1 ORDER BY is_default DESC, created_at DESC',
      [userId]
    )
  }

  // 根据 ID 获取地址
  static async findById(id) {
    const addresses = await executeQuery(
      'SELECT * FROM addresses WHERE id = ? AND status = 1',
      [id]
    )
    return addresses[0] || null
  }

  // 获取用户默认地址
  static async getDefaultAddress(userId) {
    const addresses = await executeQuery(
      'SELECT * FROM addresses WHERE user_id = ? AND is_default = 1 AND status = 1',
      [userId]
    )
    return addresses[0] || null
  }

  // 创建地址
  static async create(userId, addressData) {
    const { 
      name, 
      phone, 
      province, 
      city, 
      district, 
      detail, 
      is_default = false 
    } = addressData
    
    // 如果设置为默认地址，先取消其他默认地址
    if (is_default) {
      await this.clearDefaultAddress(userId)
    }
    
    const result = await executeQuery(
      'INSERT INTO addresses (user_id, name, phone, province, city, district, detail, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, name, phone, province, city, district, detail, is_default]
    )
    
    return this.findById(result.insertId)
  }

  // 更新地址
  static async update(id, userId, updateData) {
    const { 
      name, 
      phone, 
      province, 
      city, 
      district, 
      detail, 
      is_default 
    } = updateData
    
    // 如果设置为默认地址，先取消其他默认地址
    if (is_default) {
      await this.clearDefaultAddress(userId)
    }
    
    const updateFields = []
    const params = []
    
    if (name !== undefined) {
      updateFields.push('name = ?')
      params.push(name)
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?')
      params.push(phone)
    }
    if (province !== undefined) {
      updateFields.push('province = ?')
      params.push(province)
    }
    if (city !== undefined) {
      updateFields.push('city = ?')
      params.push(city)
    }
    if (district !== undefined) {
      updateFields.push('district = ?')
      params.push(district)
    }
    if (detail !== undefined) {
      updateFields.push('detail = ?')
      params.push(detail)
    }
    if (is_default !== undefined) {
      updateFields.push('is_default = ?')
      params.push(is_default)
    }
    
    if (updateFields.length === 0) {
      return null
    }
    
    updateFields.push('updated_at = NOW()')
    params.push(id)
    params.push(userId)
    
    await executeQuery(
      `UPDATE addresses SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
      params
    )
    
    return this.findById(id)
  }

  // 删除地址
  static async delete(id, userId) {
    await executeQuery(
      'UPDATE addresses SET status = 0, updated_at = NOW() WHERE id = ? AND user_id = ?',
      [id, userId]
    )
    
    return true
  }

  // 设置默认地址
  static async setDefault(id, userId) {
    // 先取消所有默认地址
    await this.clearDefaultAddress(userId)
    
    // 设置新的默认地址
    await executeQuery(
      'UPDATE addresses SET is_default = 1, updated_at = NOW() WHERE id = ? AND user_id = ?',
      [id, userId]
    )
    
    return this.findById(id)
  }

  // 清除用户所有默认地址
  static async clearDefaultAddress(userId) {
    await executeQuery(
      'UPDATE addresses SET is_default = 0, updated_at = NOW() WHERE user_id = ? AND is_default = 1',
      [userId]
    )
  }

  // 获取地址统计信息
  static async getAddressStats(userId) {
    const stats = await executeQuery(
      `SELECT 
        COUNT(*) as total_addresses,
        COUNT(CASE WHEN is_default = 1 THEN 1 END) as default_addresses
       FROM addresses 
       WHERE user_id = ? AND status = 1`,
      [userId]
    )
    return stats[0]
  }

  // 验证地址数据
  static validateAddress(addressData) {
    const { name, phone, province, city, district, detail } = addressData
    
    if (!name || name.trim().length === 0) {
      throw new Error('收货人姓名不能为空')
    }
    
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      throw new Error('请输入正确的手机号码')
    }
    
    if (!province || province.trim().length === 0) {
      throw new Error('省份不能为空')
    }
    
    if (!city || city.trim().length === 0) {
      throw new Error('城市不能为空')
    }
    
    if (!district || district.trim().length === 0) {
      throw new Error('区县不能为空')
    }
    
    if (!detail || detail.trim().length === 0) {
      throw new Error('详细地址不能为空')
    }
    
    return true
  }

  // 格式化地址
  static formatAddress(address) {
    if (!address) return ''
    
    const { province, city, district, detail } = address
    return `${province} ${city} ${district} ${detail}`.trim()
  }
}

module.exports = AddressModel
