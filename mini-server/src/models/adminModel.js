const { executeQuery } = require('../utils/database')
const bcrypt = require('bcryptjs')

// 管理员模型
class AdminModel {
  // 根据用户名查找管理员
  static async findByUsername(username) {
    const admins = await executeQuery(
      'SELECT * FROM admins WHERE username = ? AND status = 1',
      [username]
    )
    return admins[0] || null
  }

  // 根据 ID 查找管理员
  static async findById(id) {
    const admins = await executeQuery(
      'SELECT id, username, nickname, email, role, status, created_at, updated_at FROM admins WHERE id = ? AND status = 1',
      [id]
    )
    return admins[0] || null
  }

  // 创建管理员
  static async create(adminData) {
    const { 
      username, 
      password, 
      nickname = '', 
      email = '', 
      role = 'admin' 
    } = adminData
    
    // 检查用户名是否已存在
    const existingAdmin = await this.findByUsername(username)
    if (existingAdmin) {
      throw new Error('用户名已存在')
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const result = await executeQuery(
      'INSERT INTO admins (username, password, nickname, email, role, status) VALUES (?, ?, ?, ?, ?, ?)',
      [username, hashedPassword, nickname, email, role, 1]
    )
    
    return this.findById(result.insertId)
  }

  // 更新管理员信息
  static async update(id, updateData) {
    const { 
      nickname, 
      email, 
      role, 
      password 
    } = updateData
    
    const updateFields = []
    const params = []
    
    if (nickname !== undefined) {
      updateFields.push('nickname = ?')
      params.push(nickname)
    }
    if (email !== undefined) {
      updateFields.push('email = ?')
      params.push(email)
    }
    if (role !== undefined) {
      updateFields.push('role = ?')
      params.push(role)
    }
    if (password !== undefined) {
      const hashedPassword = await bcrypt.hash(password, 10)
      updateFields.push('password = ?')
      params.push(hashedPassword)
    }
    
    if (updateFields.length === 0) {
      return null
    }
    
    updateFields.push('updated_at = NOW()')
    params.push(id)
    
    await executeQuery(
      `UPDATE admins SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    )
    
    return this.findById(id)
  }

  // 更新管理员状态
  static async updateStatus(id, status) {
    await executeQuery(
      'UPDATE admins SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    )
    return this.findById(id)
  }

  // 验证管理员密码
  static async verifyPassword(admin, password) {
    return await bcrypt.compare(password, admin.password)
  }

  // 获取管理员列表
  static async getList(page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize
    
    // 获取总数
    const countResult = await executeQuery(
      'SELECT COUNT(*) as total FROM admins WHERE status = 1'
    )
    const total = countResult[0].total
    
    // 获取管理员列表
    const admins = await executeQuery(
      'SELECT id, username, nickname, email, role, status, created_at, updated_at FROM admins WHERE status = 1 ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [pageSize, offset]
    )
    
    return {
      list: admins,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      totalPages: Math.ceil(total / pageSize)
    }
  }

  // 删除管理员（软删除）
  static async delete(id) {
    await executeQuery(
      'UPDATE admins SET status = 0, updated_at = NOW() WHERE id = ?',
      [id]
    )
    return true
  }

  // 获取管理员统计信息
  static async getStats() {
    const stats = await executeQuery(`
      SELECT 
        COUNT(*) as total_admins,
        COUNT(CASE WHEN status = 1 THEN 1 END) as active_admins,
        COUNT(CASE WHEN status = 0 THEN 1 END) as inactive_admins,
        COUNT(CASE WHEN role = 'super_admin' THEN 1 END) as super_admins,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as normal_admins
      FROM admins
    `)
    return stats[0]
  }

  // 检查权限
  static hasPermission(admin, permission) {
    const rolePermissions = {
      'super_admin': ['all'],
      'admin': ['read', 'write', 'delete'],
      'editor': ['read', 'write'],
      'viewer': ['read']
    }
    
    const permissions = rolePermissions[admin.role] || []
    return permissions.includes('all') || permissions.includes(permission)
  }

  // 验证管理员数据
  static validateAdminData(adminData) {
    const { username, password, email } = adminData
    
    if (!username || username.trim().length < 3) {
      throw new Error('用户名至少需要3个字符')
    }
    
    if (!password || password.length < 6) {
      throw new Error('密码至少需要6个字符')
    }
    
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('请输入正确的邮箱地址')
    }
    
    return true
  }
}

module.exports = AdminModel
