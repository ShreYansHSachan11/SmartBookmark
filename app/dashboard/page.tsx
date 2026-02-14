'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { getSession, signOut } from '@/lib/services/auth';
import { createBookmark, getBookmarks, deleteBookmark, subscribeToBookmarks } from '@/lib/services/bookmarks';
import { Bookmark } from '@/types/database';
import BookmarkForm from '@/components/BookmarkForm';
import BookmarkList from '@/components/BookmarkList';

export default function Dashboard() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    // Check authentication and fetch bookmarks
    const initialize = async () => {
      try {
        const session = await getSession();
        
        if (!session) {
          router.push('/login');
          return;
        }

        setIsAuthenticated(true);
        setUserName(session.user.user_metadata?.full_name || '');
        setUserEmail(session.user.email);
        
        // Fetch bookmarks
        const fetchedBookmarks = await getBookmarks();
        setBookmarks(fetchedBookmarks);
      } catch (error) {
        console.error('Failed to initialize dashboard:', error);
        toast.error('Failed to load dashboard');
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [router]);

  useEffect(() => {
    // Subscribe to real-time bookmark changes
    if (!isAuthenticated) {
      return;
    }

    const unsubscribe = subscribeToBookmarks((updatedBookmarks) => {
      setBookmarks(updatedBookmarks);
    });

    // Clean up subscription on component unmount
    return () => {
      unsubscribe();
    };
  }, [isAuthenticated]);

  const handleCreateBookmark = async (url: string, title: string) => {
    // Create optimistic bookmark with temporary ID
    const optimisticBookmark: Bookmark = {
      id: `temp-${Date.now()}`,
      user_id: '',
      url,
      title,
      created_at: new Date().toISOString()
    };

    // Update UI immediately (optimistic update)
    setBookmarks((prev) => [optimisticBookmark, ...prev]);

    try {
      const newBookmark = await createBookmark(url, title);
      // Replace optimistic bookmark with real one
      setBookmarks((prev) => 
        prev.map((b) => (b.id === optimisticBookmark.id ? newBookmark : b))
      );
      toast.success('Bookmark created successfully!');
    } catch (error) {
      // Revert on error - remove optimistic bookmark
      setBookmarks((prev) => 
        prev.filter((b) => b.id !== optimisticBookmark.id)
      );
      toast.error('Failed to create bookmark');
      throw error; // Re-throw so BookmarkForm can handle the error
    }
  };

  const handleDeleteBookmark = async (id: string) => {
    // Store the bookmark in case we need to revert
    const bookmarkToDelete = bookmarks.find((b) => b.id === id);
    
    if (!bookmarkToDelete) {
      return;
    }

    // Update UI immediately (optimistic update)
    setBookmarks((prev) => prev.filter((bookmark) => bookmark.id !== id));

    try {
      await deleteBookmark(id);
      toast.success('Bookmark deleted successfully!');
    } catch (error) {
      // Revert on error - restore the deleted bookmark
      setBookmarks((prev) => {
        // Insert back in the correct position based on created_at
        const newBookmarks = [...prev, bookmarkToDelete];
        return newBookmarks.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
      toast.error('Failed to delete bookmark');
      throw error; // Re-throw so BookmarkList can handle the error
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully!');
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to logout');
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Toaster position="top-right" />
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">BookmarkHub</h1>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            {/* User Info */}
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-gray-900">{userName || userEmail}</span>
              <span className="text-xs text-gray-500">{userName ? userEmail : ''}</span>
            </div>
            {/* User Avatar */}
            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
              {(userName || userEmail).charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm sm:text-base bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 hover:shadow-md active:scale-95"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="space-y-6 sm:space-y-8">
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <span className="h-1 w-1 bg-blue-600 rounded-full"></span>
              Add New Bookmark
            </h2>
            <BookmarkForm onSubmit={handleCreateBookmark} />
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <span className="h-1 w-1 bg-blue-600 rounded-full"></span>
              Your Bookmarks
              <span className="ml-2 px-2 py-0.5 text-xs sm:text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                {bookmarks.length}
              </span>
            </h2>
            <BookmarkList
              bookmarks={bookmarks}
              onDelete={handleDeleteBookmark}
              isLoading={isLoading}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
