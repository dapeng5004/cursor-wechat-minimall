const { executeQuery } = require('../utils/database')

// 分类模型
class CategoryModel {
  // 获取所有分类
  static async getAll() {
    return await executeQuery(
      'SELECT * FROM categories WHERE status = 1 ORDER BY sort ASC, id ASC'
    )
  }

  // 根据 ID 获取分类
  static async findById(id) {
    const categories = await executeQuery(
      'SELECT * FROM categories WHERE id = ? AND status = 1',
      [id]
    )
    return categories[0] || null
  }

  // 获取所有顶级分类（由于没有parent_id字段，直接获取所有分类）
  static async getByParentId(parentId = 0) {
    return await executeQuery(
      'SELECT * FROM categories WHERE status = 1 ORDER BY sort ASC, id ASC',
      []
    )
  }

  // 获取分类树结构
  static async getTree() {
    const allCategories = await this.getAll()
    return this.buildTree(allCategories)
  }

  // 构建分类树（简化版本，由于没有parent_id字段，直接返回所有分类）
  static buildTree(categories, parentId = 0) {
    // 由于没有parent_id字段，直接返回所有分类作为顶级分类
    return categories.map(category => ({
      ...category,
      children: []
    }))
  }

  // 创建分类
  static async create(categoryData) {
    const { 
      name, 
      image = null, 
      sort = 0, 
      status = 1 
    } = categoryData
    
    const result = await executeQuery(
      'INSERT INTO categories (name, image, sort, status) VALUES (?, ?, ?, ?)',
      [name, image, sort, status]
    )
    
    return this.findById(result.insertId)
  }

  // 更新分类
  static async update(id, updateData) {
    const { 
      name, 
      image, 
      sort, 
      status 
    } = updateData
    
    const updateFields = []
    const params = []
    
    if (name !== undefined) {
      updateFields.push('name = ?')
      params.push(name)
    }
    if (image !== undefined) {
      updateFields.push('image = ?')
      params.push(image)
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
      `UPDATE categories SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    )
    
    return this.findById(id)
  }

  // 删除分类（软删除）
  static async delete(id) {
    // 检查是否有关联的商品
    const goods = await executeQuery(
      'SELECT COUNT(*) as count FROM goods WHERE category_id = ? AND status = 1',
      [id]
    )
    
    if (goods[0].count > 0) {
      throw new Error('该分类下还有商品，无法删除')
    }
    
    await executeQuery(
      'UPDATE categories SET status = 0, updated_at = NOW() WHERE id = ?',
      [id]
    )
    
    return true
  }

  // 获取分类统计信息
  static async getStats() {
    const stats = await executeQuery(`
      SELECT 
        COUNT(*) as total_categories,
        COUNT(CASE WHEN status = 1 THEN 1 END) as active_categories,
        COUNT(CASE WHEN status = 0 THEN 1 END) as inactive_categories
      FROM categories
    `)
    return stats[0]
  }

  // 检查分类名称是否已存在
  static async checkNameExists(name, excludeId = null) {
    let sql = 'SELECT COUNT(*) as count FROM categories WHERE name = ?'
    let params = [name]
    
    if (excludeId) {
      sql += ' AND id != ?'
      params.push(excludeId)
    }
    
    const result = await executeQuery(sql, params)
    return result[0].count > 0
  }
}

module.exports = CategoryModel
