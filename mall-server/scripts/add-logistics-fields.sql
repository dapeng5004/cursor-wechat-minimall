-- 为orders表添加物流相关字段
ALTER TABLE `orders` 
ADD COLUMN `express_company` varchar(50) DEFAULT NULL COMMENT '快递公司' AFTER `ship_time`,
ADD COLUMN `express_no` varchar(100) DEFAULT NULL COMMENT '快递单号' AFTER `express_company`;

-- 添加索引
ALTER TABLE `orders` 
ADD INDEX `idx_express_no` (`express_no`); 