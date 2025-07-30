const mysql = require('mysql2/promise')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')

async function initDatabase() {
  try {
    // 读取SQL文件
    const sqlPath = path.join(__dirname, '../../数据库建表语句.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    
    // 连接数据库（不指定数据库名）
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: false // 禁用多语句执行
    })

    console.log('正在创建数据库和表...')
    
    // 分割SQL语句
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    // 逐条执行SQL语句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        try {
          await connection.execute(statement)
          console.log(`执行SQL语句 ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`)
        } catch (error) {
          console.error(`执行SQL语句失败: ${statement}`)
          console.error(`错误信息: ${error.message}`)
          throw error
        }
      }
    }
    
    console.log('数据库初始化完成！')
    
    // 创建默认管理员账号
    const hashedPassword = await bcrypt.hash('admin', 10)
    await connection.execute(
      'INSERT INTO admins (username, password, nickname, role, status) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE password = ?',
      ['admin', hashedPassword, '系统管理员', 'super', 1, hashedPassword]
    )
    
    console.log('默认管理员账号创建完成！')
    console.log('用户名: admin')
    console.log('密码: admin')
    
    await connection.end()
    
  } catch (error) {
    console.error('数据库初始化失败:', error)
    process.exit(1)
  }
}

// 加载环境变量
require('dotenv').config({ path: path.join(__dirname, '../.env') })

// 执行初始化
initDatabase()