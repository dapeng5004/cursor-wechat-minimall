 const { executeQuery } = require('../utils/database')

// 用户模型
class UserModel {
  // 根据 openid 查找用户
  static async findByOpenid(openid) {
    const users = await executeQuery(
      'SELECT * FROM users WHERE openid = ?',
      [openid]
    )
    return users[0] || null
  }

  // 根据 ID 查找用户
  static async findById(id) {
    const users = await executeQuery(
      'SELECT id, nickname, avatar, phone, gender, status, created_at, updated_at FROM users WHERE id = ?',
      [id]
    )
    return users[0] || null
  }

  // 创建新用户
  static async create(userData) {
    const { openid, nickname = '微信用户', avatar = null, phone = null, gender = 0 } = userData
    
    const result = await executeQuery(
      'INSERT INTO users (openid, nickname, avatar, phone, gender, status) VALUES (?, ?, ?, ?, ?, ?)',
      [openid, nickname, avatar, phone, gender, 1]
    )
    
    return this.findById(result.insertId)
  }

  // 更新用户信息
  static async update(id, updateData) {
    const { nickname, avatar, phone, gender } = updateData
    const updateFields = []
    const params = []
    
    if (nickname !== undefined) {
      updateFields.push('nickname = ?')
      params.push(nickname)
    }
    if (avatar !== undefined) {
      updateFields.push('avatar = ?')
      params.push(avatar)
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?')
      params.push(phone)
    }
    if (gender !== undefined) {
      updateFields.push('gender = ?')
      params.push(gender)
    }
    
    if (updateFields.length === 0) {
      return null
    }
    
    updateFields.push('updated_at = NOW()')
    params.push(id)
    
    await executeQuery(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    )
    
    return this.findById(id)
  }

  // 更新用户状态
  static async updateStatus(id, status) {
    await executeQuery(
      'UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    )
    return this.findById(id)
  }

  // 获取用户统计信息
  static async getStats() {
    const stats = await executeQuery(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN status = 1 THEN 1 END) as active_users,
        COUNT(CASE WHEN status = 0 THEN 1 END) as inactive_users,
        COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today_new_users
      FROM users
    `)
    return stats[0]
  }
}

module.exports = UserModel
