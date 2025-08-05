# 商城微信小程序项目

## 项目概述

本项目是一个完整的电商系统，包含三个子项目：
- 微信小程序前端（用户购物界面）
- 后台管理系统（商家管理界面）
- 后端API服务（数据接口服务）

## 项目结构

```
cursor-wechat/
├── mall-admin/          # 后台管理系统（Vue3 + Element Plus）
├── mall-server/         # 后台管理系统后端API（Node.js + Express）
├── mini-server/         # 小程序后端API服务（Node.js + Express）
├── mini-shop/           # 微信小程序前端（待开发）
└── 案例-商城微信小程序/  # 项目需求文档
```

## 技术栈

### 后台管理系统
- 前端：Vue3 + Element Plus + Vite
- 后端：Node.js + Express + MySQL
- 数据库：MySQL

### 小程序后端API服务
- 后端：Node.js + Express + MySQL
- 数据库：MySQL
- 认证：JWT
- 支付：微信支付
- 文件上传：Multer

## 快速开始

### 1. 后台管理系统

```bash
# 启动后台管理系统前端
cd mall-admin
npm install
npm run dev

# 启动后台管理系统后端
cd mall-server
npm install
npm start
```

### 2. 小程序后端API服务

```bash
# 启动小程序后端API服务
cd mini-server
npm install
npm start
```

### 3. 数据库

确保MySQL服务运行，并执行数据库建表语句：

```bash
mysql -u root -p < 数据库建表语句.sql
```

## API接口

### 后台管理系统API（mall-server）

- 端口：3001
- 基础路径：http://localhost:3001

### 小程序API（mini-server）

- 端口：3002
- 基础路径：http://localhost:3002

#### 主要接口

**用户相关**
- POST /api/user/login - 用户登录
- GET /api/user/info - 获取用户信息
- PUT /api/user/info - 更新用户信息
- POST /api/user/logout - 用户退出

**商品相关**
- GET /api/goods/list - 获取商品列表
- GET /api/goods/detail/:id - 获取商品详情
- GET /api/goods/recommend - 获取推荐商品
- GET /api/goods/hot - 获取热销商品
- GET /api/goods/search - 搜索商品

**分类相关**
- GET /api/category/list - 获取分类列表
- GET /api/category/detail/:id - 获取分类详情
- GET /api/category/goods/:id - 获取分类商品
- GET /api/category/home - 获取首页分类

**轮播图相关**
- GET /api/banner/list - 获取轮播图列表
- GET /api/banner/detail/:id - 获取轮播图详情

**购物车相关**
- GET /api/cart/list - 获取购物车列表
- POST /api/cart/add - 添加商品到购物车
- PUT /api/cart/update/:id - 更新购物车商品数量
- DELETE /api/cart/delete/:id - 删除购物车商品
- DELETE /api/cart/clear - 清空购物车

**地址相关**
- GET /api/address/list - 获取地址列表
- POST /api/address/add - 添加收货地址
- PUT /api/address/update/:id - 更新收货地址
- DELETE /api/address/delete/:id - 删除收货地址
- PUT /api/address/setDefault/:id - 设置默认地址
- GET /api/address/default - 获取默认地址

**订单相关**
- POST /api/order/create - 创建订单
- GET /api/order/list - 获取订单列表
- GET /api/order/detail/:id - 获取订单详情
- POST /api/order/pay - 发起支付
- PUT /api/order/confirm/:id - 确认收货
- PUT /api/order/cancel/:id - 取消订单

**管理员相关**
- POST /admin/login - 管理员登录
- GET /admin/info - 获取管理员信息
- POST /admin/logout - 管理员退出

## 环境配置

### 数据库配置

确保MySQL服务运行，并创建数据库：

```sql
CREATE DATABASE mall CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 环境变量

复制环境变量示例文件并配置：

```bash
# mall-server
cp mall-server/env.example mall-server/.env

