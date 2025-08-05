-- 商城小程序数据库初始化脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS `mall-mall` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `mall-mall`;

-- 用户表
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `openid` varchar(100) NOT NULL COMMENT '微信openid',
  `nickname` varchar(50) DEFAULT NULL COMMENT '昵称',
  `avatar` varchar(255) DEFAULT NULL COMMENT '头像',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `gender` tinyint(1) DEFAULT 0 COMMENT '性别：0未知，1男，2女',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态：0禁用，1正常',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_openid` (`openid`),
  KEY `idx_phone` (`phone`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 管理员表
CREATE TABLE IF NOT EXISTS `admins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `password` varchar(255) NOT NULL COMMENT '密码',
  `nickname` varchar(50) DEFAULT NULL COMMENT '昵称',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
  `role` varchar(20) DEFAULT 'admin' COMMENT '角色：super_admin, admin, editor, viewer',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态：0禁用，1正常',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  KEY `idx_role` (`role`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表';

-- 分类表
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL COMMENT '分类名称',
  `description` text DEFAULT NULL COMMENT '分类描述',
  `parent_id` int(11) DEFAULT 0 COMMENT '父级分类ID',
  `sort_order` int(11) DEFAULT 0 COMMENT '排序',
  `icon` varchar(255) DEFAULT NULL COMMENT '图标',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态：0禁用，1正常',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_sort_order` (`sort_order`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品分类表';

-- 商品表
CREATE TABLE IF NOT EXISTS `goods` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT '商品名称',
  `description` text DEFAULT NULL COMMENT '商品描述',
  `price` decimal(10,2) NOT NULL COMMENT '售价',
  `original_price` decimal(10,2) DEFAULT NULL COMMENT '原价',
  `category_id` int(11) NOT NULL COMMENT '分类ID',
  `images` text DEFAULT NULL COMMENT '商品图片，JSON格式',
  `stock` int(11) DEFAULT 0 COMMENT '库存',
  `sales` int(11) DEFAULT 0 COMMENT '销量',
  `views` int(11) DEFAULT 0 COMMENT '浏览量',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态：0下架，1上架',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_status` (`status`),
  KEY `idx_sales` (`sales`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';

-- 轮播图表
CREATE TABLE IF NOT EXISTS `banners` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL COMMENT '标题',
  `image_url` varchar(255) NOT NULL COMMENT '图片地址',
  `link_url` varchar(255) DEFAULT NULL COMMENT '链接地址',
  `position` varchar(20) DEFAULT 'home' COMMENT '位置：home首页，category分类页',
  `sort_order` int(11) DEFAULT 0 COMMENT '排序',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态：0禁用，1正常',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_position` (`position`),
  KEY `idx_sort_order` (`sort_order`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='轮播图表';

-- 购物车表
CREATE TABLE IF NOT EXISTS `cart` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT '用户ID',
  `goods_id` int(11) NOT NULL COMMENT '商品ID',
  `quantity` int(11) NOT NULL DEFAULT 1 COMMENT '数量',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态：0删除，1正常',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_goods` (`user_id`, `goods_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_goods_id` (`goods_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='购物车表';

-- 地址表
CREATE TABLE IF NOT EXISTS `addresses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT '用户ID',
  `name` varchar(50) NOT NULL COMMENT '收货人姓名',
  `phone` varchar(20) NOT NULL COMMENT '手机号',
  `province` varchar(50) NOT NULL COMMENT '省份',
  `city` varchar(50) NOT NULL COMMENT '城市',
  `district` varchar(50) NOT NULL COMMENT '区县',
  `detail` varchar(255) NOT NULL COMMENT '详细地址',
  `is_default` tinyint(1) DEFAULT 0 COMMENT '是否默认地址：0否，1是',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态：0删除，1正常',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_is_default` (`is_default`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收货地址表';

-- 订单表
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT '用户ID',
  `order_no` varchar(50) NOT NULL COMMENT '订单号',
  `address_id` int(11) NOT NULL COMMENT '收货地址ID',
  `total_amount` decimal(10,2) NOT NULL COMMENT '订单总金额',
  `remark` text DEFAULT NULL COMMENT '订单备注',
  `payment_method` varchar(20) DEFAULT 'wechat' COMMENT '支付方式：wechat微信，alipay支付宝',
  `status` varchar(20) DEFAULT 'pending' COMMENT '订单状态：pending待付款，paid已付款，shipped已发货，completed已完成，cancelled已取消',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- 订单商品表
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL COMMENT '订单ID',
  `goods_id` int(11) NOT NULL COMMENT '商品ID',
  `goods_name` varchar(100) NOT NULL COMMENT '商品名称',
  `goods_price` decimal(10,2) NOT NULL COMMENT '商品价格',
  `quantity` int(11) NOT NULL COMMENT '数量',
  `total_price` decimal(10,2) NOT NULL COMMENT '小计金额',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_goods_id` (`goods_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单商品表';

-- 插入初始数据

-- 插入默认管理员
INSERT INTO `admins` (`username`, `password`, `nickname`, `role`) VALUES 
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '系统管理员', 'super_admin');

-- 插入示例分类
INSERT INTO `categories` (`name`, `description`, `parent_id`, `sort_order`) VALUES 
('数码产品', '手机、电脑、平板等数码产品', 0, 1),
('服装鞋帽', '男装、女装、童装、鞋帽等', 0, 2),
('家居用品', '家具、家电、生活用品等', 0, 3),
('手机', '智能手机', 1, 1),
('电脑', '笔记本电脑、台式机', 1, 2),
('男装', '男士服装', 2, 1),
('女装', '女士服装', 2, 2);

-- 插入示例商品
INSERT INTO `goods` (`name`, `description`, `price`, `original_price`, `category_id`, `images`, `stock`, `sales`) VALUES 
('iPhone 15 Pro', '苹果最新旗舰手机，搭载A17 Pro芯片', 7999.00, 8999.00, 4, '["/uploads/iphone15pro_1.jpg", "/uploads/iphone15pro_2.jpg"]', 100, 50),
('MacBook Pro 14', '14英寸MacBook Pro，搭载M3芯片', 14999.00, 16999.00, 5, '["/uploads/macbook_pro_1.jpg"]', 50, 20),
('男士休闲T恤', '纯棉舒适男士T恤，多色可选', 99.00, 129.00, 6, '["/uploads/tshirt_1.jpg"]', 200, 150),
('女士连衣裙', '时尚女士连衣裙，优雅大方', 299.00, 399.00, 7, '["/uploads/dress_1.jpg"]', 80, 30);

-- 插入示例轮播图
INSERT INTO `banners` (`title`, `image_url`, `link_url`, `position`, `sort_order`) VALUES 
('iPhone 15 Pro 新品上市', '/uploads/banner_iphone.jpg', '/goods/1', 'home', 1),
('MacBook Pro 限时优惠', '/uploads/banner_macbook.jpg', '/goods/2', 'home', 2),
('春季服装大促销', '/uploads/banner_clothing.jpg', '/category/2', 'home', 3);

-- 创建索引
CREATE INDEX `idx_users_created_at` ON `users` (`created_at`);
CREATE INDEX `idx_goods_category_status` ON `goods` (`category_id`, `status`);
CREATE INDEX `idx_orders_user_status` ON `orders` (`user_id`, `status`);
CREATE INDEX `idx_cart_user_status` ON `cart` (`user_id`, `status`);
CREATE INDEX `idx_addresses_user_default` ON `addresses` (`user_id`, `is_default`);

-- 添加外键约束（可选）
-- ALTER TABLE `goods` ADD CONSTRAINT `fk_goods_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);
-- ALTER TABLE `cart` ADD CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
-- ALTER TABLE `cart` ADD CONSTRAINT `fk_cart_goods` FOREIGN KEY (`goods_id`) REFERENCES `goods` (`id`);
-- ALTER TABLE `addresses` ADD CONSTRAINT `fk_addresses_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
-- ALTER TABLE `orders` ADD CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
-- ALTER TABLE `orders` ADD CONSTRAINT `fk_orders_address` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`id`);
-- ALTER TABLE `order_items` ADD CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`);
-- ALTER TABLE `order_items` ADD CONSTRAINT `fk_order_items_goods` FOREIGN KEY (`goods_id`) REFERENCES `goods` (`id`); 