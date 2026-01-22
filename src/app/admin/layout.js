'use client';

import { AuthProvider } from '@/hooks/useAuth';

export default function AdminLayout({ children }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </AuthProvider>
  );
}