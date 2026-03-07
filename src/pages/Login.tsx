/// <reference types="vite/client" />
import React, { useState } from 'react';
import { signInWithGoogle } from '../lib/firebase';
import { Music, AlertCircle } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { user, loading: authLoading } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (authLoading) {
    return <div className="flex h-screen bg-background-dark items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const isConfigured = !!import.meta.env.VITE_FIREBASE_API_KEY;

  const handleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background-dark text-slate-100 font-display items-center justify-center p-4">
      <div className="bg-surface-dark border border-border-dark rounded-xl p-8 max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Music size={32} className="text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-white">Welcome to Gemini Studio</h2>
        <p className="text-slate-400">Sign in to start creating AI-generated music.</p>
        
        {!isConfigured ? (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-left">
            <div className="flex items-center gap-2 text-red-400 font-bold mb-2">
              <AlertCircle size={18} />
              <span>Firebase Not Configured</span>
            </div>
            <p className="text-sm text-slate-300">
              Please add your Firebase configuration to the environment variables (VITE_FIREBASE_API_KEY, etc.) to enable login.
            </p>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-white text-black hover:bg-slate-200 font-bold py-3 rounded-lg shadow-lg transition-all transform active:scale-[0.99] flex items-center justify-center gap-3"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </button>
        )}
        
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>
    </div>
  );
}
