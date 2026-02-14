'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/services/auth';

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await getSession();
        if (session) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to check auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="absolute top-0 w-full px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            BookmarkHub
          </span>
        </div>
        {!isLoading && (
          <Link
            href={isAuthenticated ? '/dashboard' : '/login'}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105 font-medium"
          >
            {isAuthenticated ? 'Dashboard' : 'Login'}
          </Link>
        )}
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Real-time sync across all devices
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="block text-gray-900">Organize Your</span>
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Bookmarks Smartly
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl sm:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Save, manage, and access your favorite links from anywhere. 
            Experience real-time synchronization across all your devices.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <button
              onClick={handleGetStarted}
              disabled={isLoading}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
            </button>
            <a
              href="#features"
              className="px-8 py-4 bg-white text-gray-700 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105 font-semibold text-lg border border-gray-200"
            >
              Learn More
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">100%</div>
              <div className="text-sm text-gray-600 mt-1">Free Forever</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">&lt;1s</div>
              <div className="text-sm text-gray-600 mt-1">Real-time Sync</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">🔒</div>
              <div className="text-sm text-gray-600 mt-1">Secure & Private</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to manage bookmarks
            </h2>
            <p className="text-xl text-gray-600">
              Simple, fast, and powerful bookmark management
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-200 hover:scale-105">
              <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-gray-600">
                Add and access your bookmarks instantly with our optimized interface
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all duration-200 hover:scale-105">
              <div className="h-12 w-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Real-time Sync</h3>
              <p className="text-gray-600">
                Changes appear instantly across all your devices and browser tabs
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-all duration-200 hover:scale-105">
              <div className="h-12 w-12 bg-green-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Secure & Private</h3>
              <p className="text-gray-600">
                Your bookmarks are encrypted and only accessible by you
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto text-center text-gray-600">
          <p>Built with Next.js, Supabase, and Tailwind CSS</p>
        </div>
      </footer>
    </main>
  );
}
