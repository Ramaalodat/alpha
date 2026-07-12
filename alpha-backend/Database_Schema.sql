-- BASIRA Database Schema
-- PostgreSQL Implementation

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE user_status AS ENUM ('pending_verification', 'verified', 'suspended', 'deleted');
CREATE TYPE goal_status AS ENUM ('active', 'completed', 'paused', 'deleted');
CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal');
CREATE TYPE otp_purpose AS ENUM ('registration', 'login', 'password_reset');
CREATE TYPE insight_type AS ENUM ('spending_pattern', 'goal_recommendation', 'budget_alert', 'saving_tip');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE notification_type AS ENUM ('goal_milestone', 'spending_alert', 'weekly_summary', 'educational');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status user_status DEFAULT 'pending_verification',
    is_onboarded BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User profiles with versioning (audit trail)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    monthly_income DECIMAL(12,2) NOT NULL,
    basic_expenses DECIMAL(12,2) NOT NULL,
    financial_goal TEXT,
    primary_spending_category VARCHAR(100) NOT NULL,
    version INTEGER DEFAULT 1,
    is_current BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

-- Default expense categories
CREATE TABLE expense_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(100),
    color VARCHAR(7) DEFAULT '#6B7280',
    is_default BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Financial goals
CREATE TABLE financial_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    icon VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    target_amount DECIMAL(12,2) NOT NULL CHECK (target_amount > 0),
    current_amount DECIMAL(12,2) DEFAULT 0 CHECK (current_amount >= 0),
    target_date DATE NOT NULL,
    status goal_status DEFAULT 'active',
    progress_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN target_amount > 0 THEN LEAST(100, (current_amount / target_amount) * 100)
            ELSE 0
        END
    ) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expenses tracking
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES expense_categories(id),
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    description TEXT,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50),
    location VARCHAR(255),
    receipt_url VARCHAR(500),
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_frequency VARCHAR(20), -- 'weekly', 'monthly', 'yearly'
    tags TEXT[],
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Goal transactions (money allocated to goals)
CREATE TABLE goal_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_id UUID NOT NULL REFERENCES financial_goals(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount != 0),
    transaction_type transaction_type NOT NULL,
    description TEXT,
    transaction_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OTP management
CREATE TABLE otp_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(15) NOT NULL,
    code VARCHAR(6) NOT NULL,
    purpose otp_purpose NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    attempts INTEGER DEFAULT 0,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User sessions for JWT refresh tokens
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(255) NOT NULL,
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP NOT NULL,
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI insights and recommendations
CREATE TABLE ai_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    insight_type insight_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority priority_level DEFAULT 'medium',
    is_read BOOLEAN DEFAULT FALSE,
    is_dismissed BOOLEAN DEFAULT FALSE,
    data JSONB,
    expires_at TIMESTAMP,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications system
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_sent BOOLEAN DEFAULT FALSE,
    scheduled_at TIMESTAMP,
    sent_at TIMESTAMP,
    read_at TIMESTAMP,
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit logging for compliance and debugging
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    request_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User settings and preferences
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    weekly_summary BOOLEAN DEFAULT TRUE,
    spending_alerts BOOLEAN DEFAULT TRUE,
    language VARCHAR(5) DEFAULT 'ar',
    currency VARCHAR(3) DEFAULT 'JOD',
    timezone VARCHAR(50) DEFAULT 'Asia/Amman',
    theme VARCHAR(20) DEFAULT 'light',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance optimization
