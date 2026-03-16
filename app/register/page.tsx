'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaGamepad } from 'react-icons/fa';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create account');
        return;
      }

      const result = await signIn('credentials', { email, password, redirect: false });

      if (result?.error) {
        setError('Account created but failed to sign in. Please go to the login page.');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (_err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl shadow-black/20 p-8 border border-gray-100 dark:border-slate-700">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-primary-600 flex items-center justify-center mb-4 shadow-lg shadow-primary-600/30">
            <FaGamepad className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Your Account</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Start tracking your gaming journey</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="label">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input"
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="email" className="label">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="label">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="input"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="label">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="input"
              placeholder="Repeat your password"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
