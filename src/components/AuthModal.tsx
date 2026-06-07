'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '../utils/supabase/client';
import { AlertCircle, Loader2, X } from 'lucide-react';

function AuthModalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authView = searchParams.get('auth'); // 'login', 'signup', or 'confirm'

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    // Reset state when view changes
    setError(null);
    setIsLoading(false);
    setIsGoogleLoading(false);
  }, [authView]);

  if (!authView) return null;

  const handleClose = () => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete('auth');
    const newUrl = newParams.toString() ? `?${newParams.toString()}` : window.location.pathname;
    router.push(newUrl, { scroll: false });
  };

  const handleEmailAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (authView === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setIsLoading(false);
      } else {
        router.push('/app/problems');
        router.refresh();
      }
    } else if (authView === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        setIsLoading(false);
      } else {
        router.push(`?auth=confirm&email=${encodeURIComponent(email)}`, { scroll: false });
      }
    }
  };

  const handleGoogleAction = async () => {
    setIsGoogleLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-900/40 animate-in fade-in duration-200">
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={handleClose}></div>

      <div className="relative bg-white border border-gray-200 rounded-xl p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {authView === 'confirm' ? (
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight mb-2">Check your email</h1>
            <p className="text-sm text-gray-500 mb-6">
              We sent a confirmation link to <span className="font-medium text-gray-900">{searchParams.get('email') || 'your email'}</span>
            </p>
            <a
              href="https://mail.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full border border-gray-200 text-gray-700 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors duration-150 inline-block mb-4"
            >
              Open Gmail
            </a>
            <button
              onClick={() => router.push('?auth=login', { scroll: false })}
              className="text-sm text-gray-500 hover:text-gray-900 hover:underline"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight text-center">
              {authView === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-sm text-gray-500 mb-6 text-center">
              {authView === 'login' ? 'Sign in to your account' : 'Start reviewing smarter'}
            </p>

            <form onSubmit={handleEmailAction} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-signal focus:outline-none"
                />
              </div>

              <div>
                {authView === 'login' ? (
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                      Password
                    </label>
                    <a href="#" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
                      Forgot?
                    </a>
                  </div>
                ) : (
                  <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">
                    Password
                  </label>
                )}
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-signal focus:outline-none"
                />
                {authView === 'signup' && (
                  <p className="text-xs text-gray-400 mt-1">At least 8 characters</p>
                )}
              </div>

              {error && (
                <div className="border border-red-200 bg-red-50 rounded-lg p-3 text-xs text-red-700 flex items-start gap-2 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full bg-gray-900 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-2 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="font-mono">
                      {authView === 'login' ? 'Signing in…' : 'Creating…'}
                    </span>
                  </>
                ) : (
                  authView === 'login' ? 'Sign in' : 'Create account'
                )}
              </button>
            </form>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-xs text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleAction}
              disabled={isLoading || isGoogleLoading}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-150 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="font-mono">
                    {authView === 'login' ? 'Signing in…' : 'Creating…'}
                  </span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    <path fill="none" d="M0 0h48v48H0z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-500 mt-4">
              {authView === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => router.push(authView === 'login' ? '?auth=signup' : '?auth=login', { scroll: false })}
                className="text-gray-900 font-medium hover:underline focus:outline-none"
              >
                {authView === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export function AuthModal() {
  return (
    <Suspense fallback={null}>
      <AuthModalContent />
    </Suspense>
  );
}
