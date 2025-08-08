-- Active: 1753776220943@@127.0.0.1@3306@mall
-- Active: 1753776220943@@127.0.0.1@3306
-- 商城微信小程序数据库建表语句
-- 数据库名：mall
-- 字符集：utf8mb4（支持emoji表情）

-- 创建数据库
CREATE DATABASE IF NOT EXISTS `mall` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE `mall`;

-- 1. 用户表
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `openid` varchar(100) NOT NULL COMMENT '微信openid',
  `nickname` varchar(50) DEFAULT NULL COMMENT '用户昵称',
  `avatar` varchar(255) DEFAULT NULL COMMENT '用户头像',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号码',
  `gender` tinyint(1) DEFAULT 0 COMMENT '性别：0未知，1男，2女',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态：0禁用，1启用',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_openid` (`openid`),
  KEY `idx_phone` (`phone`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 2. 商品分类表
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `name` varchar(50) NOT NULL COMMENT '分类名称',
  `image` varchar(255) DEFAULT NULL COMMENT '分类图片',
  `sort` int(11) DEFAULT 0 COMMENT '排序（数字越小越靠前）',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态：0禁用，1启用',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_sort` (`sort`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品分类表';

-- 3. 商品表
CREATE TABLE `goods` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '商品ID',
  `name` varchar(100) NOT NULL COMMENT '商品名称',
  `image` varchar(255) DEFAULT NULL COMMENT '商品主图',
  `images` text DEFAULT NULL COMMENT '商品图片列表（JSON格式）',
  `price` decimal(10,2) NOT NULL COMMENT '商品价格',
  `original_price` decimal(10,2) DEFAULT NULL COMMENT '原价',
  `stock` int(11) DEFAULT 0 COMMENT '库存数量',
  `category_id` int(11) NOT NULL COMMENT '分类ID',
  `description` text DEFAULT NULL COMMENT '商品描述',
  `detail` longtext DEFAULT NULL COMMENT '商品详情（富文本）',
  `sales` int(11) DEFAULT 0 COMMENT '销量',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态：0下架，1上架',
  `is_recommend` tinyint(1) DEFAULT 0 COMMENT '是否推荐：0否，1是',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_status` (`status`),
  KEY `idx_is_recommend` (`is_recommend`),
  KEY `idx_price` (`price`),
  FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';

-- 4. 购物车表
CREATE TABLE `cart` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '购物车ID',
  `user_id` int(11) NOT NULL COMMENT '用户ID',
  `goods_id` int(11) NOT NULL COMMENT '商品ID',
  `quantity` int(11) NOT NULL DEFAULT 1 COMMENT '商品数量',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_goods` (`user_id`, `goods_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_goods_id` (`goods_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`goods_id`) REFERENCES `goods` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='购物车表';

-- 5. 收货地址表
CREATE TABLE `addresses` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '地址ID',
  `user_id` int(11) NOT NULL COMMENT '用户ID',
  `name` varchar(50) NOT NULL COMMENT '收货人姓名',
  `phone` varchar(20) NOT NULL COMMENT '联系电话',
  `province` varchar(50) NOT NULL COMMENT '省份',
  `city` varchar(50) NOT NULL COMMENT '城市',
  `district` varchar(50) NOT NULL COMMENT '区县',
  `detail` varchar(255) NOT NULL COMMENT '详细地址',
  `is_default` tinyint(1) DEFAULT 0 COMMENT '是否默认地址：0否，1是',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_is_default` (`is_default`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收货地址表';

-- 6. 订单表
CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  `order_no` varchar(50) NOT NULL COMMENT '订单号',
  `user_id` int(11) NOT NULL COMMENT '用户ID',
  `address_id` int(11) NOT NULL COMMENT '收货地址ID',
  `total_amount` decimal(10,2) NOT NULL COMMENT '订单总金额',
  `status` tinyint(1) DEFAULT 0 COMMENT '订单状态：0待支付，1已支付，2已发货，3已完成，4已取消',
  `payment_method` varchar(20) DEFAULT NULL COMMENT '支付方式',
  `payment_time` timestamp NULL DEFAULT NULL COMMENT '支付时间',
  `ship_time` timestamp NULL DEFAULT NULL COMMENT '发货时间',
  `complete_time` timestamp NULL DEFAULT NULL COMMENT '完成时间',
  `remark` varchar(255) DEFAULT NULL COMMENT '订单备注',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`address_id`) REFERENCES `addresses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- 7. 订单商品表
CREATE TABLE `order_goods` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '订单商品ID',
  `order_id` int(11) NOT NULL COMMENT '订单ID',
  `goods_id` int(11) NOT NULL COMMENT '商品ID',
  `goods_name` varchar(100) NOT NULL COMMENT '商品名称',
  `goods_image` varchar(255) DEFAULT NULL COMMENT '商品图片',
  `price` decimal(10,2) NOT NULL COMMENT '商品单价',
  `quantity` int(11) NOT NULL COMMENT '购买数量',
  `subtotal` decimal(10,2) NOT NULL COMMENT '小计金额',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_goods_id` (`goods_id`),
  FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`goods_id`) REFERENCES `goods` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单商品表';

-- 8. 轮播图表
CREATE TABLE `banners` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '轮播图ID',
  `title` varchar(100) DEFAULT NULL COMMENT '轮播图标题',
  `image` varchar(255) NOT NULL COMMENT '轮播图片',
  `link` varchar(255) DEFAULT NULL COMMENT '跳转链接',
  `sort` int(11) DEFAULT 0 COMMENT '排序（数字越小越靠前）',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态：0禁用，1启用',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_sort` (`sort`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='轮播图表';

-- 9. 管理员表
CREATE TABLE `admins` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '管理员ID',
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `password` varchar(32) NOT NULL COMMENT '密码（MD5加密）',
  `nickname` varchar(50) DEFAULT NULL COMMENT '昵称',
  `avatar` varchar(255) DEFAULT NULL COMMENT '头像',
  `role` varchar(20) DEFAULT 'admin' COMMENT '角色：admin管理员，super超级管理员',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态：0禁用，1启用',
  `last_login_time` timestamp NULL DEFAULT NULL COMMENT '最后登录时间',
  `last_login_ip` varchar(50) DEFAULT NULL COMMENT '最后登录IP',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  KEY `idx_status` (`status`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表';

-- 10. 系统配置表
CREATE TABLE `configs` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '配置ID',
  `key` varchar(100) NOT NULL COMMENT '配置键',
  `value` text DEFAULT NULL COMMENT '配置值',
  `description` varchar(255) DEFAULT NULL COMMENT '配置描述',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表';

-- 插入初始数据

-- 插入管理员用户（用户名：admin，密码：admin，MD5加密）
INSERT INTO `admins` (`username`, `password`, `nickname`, `role`, `status`) 
VALUES ('admin', '21232f297a57a5a743894a0e4a801fc3', '系统管理员', 'super', 1);

-- 插入商品分类示例数据
INSERT INTO `categories` (`name`, `image`, `sort`, `status`) VALUES
('电子产品', '/uploads/category/electronics.jpg', 1, 1),
('服装配饰', '/uploads/category/clothing.jpg', 2, 1),
('家居用品', '/uploads/category/home.jpg', 3, 1),
('美妆护肤', '/uploads/category/beauty.jpg', 4, 1),
('运动户外', '/uploads/category/sports.jpg', 5, 1),
('数码配件', '/uploads/category/digital.jpg', 6, 1);

INSERT INTO goods (id, name, image, price, stock, status, is_recommend, category_id)
VALUES (6, '测试商品', '/uploads/test.jpg', 99.99, 100, 1, 1, 1)
ON DUPLICATE KEY UPDATE name='测试商品', image='/uploads/test.jpg', price=99.99, stock=100, status=1, is_recommend=1, category_id=1;
-- 插入轮播图示例数据
INSERT INTO `banners` (`title`, `image`, `link`, `sort`, `status`) VALUES
('新品上市', '/uploads/banner/banner1.jpg', '/pages/goods/list?category=1', 1, 1),
('限时特惠', '/uploads/banner/banner2.jpg', '/pages/goods/list?category=2', 2, 1),
('品牌推荐', '/uploads/banner/banner3.jpg', '/pages/goods/list?category=3', 3, 1);

-- 插入商品示例数据
INSERT INTO `goods` (`name`, `image`, `price`, `stock`, `category_id`, `description`, `sales`, `status`, `is_recommend`) VALUES
('iPhone 15 Pro', '/uploads/goods/iphone15.jpg', 7999.00, 50, 1, '最新款iPhone，性能强劲', 100, 1, 1),
('华为Mate 60', '/uploads/goods/mate60.jpg', 6999.00, 30, 1, '华为旗舰手机', 80, 1, 1),
('小米14', '/uploads/goods/mi14.jpg', 4999.00, 100, 1, '小米年度旗舰', 150, 1, 0),
('Nike运动鞋', '/uploads/goods/nike.jpg', 599.00, 200, 5, '舒适透气运动鞋', 300, 1, 1),
('Adidas运动服', '/uploads/goods/adidas.jpg', 299.00, 150, 5, '专业运动服装', 200, 1, 0),
('SK-II神仙水', '/uploads/goods/sk2.jpg', 1599.00, 80, 4, '明星护肤产品', 120, 1, 1);

-- 插入系统配置示例数据
INSERT INTO `configs` (`key`, `value`, `description`) VALUES
('site_name', '商城小程序', '网站名称'),
('site_description', '专业的微信小程序商城', '网站描述'),
('contact_phone', '400-123-4567', '客服电话'),
('contact_email', 'service@mall.com', '客服邮箱'),
('delivery_fee', '10', '配送费用'),
('min_order_amount', '99', '最低订单金额');

-- 创建索引优化查询性能
CREATE INDEX `idx_goods_category_status` ON `goods` (`category_id`, `status`);
CREATE INDEX `idx_orders_user_status` ON `orders` (`user_id`, `status`);
CREATE INDEX `idx_cart_user_created` ON `cart` (`user_id`, `created_at`);
CREATE INDEX `idx_addresses_user_default` ON `addresses` (`user_id`, `is_default`);

-- 添加表注释
ALTER TABLE `users` COMMENT = '用户表 - 存储小程序用户信息';
ALTER TABLE `categories` COMMENT = '商品分类表 - 存储商品分类信息';
ALTER TABLE `goods` COMMENT = '商品表 - 存储商品详细信息';
ALTER TABLE `cart` COMMENT = '购物车表 - 存储用户购物车数据';
ALTER TABLE `addresses` COMMENT = '收货地址表 - 存储用户收货地址';
ALTER TABLE `orders` COMMENT = '订单表 - 存储订单基本信息';
ALTER TABLE `order_goods` COMMENT = '订单商品表 - 存储订单商品明细';
ALTER TABLE `banners` COMMENT = '轮播图表 - 存储首页轮播图';
ALTER TABLE `admins` COMMENT = '管理员表 - 存储后台管理员信息';
ALTER TABLE `configs` COMMENT = '系统配置表 - 存储系统配置信息'; 


--测试首页推荐商品列表
SELECT * FROM goods WHERE category_id IN (2,4,5,6,7,8) AND status=1;

INSERT INTO goods (name, price, category_id, status) VALUES
('测试商品A', 99.99, 2, 1),
('测试商品B', 199.99, 4, 1),
('测试商品C', 299.99, 5, 1);

-- 假设分类ID为2,4,5,6,7,8
INSERT INTO goods (name, price, stock, image, category_id, status)
VALUES
('服装A', 99.99, 100, '/uploads/test1.jpg', 2, 1),
('服装B', 129.99, 80, '/uploads/test2.jpg', 2, 1),
('服装C', 159.99, 60, '/uploads/test3.jpg', 2, 1),

('美妆A', 59.99, 120, '/uploads/test4.jpg', 4, 1),
('美妆B', 89.99, 90, '/uploads/test5.jpg', 4, 1),
('美妆C', 109.99, 70, '/uploads/test6.jpg', 4, 1),

('运动A', 199.99, 50, '/uploads/test7.jpg', 5, 1),
('运动B', 249.99, 40, '/uploads/test8.jpg', 5, 1),
('运动C', 299.99, 30, '/uploads/test9.jpg', 5, 1),

('数码A', 399.99, 60, '/uploads/test10.jpg', 6, 1),
('数码B', 499.99, 40, '/uploads/test11.jpg', 6, 1),
('数码C', 599.99, 20, '/uploads/test12.jpg', 6, 1),

('服装D', 109.99, 70, '/uploads/test13.jpg', 7, 1),
('服装E', 139.99, 60, '/uploads/test14.jpg', 7, 1),
('服装F', 169.99, 50, '/uploads/test15.jpg', 7, 1),

('配饰A', 39.99, 80, '/uploads/test16.jpg', 8, 1),
('配饰B', 59.99, 60, '/uploads/test17.jpg', 8, 1),
('配饰C', 79.99, 40, '/uploads/test18.jpg', 8, 1);