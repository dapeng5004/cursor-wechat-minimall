# 商城小程序后端API接口文档

> 所有接口均为RESTful风格，数据格式为JSON，所有返回均包含code、message字段。

## 通用响应格式
```json
{
  "code": 200,
  "message": "操作成功",
  "data": { ... }
}
```

---

## 用户相关

### 1. 用户登录
- **接口地址**：`POST /api/user/login`
- **请求参数**：
  | 参数名 | 类型   | 必填 | 说明         |
  | ------ | ------ | ---- | ------------ |
  | code   | string | 是   | 微信登录凭证 |
- **返回示例**：
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "jwt-token",
    "user": {
      "id": 1,
      "nickname": "微信用户",
      "avatar": "头像URL",
      "phone": ""
    }
  }
}
```

### 2. 获取用户信息
- **接口地址**：`GET /api/user/info`
- **认证**：需要用户JWT
- **返回示例**：
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "nickname": "微信用户",
    "avatar": "头像URL",
    "phone": "",
    "gender": 0,
    "status": 1
  }
}
```

### 3. 更新用户信息
- **接口地址**：`PUT /api/user/info`
- **认证**：需要用户JWT
- **请求参数**：
  | 参数名    | 类型   | 必填 | 说明         |
  | --------- | ------ | ---- | ------------ |
  | nickname  | string | 否   | 昵称         |
  | avatar    | string | 否   | 头像URL      |
  | phone     | string | 否   | 手机号       |
  | gender    | int    | 否   | 性别(0/1/2)  |
- **返回示例**：
```json
{
  "code": 200,
  "message": "更新成功"
}
```

### 4. 用户退出
- **接口地址**：`POST /api/user/logout`
- **认证**：需要用户JWT
- **返回示例**：
```json
{
  "code": 200,
  "message": "退出成功"
}
```

---

## 商品相关

### 1. 获取商品列表
- **接口地址**：`GET /api/goods/list`
- **请求参数**（Query）：
  | 参数名      | 类型   | 必填 | 说明         |
  | ----------- | ------ | ---- | ------------ |
  | page        | int    | 否   | 页码，默认1  |
  | pageSize    | int    | 否   | 每页数量，默认10 |
  | category_id | int    | 否   | 分类ID       |
  | keyword     | string | 否   | 搜索关键词   |
- **返回示例**：
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "商品名",
        "image": "/uploads/goods/xxx.jpg",
        "price": "99.99",
        "stock": 100,
        "category_id": 1,
        "category_name": "分类名",
        ...
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "totalPages": 10
  }
}
```

### 2. 获取商品详情
- **接口地址**：`GET /api/goods/detail/:id`
- **请求参数**：路径参数id
- **返回示例**：
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "name": "商品名",
    "image": "/uploads/goods/xxx.jpg",
    "price": "99.99",
    "stock": 100,
    "category_id": 1,
    "category_name": "分类名",
    "detail": "<p>富文本</p>",
    ...
  }
}
```

### 3. 获取推荐商品
- **接口地址**：`GET /api/goods/recommend`
- **请求参数**：limit（可选）
- **返回**：同商品列表

### 4. 获取热销商品
- **接口地址**：`GET /api/goods/hot`
- **请求参数**：limit（可选）
- **返回**：同商品列表

### 5. 搜索商品
- **接口地址**：`GET /api/goods/search`
- **请求参数**：keyword, page, pageSize, category_id
- **返回**：同商品列表

---

## 分类相关

### 1. 获取分类列表
- **接口地址**：`GET /api/category/list`
- **返回示例**：
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    { "id": 1, "name": "分类名", "image": "/uploads/category/xxx.jpg", ... }
  ]
}
```

### 2. 获取分类详情
- **接口地址**：`GET /api/category/detail/:id`
- **请求参数**：路径参数id
- **返回**：同上

### 3. 获取分类下商品
- **接口地址**：`GET /api/category/goods/:id`
- **请求参数**：路径参数id, page, pageSize
- **返回**：同商品列表

### 4. 获取首页分类及商品
- **接口地址**：`GET /api/category/home`
- **请求参数**：limit（每个分类下商品数量，默认3）
- **返回示例**：
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "id": 1,
      "name": "分类名",
      "goods": [ ... ]
    }
  ]
}
```

---

## 轮播图相关

### 1. 获取轮播图列表
- **接口地址**：`GET /api/banner/list`
- **返回示例**：
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    { "id": 1, "title": "标题", "image": "/uploads/banner/xxx.jpg", ... }
  ]
}
```

### 2. 获取轮播图详情
- **接口地址**：`GET /api/banner/detail/:id`
- **请求参数**：路径参数id
- **返回**：同上

---

## 购物车相关

> 购物车接口均需用户JWT认证

### 1. 获取购物车列表
- **接口地址**：`GET /api/cart/list`
- **返回**：商品列表

### 2. 添加商品到购物车
- **接口地址**：`POST /api/cart/add`
- **请求参数**：goods_id, quantity
- **返回**：操作结果

### 3. 更新购物车商品数量
- **接口地址**：`PUT /api/cart/update/:id`
- **请求参数**：quantity
- **返回**：操作结果

### 4. 删除购物车商品
- **接口地址**：`DELETE /api/cart/delete/:id`
- **返回**：操作结果

### 5. 清空购物车
- **接口地址**：`DELETE /api/cart/clear`
- **返回**：操作结果

---

## 地址相关

> 地址接口均需用户JWT认证

### 1. 获取地址列表
- **接口地址**：`GET /api/address/list`
- **返回**：地址列表

### 2. 添加收货地址
- **接口地址**：`POST /api/address/add`
- **请求参数**：name, phone, province, city, district, detail, is_default
- **返回**：操作结果

### 3. 更新收货地址
- **接口地址**：`PUT /api/address/update/:id`
- **请求参数**：同上
- **返回**：操作结果

### 4. 删除收货地址
- **接口地址**：`DELETE /api/address/delete/:id`
- **返回**：操作结果

### 5. 设置默认地址
- **接口地址**：`PUT /api/address/setDefault/:id`
- **返回**：操作结果

### 6. 获取默认地址
- **接口地址**：`GET /api/address/default`
- **返回**：单个地址

---

## 订单相关

> 订单接口均需用户JWT认证

### 1. 创建订单
- **接口地址**：`POST /api/order/create`
- **请求参数**：address_id, goods_list[{goods_id, quantity}], remark
- **返回**：订单信息

### 2. 获取订单列表
- **接口地址**：`GET /api/order/list`
- **请求参数**：page, pageSize, status
- **返回**：订单列表

### 3. 获取订单详情
- **接口地址**：`GET /api/order/detail/:id`
- **返回**：订单详情

### 4. 发起支付
- **接口地址**：`POST /api/order/pay`
- **请求参数**：order_id
- **返回**：微信支付参数

### 5. 确认收货
- **接口地址**：`PUT /api/order/confirm/:id`
- **返回**：操作结果

### 6. 取消订单
- **接口地址**：`PUT /api/order/cancel/:id`
- **返回**：操作结果

---

## 管理员相关

### 1. 管理员登录
- **接口地址**：`POST /admin/login`
- **请求参数**：username, password
- **返回**：token, 管理员信息

### 2. 获取管理员信息
- **接口地址**：`GET /admin/info`
- **认证**：需要管理员JWT
- **返回**：管理员信息

### 3. 管理员退出
- **接口地址**：`POST /admin/logout`
- **认证**：需要管理员JWT
- **返回**：操作结果

---

> 如需补充更多接口细节或返回示例，请随时告知。