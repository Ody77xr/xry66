-- XrCakey Vault Comments Table Schema
-- Run this SQL in your Supabase SQL Editor to create the comments table

-- Create vault_comments table
CREATE TABLE vault_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT DEFAULT 'Anonymous',
    comment_text TEXT NOT NULL CHECK (char_length(comment_text) <= 500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE vault_comments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read comments
CREATE POLICY "Allow public read access" 
ON vault_comments 
FOR SELECT 
USING (true);

-- Create policy to allow anyone to insert comments
CREATE POLICY "Allow public insert access" 
ON vault_comments 
FOR INSERT 
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX vault_comments_created_at_idx ON vault_comments(created_at DESC);

-- Enable realtime for the table (so comments update live)
ALTER PUBLICATION supabase_realtime ADD TABLE vault_comments;
