-- Create the notes table
CREATE TABLE notes (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some sample data into the table
INSERT INTO notes (title)
VALUES
  ('Today I created a Supabase project.'),
  ('I added some data and queried it from Next.js.'),
  ('It was awesome!');

-- Enable Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all authenticated users to read notes
CREATE POLICY "Allow authenticated users to read notes" ON notes
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create a policy that allows users to insert their own notes
CREATE POLICY "Allow users to insert notes" ON notes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create a policy that allows users to update their own notes
CREATE POLICY "Allow users to update notes" ON notes
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create a policy that allows users to delete their own notes
CREATE POLICY "Allow users to delete notes" ON notes
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create an index on created_at for better performance
CREATE INDEX idx_notes_created_at ON notes(created_at);

-- Create a function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_notes_updated_at 
    BEFORE UPDATE ON notes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 