# 商城后台管理系统API服务

## 项目简介
基于 Node.js + Express + MySQL 开发的商城后台管理系统API服务

## 技术栈
- Node.js 16+
- Express 4.18.2
- MySQL 8.0+
- JWT 身份认证
- Multer 文件上传

## 环境要求
- Node.js >= 16.0.0
- MySQL >= 8.0.0
- npm >= 8.0.0

## 安装和运行

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
复制 `.env.example` 为 `.env`，并修改数据库配置：
```bash
cp .env.example .env
```

### 3. 创建数据库
执行 `数据库建表语句.sql` 创建数据库和表结构

### 4. 启动服务
```bash
# 开发环境
npm run dev

# 生产环境
npm start
```

## API接口文档

### 管理员相关
- POST `/admin/login` - 管理员登录
- GET `/admin/info` - 获取管理员信息
- POST `/admin/logout` - 管理员退出

### 轮播图管理
- GET `/admin/banner/list` - 获取轮播图列表
- POST `/admin/banner/add` - 新增轮播图
- POST `/admin/banner/update` - 编辑轮播图
- POST `/admin/banner/delete` - 删除轮播图
- POST `/admin/banner/status` - 修改轮播图状态
- POST `/admin/banner/sort` - 修改轮播图排序

### 商品分类管理
- GET `/admin/category/list` - 获取分类列表
- POST `/admin/category/add` - 新增分类
- POST `/admin/category/update` - 编辑分类
- POST `/admin/category/delete` - 删除分类
- POST `/admin/category/status` - 修改分类状态
- POST `/admin/category/sort` - 修改分类排序

### 商品管理
- GET `/admin/goods/list` - 获取商品列表
- GET `/admin/goods/detail/:id` - 获取商品详情
- POST `/admin/goods/add` - 新增商品
- POST `/admin/goods/update` - 编辑商品
- POST `/admin/goods/delete` - 删除商品
- POST `/admin/goods/status` - 商品上下架
- POST `/admin/goods/batch-status` - 批量上下架

### 订单管理
- GET `/admin/order/list` - 获取订单列表
- GET `/admin/order/detail/:id` - 获取订单详情
- POST `/admin/order/ship` - 订单发货
- POST `/admin/order/status` - 修改订单状态

### 数据统计
- GET `/admin/stats/sales` - 获取销售统计
- GET `/admin/stats/sales-trend` - 获取销售趋势
- GET `/admin/stats/hot-goods` - 获取热销商品
- GET `/admin/stats/orders` - 获取订单统计
- GET `/admin/stats/conversion` - 获取转化率统计

### 文件上传
- POST `/admin/upload/file` - 上传单个文件
- POST `/admin/upload/image` - 上传图片
- POST `/admin/upload/images` - 批量上传图片
- POST `/admin/upload/delete` - 删除文件

## 数据库配置
确保MySQL服务已启动，并创建了对应的数据库和表结构。

## 注意事项
1. 所有需要认证的接口都需要在请求头中携带 `Authorization: Bearer <token>`
2. 文件上传大小限制为2MB
3. 支持的文件类型：JPG、PNG、GIF、WebP
4. 生产环境请修改JWT密钥和数据库密码

## 开发说明
- 使用 bcryptjs 进行密码加密
- 使用 JWT 进行身份认证
- 使用 express-validator 进行参数验证
- 使用 multer 处理文件上传 