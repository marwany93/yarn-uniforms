'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔵 Auth: Starting authentication check...');
    let isSubscribed = true;

    // HARD TIMEOUT: Force loading to false after 2 seconds
    const timeoutId = setTimeout(() => {
      if (isSubscribed && loading) {
        console.log('⏰ Auth: TIMEOUT HIT! Forcing loading to false');
        setLoading(false);
        setUser(null);
      }
    }, 2000);

    console.log('🔵 Auth: Setting up onAuthStateChanged listener');

    // Firebase auth state listener
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        console.log('✅ Auth: Firebase responded! User:', currentUser ? 'LOGGED IN' : 'NOT LOGGED IN');
        
        if (!isSubscribed) {
          console.log('⚠️ Auth: Component unmounted, ignoring response');
          return;
        }

        clearTimeout(timeoutId);
        setUser(currentUser);
        setLoading(false);
        console.log('🟢 Auth: State updated. Loading=false, User=', currentUser?.email || 'null');
      },
      (error) => {
        console.error('❌ Auth: Error from Firebase:', error.message);
        
        if (!isSubscribed) return;

        clearTimeout(timeoutId);
        setUser(null);
        setLoading(false);
        console.log('🔴 Auth: Error handled. Loading=false, User=null');
      }
    );

    console.log('🔵 Auth: Listener setup complete');

    // Cleanup function
    return () => {
      console.log('🧹 Auth: Cleaning up...');
      isSubscribed = false;
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  // Log current state whenever it changes
  useEffect(() => {
    console.log(`📊 Auth State: loading=${loading}, user=${user?.email || 'null'}, isAuthenticated=${!!user}`);
  }, [loading, user]);

  const value = {
    user,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;