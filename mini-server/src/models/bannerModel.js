const { executeQuery } = require('../utils/database')

// 轮播图模型
class BannerModel {
  // 获取所有轮播图
  static async getAll() {
    return await executeQuery(
      'SELECT * FROM banners WHERE status = 1 ORDER BY sort ASC, id ASC'
    )
  }

  // 根据 ID 获取轮播图
  static async findById(id) {
    const banners = await executeQuery(
      'SELECT * FROM banners WHERE id = ? AND status = 1',
      [id]
    )
    return banners[0] || null
  }

  // 根据位置获取轮播图
  static async getByPosition(position = 'home') {
    return await executeQuery(
      'SELECT * FROM banners WHERE status = 1 ORDER BY sort ASC, id ASC',
      []
    )
  }

  // 创建轮播图
  static async create(bannerData) {
    const { 
      title, 
      image, 
      link = '', 
      sort = 0, 
      status = 1 
    } = bannerData
    
    const result = await executeQuery(
      'INSERT INTO banners (title, image, link, sort, status) VALUES (?, ?, ?, ?, ?)',
      [title, image, link, sort, status]
    )
    
    return this.findById(result.insertId)
  }

  // 更新轮播图
  static async update(id, updateData) {
    const { 
      title, 
      image, 
      link, 
      sort, 
      status 
    } = updateData
    
    const updateFields = []
    const params = []
    
    if (title !== undefined) {
      updateFields.push('title = ?')
      params.push(title)
    }
    if (image !== undefined) {
      updateFields.push('image = ?')
      params.push(image)
    }
    if (link !== undefined) {
      updateFields.push('link = ?')
      params.push(link)
    }
    if (sort !== undefined) {
      updateFields.push('sort = ?')
      params.push(sort)
    }
    if (status !== undefined) {
      updateFields.push('status = ?')
      params.push(status)
    }
    
    if (updateFields.length === 0) {
      return null
    }
    
    updateFields.push('updated_at = NOW()')
    params.push(id)
    
    await executeQuery(
      `UPDATE banners SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    )
    
    return this.findById(id)
  }

  // 删除轮播图（软删除）
  static async delete(id) {
    await executeQuery(
      'UPDATE banners SET status = 0, updated_at = NOW() WHERE id = ?',
      [id]
    )
    
    return true
  }

  // 批量更新排序
  static async updateSortOrder(sortData) {
    const connection = await require('../utils/database').pool.getConnection()
    
    try {
      await connection.beginTransaction()
      
      for (const item of sortData) {
        await connection.execute(
          'UPDATE banners SET sort = ?, updated_at = NOW() WHERE id = ?',
          [item.sort, item.id]
        )
      }
      
      await connection.commit()
      return true
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }

  // 获取轮播图统计信息
  static async getStats() {
    const stats = await executeQuery(`
      SELECT 
        COUNT(*) as total_banners,
        COUNT(CASE WHEN status = 1 THEN 1 END) as active_banners,
        COUNT(CASE WHEN status = 0 THEN 1 END) as inactive_banners
      FROM banners
    `)
    return stats[0]
  }

  // 获取所有位置
  static async getPositions() {
    return ['home', 'category']
  }

  // 检查标题是否已存在
  static async checkTitleExists(title, excludeId = null) {
    let sql = 'SELECT COUNT(*) as count FROM banners WHERE title = ?'
    let params = [title]
    
    if (excludeId) {
      sql += ' AND id != ?'
      params.push(excludeId)
    }
    
    const result = await executeQuery(sql, params)
    return result[0].count > 0
  }
}

module.exports = BannerModel
