const mysql = require('mysql2/promise')

const config = {
  host: 'localhost',
  user: 'root',
  password: 'zsp123456',
  database: 'mall',
  charset: 'utf8mb4'
}

async function addLogisticsFields() {
  let connection
  
  try {
    // 创建数据库连接
    connection = await mysql.createConnection(config)
    
    console.log('正在为orders表添加物流字段...')
    
    // 添加物流字段
    await connection.execute(`
      ALTER TABLE orders 
      ADD COLUMN express_company varchar(50) DEFAULT NULL COMMENT '快递公司' AFTER ship_time,
      ADD COLUMN express_no varchar(100) DEFAULT NULL COMMENT '快递单号' AFTER express_company
    `)
    
    // 添加索引
    await connection.execute(`
      ALTER TABLE orders 
      ADD INDEX idx_express_no (express_no)
    `)
    
    console.log('✅ 物流字段添加成功！')
    
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('⚠️  字段已存在，跳过添加')
    } else {
      console.error('❌ 添加物流字段失败:', error.message)
    }
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// 执行脚本
addLogisticsFields() 