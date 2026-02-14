'use client';

import { useState } from 'react';
import { Bookmark } from '@/types/database';
import LoadingSpinner from './LoadingSpinner';

interface BookmarkListProps {
  bookmarks: Bookmark[];
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export default function BookmarkList({ bookmarks, onDelete, isLoading = false }: BookmarkListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string>('');

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setDeleteError('');
    
    try {
      await onDelete(id);
    } catch (error: any) {
      setDeleteError(error.message || 'Failed to delete bookmark');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12 sm:p-16 bg-white rounded-xl shadow-md">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="text-center p-8 sm:p-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-dashed border-gray-300">
        <svg className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
        <p className="text-base sm:text-lg text-gray-600 font-medium">No bookmarks yet</p>
        <p className="text-sm sm:text-base text-gray-500 mt-2">Add your first bookmark above to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {deleteError && (
        <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs sm:text-sm text-red-600">{deleteError}</p>
        </div>
      )}
      
      <ul className="grid gap-3 sm:gap-4 grid-cols-1">
        {bookmarks.map((bookmark) => (
          <li
            key={bookmark.id}
            className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 lg:p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all duration-200"
          >
            <div className="flex-1 min-w-0 mb-3 sm:mb-0 sm:mr-4 w-full sm:w-auto">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                {bookmark.title}
              </h3>
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 hover:underline truncate block mt-1 break-all sm:break-normal"
              >
                {bookmark.url}
              </a>
              <div className="flex items-center gap-2 mt-2">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs sm:text-sm text-gray-500">
                  {new Date(bookmark.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => handleDelete(bookmark.id)}
              disabled={deletingId === bookmark.id}
              className="w-full sm:w-auto min-w-[100px] px-4 py-2 sm:py-2.5 text-xs sm:text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md active:scale-95 flex items-center justify-center gap-2 font-medium"
            >
              {deletingId === bookmark.id && <LoadingSpinner size="sm" className="border-white border-t-transparent" />}
              {deletingId === bookmark.id ? 'Deleting...' : 'Delete'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
