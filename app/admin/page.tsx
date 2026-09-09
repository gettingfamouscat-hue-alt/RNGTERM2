'use client';

import { useState, useEffect } from 'react';
import { adminLogin, checkAdminAuth, adminLogout } from './actions';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const authed = await checkAdminAuth();
      setIsAuthenticated(authed);
    } catch (e) {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoggingIn(true);
    
    try {
      const result = await adminLogin(username, password);
      if (result.success) {
        setIsAuthenticated(true);
      } else {
        setError(result.error || 'Login failed');
        setPassword('');
      }
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleLogout() {
    await adminLogout();
    setIsAuthenticated(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-xl text-muted animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center p-4">
        {/* Ambient gradient */}
        <div className="fixed inset-0 bg-gradient-radial from-red-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div 
            className="rounded-2xl border-2 p-8 relative backdrop-blur-sm"
            style={{
              backgroundColor: 'var(--bg-panel)',
              borderColor: '#ef4444',
            }}
          >
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-red-400" />
            <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-red-400" />
            <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-red-400" />
            <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-red-400" />
            
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-block px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-medium uppercase tracking-wider mb-4">
                Restricted Access
              </div>
              <h1 className="text-3xl font-bold text-red-400 mb-2">
                <span className="text-red-600">#</span> Admin Terminal
              </h1>
              <p className="text-sm text-red-600/80">
                Authorized personnel only
              </p>
            </div>
            
            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs text-red-600 uppercase tracking-wider mb-2 font-medium">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 text-primary focus:border-red-400 outline-none transition-smooth font-mono"
                  style={{
                    backgroundColor: 'var(--bg-void)',
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                  }}
                  required
                  autoComplete="username"
                  disabled={loggingIn}
                />
              </div>
              
              <div>
                <label className="block text-xs text-red-600 uppercase tracking-wider mb-2 font-medium">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 text-primary focus:border-red-400 outline-none transition-smooth font-mono"
                  style={{
                    backgroundColor: 'var(--bg-void)',
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                  }}
                  required
                  autoComplete="current-password"
                  disabled={loggingIn}
                />
              </div>
              
              {error && (
                <div 
                  className="p-4 rounded-lg border text-sm"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderColor: '#ef4444',
                    color: '#fca5a5',
                  }}
                >
                  {error}
                </div>
              )}
              
              <button
                type="submit"
                disabled={loggingIn}
                className="w-full px-6 py-3.5 border-2 border-red-400 text-red-400 font-bold uppercase tracking-wider rounded-lg hover:bg-red-400 hover:text-void transition-smooth btn-press disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loggingIn ? 'Authenticating...' : 'Access System'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return <AdminDashboard onLogout={handleLogout} />;
}
