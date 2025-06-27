-- Database Functions for GLG Dashboard
-- Run this in Supabase SQL Editor after creating tables

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kyc_records_updated_at BEFORE UPDATE ON kyc_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_news_articles_updated_at BEFORE UPDATE ON news_articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partnerships_updated_at BEFORE UPDATE ON partnerships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_packages_updated_at BEFORE UPDATE ON client_packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate package returns
CREATE OR REPLACE FUNCTION calculate_package_return(
    investment_amount DECIMAL,
    daily_return DECIMAL,
    days_elapsed INTEGER
)
RETURNS DECIMAL AS $$
BEGIN
    RETURN investment_amount * daily_return * days_elapsed;
END;
$$ LANGUAGE plpgsql;

-- Function to get client portfolio summary
CREATE OR REPLACE FUNCTION get_client_portfolio(client_uuid UUID)
RETURNS TABLE (
    total_invested DECIMAL,
    total_return DECIMAL,
    active_packages INTEGER,
    portfolio_value DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(cp.investment_amount), 0) as total_invested,
        COALESCE(SUM(cp.total_return), 0) as total_return,
        COUNT(CASE WHEN cp.status = 'active' THEN 1 END) as active_packages,
        COALESCE(SUM(cp.investment_amount + cp.total_return), 0) as portfolio_value
    FROM client_packages cp
    WHERE cp.client_id = client_uuid;
END;
$$ LANGUAGE plpgsql; 