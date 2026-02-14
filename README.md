# BookmarkHub - Smart Bookmark Manager

A modern bookmark manager with real-time synchronization across tabs. Built with Next.js 14, Supabase, and Tailwind CSS.


## Features

- Google OAuth authentication
- Real-time sync across all browser tabs
- Private bookmarks with Row Level Security
- Optimistic UI updates
- Modern, responsive design

## Tech Stack

Next.js 14 • Supabase • TypeScript • Tailwind CSS • Vercel

## Quick Start

```bash
# Clone and install
git clone <repo-url>
cd smart-bookmark-app
npm install

# Set up environment variables
cp .env.local.example .env.local
# Add your Supabase URL and anon key

# Run development server
npm run dev
```

### Database Setup

Run this in Supabase SQL Editor:

```sql
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL CHECK (LENGTH(TRIM(url)) > 0),
  title TEXT NOT NULL CHECK (LENGTH(TRIM(title)) > 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks" ON bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own bookmarks" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookmarks" ON bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;
ALTER TABLE bookmarks REPLICA IDENTITY FULL;
```

Enable Google OAuth in Supabase Authentication → Providers, then configure redirect URLs.

## Problems Faced & Solutions

### 1. OAuth Redirect Loop

**Problem**: After Google login, users got stuck in a redirect loop between `/login` and `/auth/callback`.

**Root Cause**: The callback handler expected a `code` parameter (PKCE flow), but Supabase was returning tokens in the URL hash (implicit flow).

**Solution**: Modified the callback to handle both flows:

```typescript
// Instead of rejecting when no code
if (code) {
  await supabase.auth.exchangeCodeForSession(code);
}
// Redirect to dashboard - client SDK handles hash tokens
return NextResponse.redirect(`${origin}/dashboard`);
```

### 2. Real-time DELETE Events Not Syncing

**Problem**: Adding bookmarks synced instantly, but deleting required manual refresh in other tabs.

**Root Cause**: DELETE events didn't include `user_id` in the payload, so the subscription filter `user_id=eq.${user.id}` failed to match.

**Solution**: 
1. Enabled `REPLICA IDENTITY FULL` to include full row data in DELETE events
2. Simplified subscription to listen to all events without filtering, relying on RLS when fetching:

```typescript
// Listen to all bookmark changes
channel.on('postgres_changes', { event: '*', table: 'bookmarks' }, async () => {
  const bookmarks = await getBookmarks(); // RLS filters to user's bookmarks
  callback(bookmarks);
});
```

### 3. Real-time Not Enabling

**Problem**: Subscription code was correct but no events were received.

**Root Cause**: The `bookmarks` table wasn't added to the real-time publication.

**Solution**: 

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;
```

Also needed `REPLICA IDENTITY FULL` for DELETE events to work properly.

### 4. Row Level Security Blocking Queries

**Problem**: Authenticated users couldn't fetch their own bookmarks.

**Root Cause**: Server-side Supabase client wasn't maintaining session context.

**Solution**: Used client-side Supabase instance for all bookmark operations, which automatically includes the session token, allowing RLS to identify the authenticated user.

## Key Learnings

1. **Real-time DELETE events** require `REPLICA IDENTITY FULL` on the table
2. **Listening to all events** + RLS filtering is simpler than client-side event filtering
3. **OAuth flows vary** - handle both PKCE and implicit flows for better compatibility
4. **Optimistic updates** improve UX but need careful error handling and rollback logic


