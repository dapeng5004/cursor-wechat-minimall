#!/bin/bash

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

# 安装依赖
echo "正在安装依赖..."
npm install

# 检查.env文件是否存在
if [ ! -f .env ]; then
    echo "警告: 未找到.env文件，将使用默认配置"
    echo "请根据实际情况修改.env文件中的数据库配置"
fi

# 启动服务器
echo "正在启动服务器..."
npm run dev 