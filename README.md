# Smart Bookmark Manager

A modern web application for managing bookmarks with real-time synchronization across multiple browser tabs and sessions. Built with Next.js 14, Supabase, and Tailwind CSS.

## Features

- **Google OAuth Authentication**: Secure login without password management
- **Real-time Synchronization**: Changes appear instantly across all open tabs
- **Private Bookmarks**: Each user's bookmarks are completely isolated and secure
- **Modern UI**: Responsive design that works on desktop and mobile
- **Instant Feedback**: Loading states and notifications for all actions
- **Serverless Architecture**: Deployed on Vercel with Supabase backend

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Deployment**: Vercel
- **Authentication**: Google OAuth via Supabase Auth

## Live Demo

🔗 [Live Application URL - To be added after deployment]

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works)
- A Google Cloud project for OAuth credentials

### 1. Clone the Repository

```bash
git clone <repository-url>
cd smart-bookmark-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

#### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to finish provisioning (2-3 minutes)
3. Note your project URL and anon key from Settings > API

#### Configure Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Run the migration script from `supabase/migrations/001_create_bookmarks_table.sql`:

```sql
-- Create bookmarks table
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT url_not_empty CHECK (LENGTH(TRIM(url)) > 0),
  CONSTRAINT title_not_empty CHECK (LENGTH(TRIM(title)) > 0)
);

-- Create indexes
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_created_at ON bookmarks(created_at DESC);

-- Enable Row Level Security
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);
```

#### Enable Google OAuth

1. Go to Authentication > Providers in your Supabase dashboard
2. Enable Google provider
3. Follow Supabase's guide to create OAuth credentials in Google Cloud Console
4. Add your Google Client ID and Client Secret to Supabase
5. Add authorized redirect URIs:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://your-app.vercel.app/auth/callback`

#### Enable Real-time

1. Go to Database > Replication in your Supabase dashboard
2. Enable replication for the `bookmarks` table
3. Select INSERT and DELETE events

### 4. Configure Environment Variables

Create a `.env.local` file in the project root (use `.env.local.example` as template):

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Replace `your-project-url` and `your-anon-key` with values from your Supabase project settings.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project" and import your GitHub repository
3. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `NEXT_PUBLIC_SITE_URL`: Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
4. Click "Deploy"

### 3. Update Supabase Redirect URLs

After deployment, add your production URL to Supabase:

1. Go to Authentication > URL Configuration in Supabase
2. Add your Vercel URL to "Site URL"
3. Add `https://your-app.vercel.app/auth/callback` to "Redirect URLs"

### 4. Update Google OAuth Redirect URIs

In Google Cloud Console, add your production callback URL:
- `https://your-app.vercel.app/auth/callback`

## Project Structure

```
smart-bookmark-app/
├── app/                          # Next.js App Router
│   ├── auth/callback/           # OAuth callback handler
│   ├── dashboard/               # Main dashboard page
│   ├── login/                   # Login page
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles
├── components/                   # React components
│   ├── BookmarkForm.tsx         # Bookmark creation form
│   ├── BookmarkList.tsx         # Bookmark list display
│   ├── LoadingSpinner.tsx       # Loading indicator
│   └── providers/
│       └── AuthProvider.tsx     # Authentication context
├── lib/                         # Services and utilities
│   ├── services/
│   │   ├── auth.ts             # Authentication service
│   │   └── bookmarks.ts        # Bookmark CRUD operations
│   ├── supabase/
│   │   ├── client.ts           # Supabase client (browser)
│   │   └── server.ts           # Supabase client (server)
│   └── utils/
│       └── validation.ts        # Input validation
├── types/                       # TypeScript definitions
│   ├── database.ts             # Database types
│   └── errors.ts               # Error types
├── supabase/                    # Supabase configuration
│   └── migrations/             # Database migrations
├── .env.local.example          # Environment template
├── vercel.json                 # Vercel configuration
└── package.json                # Dependencies
```

## Available Scripts

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Problems Encountered and Solutions

### Problem 1: Real-time Subscriptions Not Working

**Issue**: Real-time updates weren't propagating across tabs.

**Solution**: 
- Enabled replication for the `bookmarks` table in Supabase dashboard (Database > Replication)
- Ensured proper cleanup of subscriptions in `useEffect` to prevent memory leaks
- Added error handling for subscription failures with automatic reconnection

### Problem 2: Row Level Security Blocking Queries

**Issue**: Authenticated users couldn't fetch their own bookmarks due to RLS policies.

**Solution**:
- Verified that `auth.uid()` was correctly set in the session
- Ensured the `user_id` column matched the authenticated user's ID
- Used Supabase's server-side client for server components to maintain session context

### Problem 3: OAuth Redirect Loop

**Issue**: After Google authentication, users were stuck in a redirect loop.

**Solution**:
- Added proper callback route at `/auth/callback` to handle the OAuth code exchange
- Configured correct redirect URLs in both Supabase and Google Cloud Console
- Ensured session cookies were properly set before redirecting to dashboard

### Problem 4: Environment Variables Not Loading

**Issue**: Supabase client couldn't connect due to undefined environment variables.

**Solution**:
- Prefixed public variables with `NEXT_PUBLIC_` for client-side access
- Created `.env.local.example` as a template for required variables
- Documented all required environment variables in README

### Problem 5: Optimistic UI Updates Causing Stale Data

**Issue**: Deleting bookmarks showed them briefly reappearing due to real-time sync.

**Solution**:
- Implemented optimistic updates that immediately update local state
- Added proper error handling to revert optimistic updates on failure
- Ensured real-time subscription updates don't override optimistic changes

## Features

### Authentication
- Google OAuth integration via Supabase Auth
- Persistent sessions with automatic refresh
- Secure logout functionality

### Bookmark Management
- Create bookmarks with URL and title
- View all personal bookmarks in organized list
- Delete bookmarks with confirmation
- Real-time synchronization across all tabs

### Security
- Row Level Security (RLS) ensures data isolation
- Each user can only access their own bookmarks
- All database operations are authenticated
- HTTPS encryption via Vercel

### User Experience
- Loading indicators for all async operations
- Toast notifications for success/error feedback
- Responsive design for mobile and desktop
- Empty states with helpful messages

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
