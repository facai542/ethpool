-- 创建用户活动表
CREATE TABLE IF NOT EXISTS user_activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    user_address VARCHAR(255) NOT NULL,
    activity_id VARCHAR(50) NOT NULL DEFAULT 'standard',
    standard_amount DECIMAL(18, 6) NOT NULL DEFAULT 0,
    countdown_hours INTEGER NOT NULL DEFAULT 24,
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    
    -- 索引
    INDEX idx_user_activities_user_id (user_id),
    INDEX idx_user_activities_user_address (user_address),
    INDEX idx_user_activities_activity_id (activity_id),
    INDEX idx_user_activities_enabled (is_enabled),
    INDEX idx_user_activities_expires (expires_at)
);

-- 添加外键约束（如果用户表存在）
-- ALTER TABLE user_activities ADD CONSTRAINT fk_user_activities_user_id 
-- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;




