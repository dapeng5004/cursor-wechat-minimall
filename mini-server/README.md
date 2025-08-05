# Mini-Server 商城微信小程序后端API服务

## 项目概述

这是商城微信小程序的后端API服务，基于Node.js + Express技术栈开发，提供完整的商城功能API接口。

## 技术栈

- **运行环境**: Node.js >= 16.0.0
- **Web框架**: Express.js
- **数据库**: MySQL
- **身份认证**: JWT
- **文件上传**: Multer
- **数据验证**: express-validator
- **日志**: Winston
- **安全**: Helmet, CORS, Rate Limiting

## 项目结构

```
mini-server/
├── src/                            # 源代码目录
│   ├── controllers/                # 控制器层
│   ├── models/                     # 数据模型层
│   ├── routes/                     # 路由层
│   │   ├── api/                    # API路由
│   │   └── admin/                  # 管理后台路由
│   ├── middleware/                 # 中间件
│   ├── utils/                      # 工具函数
│   ├── config/                     # 配置文件
│   └── app.js                      # 应用入口文件
├── uploads/                        # 上传文件目录
│   ├── goods/                      # 商品图片
│   ├── banner/                     # 轮播图片
│   └── category/                   # 分类图片
├── logs/                           # 日志文件目录
├── docs/                           # 文档目录
├── package.json                    # 项目依赖配置
├── env.example                     # 环境变量示例
├── .gitignore                      # Git忽略文件
└── README.md                       # 项目说明文档
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp env.example .env
# 编辑.env文件，配置数据库连接等信息
```

### 3. 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

### 4. 访问API

- 服务地址: http://localhost:3002
- API文档: http://localhost:3002/docs

## 环境变量配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| PORT | 服务器端口 | 3002 |
| NODE_ENV | 运行环境 | development |
| DB_HOST | 数据库主机 | localhost |
| DB_PORT | 数据库端口 | 3306 |
| DB_USER | 数据库用户名 | root |
| DB_PASSWORD | 数据库密码 | 123456 |
| DB_NAME | 数据库名称 | mall_mini |
| JWT_SECRET | JWT密钥 | your_jwt_secret_key_here |
| WECHAT_APPID | 微信小程序AppID | - |
| WECHAT_SECRET | 微信小程序Secret | - |

## API接口

### 用户相关API
- `POST /api/user/login` - 用户登录
- `POST /api/user/logout` - 用户退出
- `GET /api/user/info` - 获取用户信息

### 首页相关API
- `GET /api/banner/list` - 获取轮播图列表
- `GET /api/goods/recommend` - 获取推荐商品列表
- `GET /api/category/home` - 获取首页分类及商品列表

### 分类相关API
- `GET /api/category/list` - 获取分类列表
- `GET /api/category/goods` - 获取分类商品列表

### 商品相关API
- `GET /api/goods/detail` - 获取商品详情
- `GET /api/goods/list` - 获取商品列表

### 购物车相关API
- `POST /api/cart/add` - 添加商品到购物车
- `GET /api/cart/list` - 获取购物车列表
- `PUT /api/cart/update` - 更新购物车商品数量
- `DELETE /api/cart/delete` - 删除购物车商品

### 地址相关API
- `GET /api/address/list` - 获取地址列表
- `POST /api/address/add` - 添加收货地址
- `PUT /api/address/update` - 编辑收货地址
- `DELETE /api/address/delete` - 删除收货地址
- `PUT /api/address/setDefault` - 设置默认地址

### 订单相关API
- `POST /api/order/create` - 创建订单
- `GET /api/order/list` - 获取订单列表
- `POST /api/order/pay` - 发起支付
- `POST /api/order/confirm` - 确认收货

## 开发说明

### 数据库初始化
```bash
# 创建数据库
mysql -u root -p
CREATE DATABASE mall_mini CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 导入数据库结构
mysql -u root -p mall_mini < docs/database.sql
```

### 日志文件
- `logs/error.log` - 错误日志
- `logs/access.log` - 访问日志
- `logs/app.log` - 应用日志

### 文件上传
- 支持的文件类型: jpg, png, gif, webp
- 最大文件大小: 5MB
- 上传目录: uploads/

## 部署说明

### 生产环境部署
1. 设置环境变量 `NODE_ENV=production`
2. 配置数据库连接
3. 配置微信小程序参数
4. 启动服务: `npm start`

### Docker部署
```bash
# 构建镜像
docker build -t mini-server .

# 运行容器
docker run -d -p 3002:3002 --name mini-server mini-server
```

## 许可证

MIT License 