# mini-server
cp mini-server/env.example mini-server/.env
```

## 开发说明

### 代码规范

- 使用中文注释
- 变量和函数名使用驼峰命名法
- 常量使用大写字母和下划线
- 代码缩进使用2个空格

### 安全要求

- 所有用户输入必须进行验证和过滤
- 敏感信息不能硬编码在代码中
- 使用HTTPS协议进行数据传输
- 实现适当的身份认证和授权机制

### 性能要求

- 图片资源需要压缩优化
- 合理使用缓存机制
- 避免不必要的网络请求
- 优化数据库查询性能

## 部署说明

### 生产环境部署

1. 配置生产环境变量
2. 使用PM2管理Node.js进程
3. 配置Nginx反向代理
4. 配置SSL证书
5. 设置数据库备份

### 监控和日志

- 使用Winston进行日志记录
- 配置错误监控
- 设置性能监控
- 配置告警机制

## 常见问题

### 1. 数据库连接失败

检查数据库配置：
- 确保MySQL服务运行
- 检查用户名和密码
- 确认数据库名称正确

### 2. 端口冲突

如果端口被占用，可以修改环境变量中的PORT配置。

### 3. 文件上传失败

检查上传目录权限：
```bash
chmod 755 uploads/
```

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

MIT License

---

## 会话总结 - 2025-08-05 14:42

### 主要工作内容
根据需求文档完成了mini-server项目的完整后端API服务开发，包括用户、商品、分类、轮播图、购物车、地址、订单等所有核心功能的API接口实现。

### 文件变更记录
- 新增文件：mini-server/src/controllers/userController.js - 用户控制器
- 新增文件：mini-server/src/controllers/goodsController.js - 商品控制器
- 新增文件：mini-server/src/controllers/categoryController.js - 分类控制器
- 新增文件：mini-server/src/controllers/bannerController.js - 轮播图控制器
- 新增文件：mini-server/src/controllers/cartController.js - 购物车控制器
- 新增文件：mini-server/src/controllers/addressController.js - 地址控制器
- 新增文件：mini-server/src/controllers/orderController.js - 订单控制器
- 新增文件：mini-server/src/controllers/adminController.js - 管理员控制器
- 新增文件：mini-server/src/routes/api/userRoutes.js - 用户API路由
- 新增文件：mini-server/src/routes/api/goodsRoutes.js - 商品API路由
- 新增文件：mini-server/src/routes/api/categoryRoutes.js - 分类API路由
- 新增文件：mini-server/src/routes/api/bannerRoutes.js - 轮播图API路由
- 新增文件：mini-server/src/routes/api/cartRoutes.js - 购物车API路由
- 新增文件：mini-server/src/routes/api/addressRoutes.js - 地址API路由
- 新增文件：mini-server/src/routes/api/orderRoutes.js - 订单API路由
- 新增文件：mini-server/src/routes/admin/adminRoutes.js - 管理员路由
- 修改文件：mini-server/src/app.js - 更新主应用文件，注册所有路由
- 修改文件：mini-server/src/utils/database.js - 更新数据库工具函数，添加分页功能
- 修改文件：mini-server/package.json - 添加axios依赖
- 修改文件：mini-server/env.example - 更新环境变量示例
- 修改文件：mini-server/src/config/database.js - 修复数据库配置
- 修改文件：README.md - 更新项目文档

### 技术要点
1. **完整的API接口实现**：按照需求文档实现了所有必要的API接口，包括用户登录、商品管理、购物车、订单等核心功能
2. **数据库连接优化**：修复了MySQL连接配置问题，移除了不支持的连接选项
3. **安全机制实现**：实现了JWT身份认证、数据验证、错误处理等安全机制
4. **分页查询功能**：实现了通用的分页查询功能，支持商品列表、订单列表等分页需求
5. **事务处理**：在订单创建等关键操作中使用数据库事务确保数据一致性
6. **环境配置管理**：完善了环境变量配置，支持开发和生产环境切换

### 注意事项
1. **数据库配置**：需要正确配置MySQL数据库连接信息，包括用户名、密码、数据库名等
2. **端口配置**：mini-server使用3002端口，避免与mall-server的3001端口冲突
3. **依赖管理**：添加了axios依赖用于微信API调用，需要重新安装依赖
4. **环境变量**：需要正确配置.env文件中的数据库连接信息
5. **文件权限**：确保uploads目录有正确的读写权限

### 下一步建议
1. **微信小程序前端开发**：基于mini-server的API接口开发微信小程序前端
2. **支付功能完善**：完善微信支付相关功能，包括支付回调处理
3. **文件上传功能**：实现完整的文件上传功能，支持商品图片、轮播图等上传
4. **缓存机制**：添加Redis缓存机制，提升API响应速度
5. **监控和日志**：完善日志记录和性能监控功能
6. **单元测试**：为关键功能添加单元测试
7. **API文档**：生成完整的API文档，便于前端开发使用

---

## API文档索引

- [mini-server API接口文档（docs/api.md）](mini-server/docs/api.md) 