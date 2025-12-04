-- MySQL数据库表设计 - 保险管理系统

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS we_insurance_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE we_insurance_system;

-- 1. 用户表（user）
-- 存储系统用户信息，包括管理员、代理人和核保人
CREATE TABLE IF NOT EXISTS `user` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  `password` VARCHAR(255) NOT NULL COMMENT '密码（加密存储）',
  `name` VARCHAR(100) NOT NULL COMMENT '真实姓名',
  `role` ENUM('admin', 'agent', 'underwriter') NOT NULL DEFAULT 'agent' COMMENT '角色：admin-管理员，agent-代理人，underwriter-核保人',
  `email` VARCHAR(100) COMMENT '电子邮箱',
  `phone` VARCHAR(20) COMMENT '联系电话',
  `department` VARCHAR(100) COMMENT '所属部门',
  `status` BOOLEAN NOT NULL DEFAULT TRUE COMMENT '状态：0-禁用，1-启用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` DATETIME COMMENT '删除时间（软删除）',
  PRIMARY KEY (`id`),
  INDEX `idx_user_username` (`username`),
  INDEX `idx_user_role` (`role`),
  INDEX `idx_user_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 2. 险种分类表（insurance_category）
-- 存储险种分类信息
CREATE TABLE IF NOT EXISTS `insurance_category` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `name` VARCHAR(100) NOT NULL UNIQUE COMMENT '分类名称',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  INDEX `idx_category_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='险种分类表';

-- 3. 险种表（insurance）
-- 存储保险险种信息
CREATE TABLE IF NOT EXISTS `insurance` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '险种ID',
  `name` VARCHAR(100) NOT NULL COMMENT '险种名称',
  `code` VARCHAR(50) NOT NULL UNIQUE COMMENT '险种代码',
  `category_id` INT(11) NOT NULL COMMENT '分类ID',
  `description` TEXT COMMENT '险种描述',
  `status` BOOLEAN NOT NULL DEFAULT TRUE COMMENT '状态：0-禁用，1-启用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  INDEX `idx_insurance_name` (`name`),
  INDEX `idx_insurance_code` (`code`),
  INDEX `idx_insurance_category` (`category_id`),
  INDEX `idx_insurance_status` (`status`),
  FOREIGN KEY (`category_id`) REFERENCES `insurance_category` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='险种表';

-- 4. 业务记录表（business）
-- 存储保险业务记录信息
CREATE TABLE IF NOT EXISTS `business` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '业务记录ID',
  `agent_id` INT(11) NOT NULL COMMENT '代理人ID',
  `underwriter_id` INT(11) COMMENT '核保人ID',
  `insurance_id` INT(11) NOT NULL COMMENT '险种ID',
  `customer_name` VARCHAR(100) NOT NULL COMMENT '客户姓名',
  `customer_phone` VARCHAR(20) NOT NULL COMMENT '客户电话',
  `customer_email` VARCHAR(100) COMMENT '客户邮箱',
  `client_type` ENUM('personal', 'company', 'vehicle') NOT NULL DEFAULT 'personal' COMMENT '客户类型：personal-个人，company-企业，vehicle-车类',
  `personal_name` VARCHAR(100) COMMENT '联系人姓名',
  `company_name` VARCHAR(100) COMMENT '公司名称',
  `plate_number` VARCHAR(50) COMMENT '车牌号（车类客户）',
  `policy_number` VARCHAR(50) UNIQUE COMMENT '保单号',
  `premium_amount` DECIMAL(10, 2) NOT NULL COMMENT '保费金额',
  `coverage_amount` DECIMAL(15, 2) NOT NULL COMMENT '保额',
  `start_date` DATETIME NOT NULL COMMENT '保险开始日期',
  `end_date` DATETIME NOT NULL COMMENT '保险结束日期',
  `status` ENUM('pending', 'approved', 'rejected', 'expired') NOT NULL DEFAULT 'pending' COMMENT '状态：pending-待处理，approved-已批准，rejected-已拒绝，expired-已过期',
  `inquiry_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '询价日期',
  `approval_date` DATETIME COMMENT '批准日期',
  `remarks` TEXT COMMENT '备注',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` DATETIME COMMENT '删除时间（软删除）',
  PRIMARY KEY (`id`),
  INDEX `idx_business_agent` (`agent_id`),
  INDEX `idx_business_underwriter` (`underwriter_id`),
  INDEX `idx_business_insurance` (`insurance_id`),
  INDEX `idx_business_policy` (`policy_number`),
  INDEX `idx_business_status` (`status`),
  INDEX `idx_business_inquiry_date` (`inquiry_date`),
  FOREIGN KEY (`agent_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`underwriter_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`insurance_id`) REFERENCES `insurance` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='业务记录表';

