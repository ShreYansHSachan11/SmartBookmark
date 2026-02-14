-- Create bookmarks table with schema
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Add database constraints
  CONSTRAINT url_not_empty CHECK (LENGTH(TRIM(url)) > 0),
  CONSTRAINT title_not_empty CHECK (LENGTH(TRIM(title)) > 0)
);

-- Create indexes for efficient queries
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_created_at ON bookmarks(created_at DESC);

-- Enable Row Level Security
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for SELECT (users can view own bookmarks)
CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

-- Create RLS policy for INSERT (users can create own bookmarks)
CREATE POLICY "Users can create own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policy for DELETE (users can delete own bookmarks)
CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);
