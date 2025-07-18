-- Fix RLS Policies for Testing
-- Run this in your Supabase SQL Editor

-- Drop existing policies (ignore errors if they don't exist)
DROP POLICY IF EXISTS "Allow authenticated users to read notes" ON notes;
DROP POLICY IF EXISTS "Allow users to insert notes" ON notes;
DROP POLICY IF EXISTS "Allow users to update notes" ON notes;
DROP POLICY IF EXISTS "Allow users to delete notes" ON notes;
DROP POLICY IF EXISTS "Allow all users to read notes" ON notes;
DROP POLICY IF EXISTS "Allow all users to insert notes" ON notes;
DROP POLICY IF EXISTS "Allow all users to update notes" ON notes;
DROP POLICY IF EXISTS "Allow all users to delete notes" ON notes;

-- Create new policies that allow anonymous access for testing
CREATE POLICY "Allow all users to read notes" ON notes
  FOR SELECT USING (true);

CREATE POLICY "Allow all users to insert notes" ON notes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all users to update notes" ON notes
  FOR UPDATE USING (true);

CREATE POLICY "Allow all users to delete notes" ON notes
  FOR DELETE USING (true);

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'notes';

-- Test the setup
SELECT 'RLS policies updated successfully!' as status; 