-- Enable REPLICA IDENTITY FULL for bookmarks table
-- This ensures DELETE events include the full row data (including user_id)
ALTER TABLE bookmarks REPLICA IDENTITY FULL;

-- Verify the change
SELECT relname, relreplident 
FROM pg_class 
WHERE relname = 'bookmarks';
-- Should show 'f' for FULL
