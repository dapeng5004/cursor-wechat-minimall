# 商城小程序后端API服务

一个基于 Node.js + Express + MySQL 的商城小程序后端API服务，提供完整的电商功能。

## 功能特性

- 🔐 用户认证（微信小程序登录）
- 📦 商品管理（分类、商品、轮播图）
- 🛒 购物车功能
- 📍 收货地址管理
- 📋 订单管理
- 👨‍💼 管理员后台
- 🔒 JWT 身份验证
- 📝 完整的日志记录
- 🛡️ 安全防护（CORS、限流、验证）

## 技术栈

- **后端框架**: Express.js
- **数据库**: MySQL
- **身份验证**: JWT
- **密码加密**: bcryptjs
- **数据验证**: express-validator
- **日志记录**: winston
- **安全防护**: helmet, express-rate-limit
- **文件上传**: multer

## 项目结构

```
mini-server/
├── config/                 # 配置文件
│   ├── index.js           # 配置入口
│   ├── config.base.js     # 基础配置
│   └── config.development.js # 开发环境配置
├── src/
│   ├── controllers/       # 控制器层
│   ├── models/           # 数据模型层
│   ├── routes/           # 路由层
│   ├── middleware/       # 中间件
│   ├── utils/            # 工具函数
│   └── config/           # 应用配置
├── database/             # 数据库相关
│   └── init.sql         # 数据库初始化脚本
├── uploads/              # 文件上传目录
├── logs/                 # 日志文件目录
├── app.js               # 应用入口文件
├── package.json         # 项目依赖
└── README.md           # 项目说明
```

## 快速开始

### 1. 环境要求

- Node.js >= 14.0.0
- MySQL >= 5.7
- npm 或 yarn

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制环境变量文件：

```bash
# 开发环境
cp .env.development.example .env.development

# 生产环境
cp .env.production.example .env.production
```

编辑环境变量文件，配置数据库连接等信息：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=your_password
DB_NAME=mall-mall

# JWT配置
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# 微信小程序配置
WECHAT_APPID=your_appid
WECHAT_SECRET=your_secret

# 服务器配置
PORT=3002
NODE_ENV=development
```

### 4. 初始化数据库

```bash
# 登录MySQL
mysql -u root -p

# 执行初始化脚本
source database/init.sql
```

### 5. 启动服务

```bash
# 开发环境
npm run dev

# 生产环境
npm run pro
```

## API 接口文档

### 基础信息

- **基础URL**: `http://localhost:3002`
- **API前缀**: `/api`
- **响应格式**: JSON

### 通用响应格式

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {}
}
```

### 接口列表

#### 用户相关

- `POST /api/user/login` - 用户登录
- `GET /api/user/info` - 获取用户信息
- `PUT /api/user/info` - 更新用户信息
- `POST /api/user/logout` - 用户退出

#### 商品相关

- `GET /api/goods` - 获取商品列表
- `GET /api/goods/:id` - 获取商品详情
- `GET /api/goods/recommend` - 获取推荐商品
- `GET /api/goods/hot` - 获取热门商品
- `GET /api/goods/search` - 搜索商品

#### 分类相关

- `GET /api/category` - 获取分类列表
- `GET /api/category/:id` - 获取分类详情
- `GET /api/category/:id/goods` - 获取分类下的商品
- `GET /api/category/home` - 获取首页分类
- `GET /api/category/tree` - 获取分类树

#### 轮播图相关

- `GET /api/banner` - 获取轮播图列表
- `GET /api/banner/:id` - 获取轮播图详情
- `GET /api/banner/positions` - 获取轮播图位置

#### 购物车相关

- `GET /api/cart` - 获取购物车列表
- `POST /api/cart` - 添加商品到购物车
- `PUT /api/cart/:id` - 更新购物车商品数量
- `DELETE /api/cart/:id` - 删除购物车商品
- `DELETE /api/cart/batch` - 批量删除购物车商品

#### 地址相关

- `GET /api/address` - 获取地址列表
- `POST /api/address` - 添加地址
- `PUT /api/address/:id` - 更新地址
- `DELETE /api/address/:id` - 删除地址
- `PUT /api/address/:id/default` - 设置默认地址

#### 订单相关

- `GET /api/order` - 获取订单列表
- `POST /api/order` - 创建订单
- `GET /api/order/:id` - 获取订单详情
- `PUT /api/order/:id/cancel` - 取消订单
- `PUT /api/order/:id/confirm` - 确认收货

#### 管理后台

- `POST /admin/login` - 管理员登录
- `GET /admin/dashboard` - 获取仪表板数据
- `GET /admin/goods` - 获取商品管理列表
- `POST /admin/goods` - 创建商品
- `PUT /admin/goods/:id` - 更新商品
- `DELETE /admin/goods/:id` - 删除商品

### 认证说明

大部分接口需要JWT认证，在请求头中添加：

```
Authorization: Bearer <token>
```

## 开发指南

### 添加新的API接口

1. 在 `src/models/` 中添加数据模型
2. 在 `src/controllers/` 中添加控制器
3. 在 `src/routes/` 中添加路由
4. 在 `app.js` 中注册路由

### 数据库操作

使用 `src/utils/database.js` 中的工具函数：

```javascript
const { executeQuery, executeTransaction, paginate } = require('../utils/database')

// 执行查询
const users = await executeQuery('SELECT * FROM users WHERE id = ?', [userId])

// 执行事务
const results = await executeTransaction([
  { sql: 'INSERT INTO users (name) VALUES (?)', params: ['John'] },
  { sql: 'UPDATE users SET status = 1 WHERE id = LAST_INSERT_ID()' }
])

// 分页查询
const result = await paginate('SELECT * FROM users', [], page, pageSize)
```

### 日志记录

```javascript
const log = require('../utils/logger')

log.info('操作成功', { userId, action: 'login' })
log.error('操作失败', { error: error.message })
```

## 部署说明

### 生产环境部署

1. 设置环境变量 `NODE_ENV=production`
2. 配置生产环境数据库
3. 使用 PM2 或 Docker 部署
4. 配置反向代理（Nginx）

### Docker 部署

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3002
CMD ["npm", "start"]
```

## 常见问题

### Q: 如何修改数据库连接配置？

A: 编辑 `.env.development` 或 `.env.production` 文件中的数据库配置。

### Q: 如何添加新的商品分类？

A: 直接操作数据库或在管理后台添加分类。

### Q: 如何自定义JWT过期时间？

A: 在环境变量中设置 `JWT_EXPIRES_IN`，例如：`7d`、`24h`、`60m`。

### Q: 如何修改文件上传大小限制？

A: 在环境变量中设置 `MAX_FILE_SIZE`，单位为字节。

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交 Issue 或联系开发者。 