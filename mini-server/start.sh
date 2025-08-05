#!/bin/bash

# 商城微信小程序后端API服务启动脚本

echo "正在启动 Mini-Server..."

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "错误: 未找到Node.js，请先安装Node.js"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "错误: 未找到npm，请先安装npm"
    exit 1
fi

# 检查.env文件是否存在
if [ ! -f .env ]; then
    echo "警告: 未找到.env文件，正在复制示例文件..."
    cp env.example .env
    echo "请编辑.env文件配置环境变量"
fi

# 安装依赖
echo "正在安装依赖..."
npm install

# 检查数据库连接
echo "正在检查数据库连接..."
node -e "
const { testConnection } = require('./src/config/database');
testConnection().then(() => {
    console.log('数据库连接成功');
    process.exit(0);
}).catch(err => {
    console.error('数据库连接失败:', err.message);
    process.exit(1);
});
"

if [ $? -ne 0 ]; then
    echo "错误: 数据库连接失败，请检查配置"
    exit 1
fi

# 启动服务
echo "正在启动服务..."
if [ "$NODE_ENV" = "production" ]; then
    npm start
else
    npm run dev
fi 