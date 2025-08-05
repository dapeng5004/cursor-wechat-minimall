-- 模拟订单数据插入脚本
-- 使用数据库
USE `mall`;

-- 1. 首先插入模拟用户数据（如果不存在）
INSERT IGNORE INTO `users` (`id`, `openid`, `nickname`, `avatar`, `phone`, `gender`, `status`) VALUES
(1, 'wx_openid_001', '张三', '/uploads/avatar/user1.jpg', '13800138001', 1, 1),
(2, 'wx_openid_002', '李四', '/uploads/avatar/user2.jpg', '13800138002', 2, 1),
(3, 'wx_openid_003', '王五', '/uploads/avatar/user3.jpg', '13800138003', 1, 1),
(4, 'wx_openid_004', '赵六', '/uploads/avatar/user4.jpg', '13800138004', 2, 1),
(5, 'wx_openid_005', '钱七', '/uploads/avatar/user5.jpg', '13800138005', 1, 1);

-- 2. 插入模拟收货地址数据（如果不存在）
INSERT IGNORE INTO `addresses` (`id`, `user_id`, `name`, `phone`, `province`, `city`, `district`, `detail`, `is_default`) VALUES
(1, 1, '张三', '13800138001', '北京市', '北京市', '朝阳区', '三里屯SOHO 1号楼 1001室', 1),
(2, 1, '张三', '13800138001', '上海市', '上海市', '浦东新区', '陆家嘴金融中心 2号楼 2002室', 0),
(3, 2, '李四', '13800138002', '广州市', '广州市', '天河区', '珠江新城 3号楼 3003室', 1),
(4, 3, '王五', '13800138003', '深圳市', '深圳市', '南山区', '科技园 4号楼 4004室', 1),
(5, 4, '赵六', '13800138004', '杭州市', '杭州市', '西湖区', '西溪湿地 5号楼 5005室', 1),
(6, 5, '钱七', '13800138005', '成都市', '成都市', '锦江区', '春熙路 6号楼 6006室', 1);

-- 3. 插入模拟订单数据
INSERT INTO `orders` (`order_no`, `user_id`, `address_id`, `total_amount`, `status`, `payment_method`, `payment_time`, `ship_time`, `complete_time`, `remark`, `created_at`) VALUES
-- 待支付订单
('ORD202412200001', 1, 1, 1599.00, 0, NULL, NULL, NULL, NULL, '请尽快发货', '2024-12-20 10:00:00'),
('ORD202412200002', 2, 3, 299.00, 0, NULL, NULL, NULL, NULL, '无特殊要求', '2024-12-20 10:30:00'),

-- 已支付订单
('ORD202412200003', 3, 4, 899.00, 1, '微信支付', '2024-12-20 11:00:00', NULL, NULL, '包装精美一些', '2024-12-20 10:45:00'),
('ORD202412200004', 4, 5, 1299.00, 1, '支付宝', '2024-12-20 11:15:00', NULL, NULL, '送货上门', '2024-12-20 11:00:00'),

-- 已发货订单
('ORD202412200005', 5, 6, 599.00, 2, '微信支付', '2024-12-20 11:30:00', '2024-12-20 14:00:00', NULL, '轻拿轻放', '2024-12-20 11:15:00'),
('ORD202412200006', 1, 2, 799.00, 2, '支付宝', '2024-12-20 11:45:00', '2024-12-20 14:30:00', NULL, '周末送货', '2024-12-20 11:30:00'),

-- 已完成订单
('ORD202412200007', 2, 3, 399.00, 3, '微信支付', '2024-12-20 12:00:00', '2024-12-20 15:00:00', '2024-12-20 16:00:00', '商品质量很好', '2024-12-20 11:45:00'),
('ORD202412200008', 3, 4, 699.00, 3, '支付宝', '2024-12-20 12:15:00', '2024-12-20 15:30:00', '2024-12-20 16:30:00', '服务态度不错', '2024-12-20 12:00:00'),

-- 已取消订单
('ORD202412200009', 4, 5, 999.00, 4, NULL, NULL, NULL, NULL, '客户取消', '2024-12-20 12:30:00'),
('ORD202412200010', 5, 6, 499.00, 4, NULL, NULL, NULL, NULL, '价格太贵', '2024-12-20 12:45:00');

-- 4. 插入模拟订单商品数据
INSERT INTO `order_goods` (`order_id`, `goods_id`, `goods_name`, `goods_image`, `price`, `quantity`, `subtotal`) VALUES
-- 订单1的商品
(1, 1, 'SK-II神仙水', '/uploads/goods/sk2.jpg', 1599.00, 1, 1599.00),

-- 订单2的商品
(2, 2, 'Adidas运动服', '/uploads/goods/adidas.jpg', 299.00, 1, 299.00),

-- 订单3的商品
(3, 3, 'iPhone 15', '/uploads/goods/iphone15.jpg', 899.00, 1, 899.00),

-- 订单4的商品
(4, 4, 'MacBook Pro', '/uploads/goods/macbook.jpg', 1299.00, 1, 1299.00),

-- 订单5的商品
(5, 5, 'Nike运动鞋', '/uploads/goods/nike.jpg', 599.00, 1, 599.00),

-- 订单6的商品
(6, 1, 'SK-II神仙水', '/uploads/goods/sk2.jpg', 799.00, 1, 799.00),

-- 订单7的商品
(7, 2, 'Adidas运动服', '/uploads/goods/adidas.jpg', 399.00, 1, 399.00),

-- 订单8的商品
(8, 3, 'iPhone 15', '/uploads/goods/iphone15.jpg', 699.00, 1, 699.00),

-- 订单9的商品
(9, 4, 'MacBook Pro', '/uploads/goods/macbook.jpg', 999.00, 1, 999.00),

-- 订单10的商品
(10, 5, 'Nike运动鞋', '/uploads/goods/nike.jpg', 499.00, 1, 499.00);

-- 5. 更新商品销量（根据订单数据）
UPDATE `goods` SET `sales` = (
  SELECT COALESCE(SUM(quantity), 0) 
  FROM `order_goods` og 
  JOIN `orders` o ON og.order_id = o.id 
  WHERE og.goods_id = goods.id AND o.status IN (1, 2, 3)
);

-- 查询插入结果
SELECT '订单数据插入完成' as message;
SELECT COUNT(*) as total_orders FROM `orders`;
SELECT COUNT(*) as total_order_goods FROM `order_goods`; 