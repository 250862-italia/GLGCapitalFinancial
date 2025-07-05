-- Content Management Tables Setup
-- Run this script in your Supabase SQL editor

-- 1. Content table for articles, news, markets, partnerships
CREATE TABLE IF NOT EXISTS content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('article', 'news', 'market', 'partnership')),
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'archived')),
    author VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    publish_date DATE,
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    views INTEGER DEFAULT 0,
    featured_image_url VARCHAR(500),
    meta_description VARCHAR(500),
    seo_keywords VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Content categories table
CREATE TABLE IF NOT EXISTS content_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Content tags table
CREATE TABLE IF NOT EXISTS content_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Content analytics table
CREATE TABLE IF NOT EXISTS content_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    view_date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    time_spent_avg INTEGER DEFAULT 0, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Content media table for images, videos, documents
CREATE TABLE IF NOT EXISTS content_media (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER,
    alt_text VARCHAR(255),
    caption TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample categories
INSERT INTO content_categories (name, description, color) VALUES
('Financial Reports', 'Quarterly and annual financial reports', '#10B981'),
('Market Analysis', 'Market trends and analysis', '#F59E0B'),
('Partnerships', 'Strategic partnerships and collaborations', '#8B5CF6'),
('Investment News', 'Investment opportunities and news', '#EF4444'),
('Company Updates', 'Company announcements and updates', '#3B82F6')
ON CONFLICT (name) DO NOTHING;

-- Insert sample tags
INSERT INTO content_tags (name) VALUES
('financial'), ('report'), ('Q1-2024'), ('partnership'), ('europe'), 
('investment'), ('market'), ('tech'), ('analysis'), ('renewable'), 
('energy'), ('sustainability'), ('growth'), ('strategy')
ON CONFLICT (name) DO NOTHING;

-- Insert sample content
INSERT INTO content (title, type, status, author, content, tags, publish_date, featured_image_url, meta_description) VALUES
(
    'GLG Capital Group Q1 2024 Financial Report',
    'article',
    'published',
    'John Smith',
    'Comprehensive analysis of GLG Capital Group performance in Q1 2024. Our financial results show strong growth across all business segments, with total revenue increasing by 15% compared to the previous quarter. Key highlights include expanded market presence in European markets and successful completion of three major investment projects.',
    ARRAY['financial', 'report', 'Q1-2024'],
    '2024-01-15',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    'GLG Capital Group Q1 2024 financial performance and strategic achievements'
),
(
    'New Partnership with European Investment Bank',
    'partnership',
    'published',
    'Maria Garcia',
    'GLG Capital Group announces strategic partnership with European Investment Bank to expand investment opportunities across European markets. This collaboration will provide access to €500 million in funding for sustainable development projects and renewable energy initiatives.',
    ARRAY['partnership', 'europe', 'investment'],
    '2024-01-12',
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
    'Strategic partnership announcement with European Investment Bank for sustainable development'
),
(
    'Market Analysis: Tech Sector Trends',
    'market',
    'draft',
    'David Chen',
    'Analysis of current trends in the technology sector and investment opportunities. The tech sector continues to show strong growth potential, particularly in artificial intelligence, cloud computing, and cybersecurity. We identify key investment opportunities and risk factors for investors.',
    ARRAY['market', 'tech', 'analysis'],
    NULL,
    'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800',
    'Comprehensive analysis of technology sector trends and investment opportunities'
),
(
    'Investment Opportunities in Renewable Energy',
    'news',
    'archived',
    'Sarah Johnson',
    'Exploring investment opportunities in the growing renewable energy sector. With global focus on sustainability and carbon reduction, renewable energy presents significant investment potential. We analyze solar, wind, and hydrogen energy markets.',
    ARRAY['renewable', 'energy', 'investment'],
    '2023-12-20',
    'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800',
    'Investment analysis of renewable energy sector opportunities and market trends'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_content_type ON content(type);
CREATE INDEX IF NOT EXISTS idx_content_status ON content(status);
CREATE INDEX IF NOT EXISTS idx_content_publish_date ON content(publish_date);
CREATE INDEX IF NOT EXISTS idx_content_author ON content(author);
CREATE INDEX IF NOT EXISTS idx_content_tags ON content USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_content_analytics_content_id ON content_analytics(content_id);
CREATE INDEX IF NOT EXISTS idx_content_analytics_view_date ON content_analytics(view_date);
CREATE INDEX IF NOT EXISTS idx_content_media_content_id ON content_media(content_id);

-- Enable Row Level Security (RLS)
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_media ENABLE ROW LEVEL SECURITY;

-- Create policies for content table
CREATE POLICY "Content is viewable by everyone" ON content
    FOR SELECT USING (true);

CREATE POLICY "Content can be managed by authenticated users" ON content
    FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for other tables
CREATE POLICY "Categories are viewable by everyone" ON content_categories
    FOR SELECT USING (true);

CREATE POLICY "Tags are viewable by everyone" ON content_tags
    FOR SELECT USING (true);

CREATE POLICY "Analytics are viewable by authenticated users" ON content_analytics
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Media is viewable by everyone" ON content_media
    FOR SELECT USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for content table
CREATE TRIGGER update_content_updated_at 
    BEFORE UPDATE ON content 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to increment view count
CREATE OR REPLACE FUNCTION increment_content_views()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE content 
    SET views = views + 1 
    WHERE id = NEW.content_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for content analytics
CREATE TRIGGER increment_content_views_trigger
    AFTER INSERT ON content_analytics
    FOR EACH ROW
    EXECUTE FUNCTION increment_content_views();

-- Grant necessary permissions
GRANT ALL ON content TO authenticated;
GRANT ALL ON content_categories TO authenticated;
GRANT ALL ON content_tags TO authenticated;
GRANT ALL ON content_analytics TO authenticated;
GRANT ALL ON content_media TO authenticated;

GRANT SELECT ON content TO anon;
GRANT SELECT ON content_categories TO anon;
GRANT SELECT ON content_tags TO anon;
GRANT SELECT ON content_media TO anon; 