'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    console.log('🔒 ProtectedRoute: Checking auth...', { loading, isAuthenticated });
    
    // Only redirect if we're done loading and user is not authenticated
    if (!loading && !isAuthenticated) {
      console.log('🚫 ProtectedRoute: Not authenticated, redirecting to login');
      router.push('/admin/login');
    }
  }, [loading, isAuthenticated, router]);

  // Show loading while checking authentication
  if (loading) {
    console.log('⏳ ProtectedRoute: Still loading...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Verifying authentication...</p>
          <p className="text-sm text-gray-400 mt-2">Please wait a moment</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show nothing (redirect happens in useEffect)
  if (!isAuthenticated) {
    console.log('🚫 ProtectedRoute: Not authenticated, showing nothing');
    return null;
  }

  // User is authenticated, show protected content
  console.log('✅ ProtectedRoute: Authenticated! Showing protected content');
  return children;
};

export default ProtectedRoute;