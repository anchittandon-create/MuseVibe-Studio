import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Key } from 'lucide-react';

export default function Login() {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const { user, login } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && mobile.trim()) {
      login(name.trim(), mobile.trim());
    }
  };

  return (
    <div className="flex h-screen bg-background-dark text-slate-100 font-display items-center justify-center p-4">
      <div className="bg-surface-dark border border-border-dark rounded-xl p-8 max-w-md w-full">
        <div className="w-16 h-16 bg-gradient-to-tr from-primary to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-3xl">
          G
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 text-center">Welcome to Gemini Studio</h2>
        <p className="text-slate-400 text-center mb-6 text-sm">Enter your details to continue</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-darker border border-border-dark rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
              placeholder="e.g. Jane Doe"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Mobile Number</label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full bg-surface-darker border border-border-dark rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
              placeholder="e.g. +1 234 567 8900"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg shadow-lg shadow-primary/20 transition-all transform active:scale-[0.99] mt-6"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
