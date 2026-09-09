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
    
    const result = await adminLogin(username, password);
    if (result.success) {
      setIsAuthenticated(true);
    } else {
      setError(result.error || 'Login failed');
      setPassword('');
    }
  }

  async function handleLogout() {
    await adminLogout();
    setIsAuthenticated(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-black to-black pointer-events-none" />
        
        <div className="relative z-10 w-full max-w-md">
          <div className="border-2 border-red-500/50 bg-black/80 backdrop-blur-sm rounded-lg p-8 relative">
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-400" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-400" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-400" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-400" />
            
            <h1 className="text-3xl font-bold text-red-400 mb-2 uppercase tracking-widest text-center">
              &gt; Admin Access
            </h1>
            <p className="text-center text-red-600 text-sm mb-8 uppercase tracking-wider">
              Authorized Personnel Only
            </p>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm text-red-600 uppercase tracking-wider mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-black border-2 border-red-500/50 rounded text-red-400 focus:border-red-400 outline-none font-mono"
                  required
                  autoComplete="username"
                />
              </div>
              
              <div>
                <label className="block text-sm text-red-600 uppercase tracking-wider mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-black border-2 border-red-500/50 rounded text-red-400 focus:border-red-400 outline-none font-mono"
                  required
                  autoComplete="current-password"
                />
              </div>
              
              {error && (
                <div className="p-4 border border-red-500 bg-red-500/10 rounded text-red-400 text-sm">
                  {error}
                </div>
              )}
              
              <button
                type="submit"
                className="w-full px-6 py-3 border-2 border-red-400 text-red-400 font-bold uppercase tracking-wider rounded hover:bg-red-400 hover:text-black transition-all duration-200"
              >
                Access System
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return <AdminDashboard onLogout={handleLogout} />;
}
