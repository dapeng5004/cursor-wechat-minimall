#!/bin/bash

# 开发环境启动脚本

echo "================================="
echo "启动商城小程序后端服务"
echo "================================="

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "错误: Node.js 未安装"
    exit 1
fi

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo "安装依赖..."
    npm install
fi

# 停止已存在的进程
echo "停止已存在的服务..."
pkill -f "node.*app.js" 2>/dev/null || true

# 等待进程完全停止
sleep 2

# 启动服务
echo "启动开发服务器..."
NODE_ENV=development node app.js 