-- 5. 系统配置表（system_config）
-- 存储系统配置信息
CREATE TABLE IF NOT EXISTS `system_config` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '配置ID',
  `key` VARCHAR(100) NOT NULL UNIQUE COMMENT '配置键',
  `value` TEXT NOT NULL COMMENT '配置值',
  `description` VARCHAR(255) COMMENT '配置描述',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  INDEX `idx_config_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表';

-- 6. 操作日志表（operation_log）
-- 存储系统操作日志
CREATE TABLE IF NOT EXISTS `operation_log` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `user_id` INT(11) NOT NULL COMMENT '操作用户ID',
  `username` VARCHAR(50) NOT NULL COMMENT '操作用户名',
  `operation` VARCHAR(100) NOT NULL COMMENT '操作类型',
  `module` VARCHAR(100) NOT NULL COMMENT '操作模块',
  `ip_address` VARCHAR(50) NOT NULL COMMENT '操作IP地址',
  `content` TEXT COMMENT '操作内容',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  PRIMARY KEY (`id`),
  INDEX `idx_log_user` (`user_id`),
  INDEX `idx_log_operation` (`operation`),
  INDEX `idx_log_module` (`module`),
  INDEX `idx_log_created_at` (`created_at`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- 插入初始数据

-- 插入默认用户（admin/admin123）
INSERT INTO `user` (`username`, `password`, `name`, `role`, `email`, `phone`, `status`) VALUES
('admin', '$2a$10$7J6Z9j3yW5X2Y1Z0A9B8C7D6E5F4G3H2I1J0K9L8M7N6O5P4Q', '系统管理员', 'admin', 'admin@example.com', '13800138000', TRUE);

-- 插入默认险种分类
INSERT INTO `insurance_category` (`name`) VALUES
('个人意外险'),
('团体意外险'),
('健康险'),
('人寿险'),
('财产险'),
('学平险');

-- 插入默认险种
INSERT INTO `insurance` (`name`, `code`, `category_id`, `description`, `status`) VALUES
('个人意外综合险', 'INS20240101001', 1, '提供全面的个人意外保障，包括意外身故、伤残、医疗等', TRUE),
('团体意外保障险', 'INS20240101002', 2, '为企业员工提供团体意外保障，适合各类企业', TRUE),
('重大疾病保险', 'INS20240101003', 3, '覆盖多种重大疾病，提供高额保障金', TRUE),
('定期寿险', 'INS20240101004', 4, '提供定期身故保障，保费低廉，保障高', TRUE),
('家庭财产保险', 'INS20240101005', 5, '保障家庭财产安全，包括房屋、家具、电器等', TRUE),
('学生平安保险', 'INS20240101006', 6, '专为学生设计的综合保障，包括意外、医疗等', TRUE);

-- 插入系统配置
INSERT INTO `system_config` (`key`, `value`, `description`) VALUES
('system_name', '保险业务管理系统', '系统名称'),
('system_version', '1.0.0', '系统版本'),
('insurance_code_prefix', 'INS', '险种代码前缀'),
('max_login_attempts', '5', '最大登录尝试次数'),
('password_expire_days', '90', '密码过期天数');
