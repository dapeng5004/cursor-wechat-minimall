const mysql = require('mysql2/promise')
const config = require('../../config')

// 创建连接池
const pool = mysql.createPool(config.database)

// 执行查询
const executeQuery = async (sql, params = []) => {
  try {
    const [rows] = await pool.execute(sql, params)
    return rows
  } catch (error) {
    console.error('数据库查询错误:', error)
    throw error
  }
}

// 执行事务
const executeTransaction = async (queries) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    
    const results = []
    for (const query of queries) {
      const [result] = await connection.execute(query.sql, query.params || [])
      results.push(result)
    }
    
    await connection.commit()
    return results
  } catch (error) {
    await connection.rollback()
    console.error('事务执行错误:', error)
    throw error
  } finally {
    connection.release()
  }
}

// 分页查询
const paginate = async (sql, params = [], page = 1, pageSize = 10) => {
  try {
    const offset = (page - 1) * pageSize
    
    // 获取总数
    const countSql = sql.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM')
    const countResult = await executeQuery(countSql, params)
    const total = countResult[0].total
    
    // 获取分页数据
    const dataSql = `${sql} LIMIT ${pageSize} OFFSET ${offset}`
    const data = await executeQuery(dataSql, params)
    
    return {
      list: data,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      totalPages: Math.ceil(total / pageSize)
    }
  } catch (error) {
    console.error('分页查询错误:', error)
    throw error
  }
}

// 测试数据库连接
const testConnection = async () => {
  try {
    await executeQuery('SELECT 1')
    console.log('数据库连接成功')
    return true
  } catch (error) {
    console.error('数据库连接失败:', error)
    return false
  }
}

module.exports = {
  executeQuery,
  executeTransaction,
  paginate,
  testConnection,
  pool
} 