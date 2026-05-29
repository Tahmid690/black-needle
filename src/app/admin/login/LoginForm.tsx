'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/admin/dashboard');
        router.refresh();
      } else {
        setError(data.error || 'Incorrect password');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md p-8 border border-neutral-200 bg-white">
      <div className="text-center mb-8">
        <span className="text-[10px] tracking-[0.3em] font-semibold text-neutral-400 block mb-2 uppercase">
          SECURITY ACCESS
        </span>
        <h1 className="text-3xl font-light uppercase tracking-[0.15em] text-neutral-900 font-serif">
          BLACK NEEDLE
        </h1>
        <p className="mt-2 text-xs text-neutral-500 tracking-widest uppercase">
          Enter admin credentials to proceed
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="password"
            className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2"
          >
            Admin Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-neutral-200 text-sm font-mono tracking-wider focus:outline-none focus:border-neutral-900 transition-colors bg-white text-neutral-900"
            placeholder="••••••••••••"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-xs px-4 py-3 flex items-center space-x-2">
            <svg className="w-4 h-4 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium tracking-wide uppercase text-[10px]">{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold tracking-widest py-4 px-6 uppercase transition-colors disabled:bg-neutral-400"
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
