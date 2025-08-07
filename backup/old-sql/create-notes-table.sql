-- Create notes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notes (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON public.notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON public.notes(updated_at DESC);

-- Enable RLS
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users" ON public.notes
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.notes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.notes
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON public.notes
    FOR DELETE USING (auth.role() = 'authenticated');

-- Insert some sample data
INSERT INTO public.notes (title, content, created_at, updated_at) VALUES
    ('Today I created a Supabase project.', 'This is the first note about creating a Supabase project.', NOW(), NOW()),
    ('I added some data and queried it from Next.js.', 'This note describes how to query data from Next.js.', NOW(), NOW()),
    ('It was awesome!', 'A simple note expressing satisfaction.', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT ALL ON public.notes TO authenticated;
GRANT ALL ON public.notes TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.notes_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.notes_id_seq TO service_role; 