CREATE INDEX idx_users_phone_number ON users(phone_number);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_current ON user_profiles(user_id, is_current) WHERE is_current = TRUE;
CREATE INDEX idx_financial_goals_user_id ON financial_goals(user_id);
CREATE INDEX idx_financial_goals_status ON financial_goals(user_id, status);
CREATE INDEX idx_expenses_user_id_date ON expenses(user_id, expense_date DESC);
CREATE INDEX idx_expenses_category ON expenses(category_id);
CREATE INDEX idx_goal_transactions_user_id ON goal_transactions(user_id);
CREATE INDEX idx_goal_transactions_goal_id ON goal_transactions(goal_id);
CREATE INDEX idx_otp_phone_number ON otp_codes(phone_number);
CREATE INDEX idx_otp_code_purpose ON otp_codes(code, purpose, is_used);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(refresh_token_hash);
CREATE INDEX idx_ai_insights_user_id ON ai_insights(user_id, is_read);
CREATE INDEX idx_notifications_user_id ON notifications(user_id, is_read);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financial_goals_updated_at BEFORE UPDATE ON financial_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update goal current_amount when transactions are added
CREATE OR REPLACE FUNCTION update_goal_amount()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE financial_goals 
        SET current_amount = current_amount + 
            CASE 
                WHEN NEW.transaction_type = 'deposit' THEN NEW.amount 
                ELSE -NEW.amount 
            END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.goal_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Reverse old transaction
        UPDATE financial_goals 
        SET current_amount = current_amount - 
            CASE 
                WHEN OLD.transaction_type = 'deposit' THEN OLD.amount 
                ELSE -OLD.amount 
            END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = OLD.goal_id;
        
        -- Apply new transaction
        UPDATE financial_goals 
        SET current_amount = current_amount + 
            CASE 
                WHEN NEW.transaction_type = 'deposit' THEN NEW.amount 
                ELSE -NEW.amount 
            END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.goal_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE financial_goals 
        SET current_amount = current_amount - 
            CASE 
                WHEN OLD.transaction_type = 'deposit' THEN OLD.amount 
                ELSE -OLD.amount 
            END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = OLD.goal_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER goal_amount_trigger 
    AFTER INSERT OR UPDATE OR DELETE ON goal_transactions
    FOR EACH ROW EXECUTE FUNCTION update_goal_amount();

-- Insert default expense categories
INSERT INTO expense_categories (name, icon, color, is_default) VALUES
('Food & Dining', '🍽️', '#EF4444', TRUE),
('Transportation', '🚗', '#3B82F6', TRUE),
('Shopping', '🛍️', '#8B5CF6', TRUE),
('Entertainment', '🎬', '#10B981', TRUE),
('Bills & Utilities', '⚡', '#F59E0B', TRUE),
('Healthcare', '🏥', '#EC4899', TRUE),
('Education', '📚', '#6366F1', TRUE),
('Travel', '✈️', '#14B8A6', TRUE),
('Personal Care', '💄', '#F97316', TRUE),
('Gifts & Donations', '🎁', '#84CC16', TRUE),
('Savings', '💰', '#22C55E', TRUE),
('Other', '📝', '#6B7280', TRUE);

-- Create view for user dashboard summary
CREATE VIEW user_dashboard_summary AS
SELECT 
    u.id as user_id,
    u.full_name,
    up.monthly_income,
    up.basic_expenses,
    COUNT(fg.id) as total_goals,
    COUNT(fg.id) FILTER (WHERE fg.status = 'active') as active_goals,
    COUNT(fg.id) FILTER (WHERE fg.status = 'completed') as completed_goals,
    COALESCE(SUM(fg.current_amount) FILTER (WHERE fg.status = 'active'), 0) as total_saved,
    COALESCE(SUM(fg.target_amount) FILTER (WHERE fg.status = 'active'), 0) as total_target,
    COALESCE(SUM(e.amount) FILTER (WHERE e.expense_date >= DATE_TRUNC('month', CURRENT_DATE)), 0) as monthly_expenses
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id AND up.is_current = TRUE
LEFT JOIN financial_goals fg ON u.id = fg.user_id AND fg.status != 'deleted'
LEFT JOIN expenses e ON u.id = e.user_id
WHERE u.status = 'verified'
GROUP BY u.id, u.full_name, up.monthly_income, up.basic_expenses;