'use client';

import { useState, FormEvent } from 'react';
import { validateUrl, validateTitle } from '@/lib/utils/validation';
import LoadingSpinner from './LoadingSpinner';

interface BookmarkFormProps {
  onSubmit: (url: string, title: string) => Promise<void>;
}

export default function BookmarkForm({ onSubmit }: BookmarkFormProps) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [urlError, setUrlError] = useState('');
  const [titleError, setTitleError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setUrlError('');
    setTitleError('');
    setSubmitError('');

    // Client-side validation
    let hasError = false;
    
    if (!validateUrl(url)) {
      setUrlError('URL cannot be empty or whitespace only');
      hasError = true;
    }
    
    if (!validateTitle(title)) {
      setTitleError('Title cannot be empty or whitespace only');
      hasError = true;
    }

    if (hasError) {
      return;
    }

    // Submit
    setIsSubmitting(true);
    try {
      await onSubmit(url, title);
      // Clear form on success
      setUrl('');
      setTitle('');
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to create bookmark');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 p-4 sm:p-6 lg:p-8 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-200">
      <div>
        <label htmlFor="url" className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
          URL
        </label>
        <input
          type="text"
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isSubmitting}
          className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm sm:text-base ${
            urlError ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
          } disabled:bg-gray-50 disabled:cursor-not-allowed`}
          placeholder="https://example.com"
        />
        {urlError && (
          <p className="mt-2 text-xs sm:text-sm text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {urlError}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="title" className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSubmitting}
          className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm sm:text-base ${
            titleError ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
          } disabled:bg-gray-50 disabled:cursor-not-allowed`}
          placeholder="My Bookmark"
        />
        {titleError && (
          <p className="mt-2 text-xs sm:text-sm text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {titleError}
          </p>
        )}
      </div>

      {submitError && (
        <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs sm:text-sm text-red-600">{submitError}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-4 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-2 text-sm sm:text-base font-semibold"
      >
        {isSubmitting && <LoadingSpinner size="sm" className="border-white border-t-transparent" />}
        {isSubmitting ? 'Adding...' : 'Add Bookmark'}
      </button>
    </form>
  );
}
