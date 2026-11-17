import React, { useState, useEffect } from 'react';

const PASSCODE_KEY = 'sport25_admin_auth';

function checkPasscode(input: string): boolean {
  return input === 'Yumaryumar25';
}

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(PASSCODE_KEY);
    if (stored === 'granted') setAuthed(true);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (checkPasscode(input)) {
      sessionStorage.setItem(PASSCODE_KEY, 'granted');
      setAuthed(true);
      setError(false);
    } else {
      setError(true);
      setInput('');
    }
  }

  if (authed) return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <img src="/sport25_icon.svg" alt="SPORT25" className="w-8 h-8 opacity-80" />
          <span className="text-sm font-semibold text-muted">
            Admin access
          </span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-bg-soft border border-line rounded-card p-8 shadow-sm"
        >
          <h1 className="text-card-lg font-bold font-display text-ink mb-1">
            Protected area
          </h1>
          <p className="text-sm text-muted mb-6">
            Enter your passcode to continue.
          </p>

          <label className="block text-label font-bold text-ink mb-2">
            Passcode
          </label>
          <div className="relative mb-5">
            <input
              type={show ? 'text' : 'password'}
              value={input}
              onChange={e => { setInput(e.target.value); setError(false); }}
              autoFocus
              autoComplete="current-password"
              placeholder="••••••••••••"
              className={`w-full bg-white border ${
                error ? 'border-alert' : 'border-line'
              } rounded-card px-4 py-2.5 text-ink text-sm outline-none focus:border-brand transition-colors duration-150 pr-12`}
            />
            <button
              type="button"
              onClick={() => setShow(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-ink text-xs transition-colors duration-150"
              tabIndex={-1}
            >
              {show ? 'Hide' : 'Show'}
            </button>
          </div>

          {error && (
            <p className="text-alert text-xs mb-4 font-medium">
              Incorrect passcode. Try again.
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-brand hover:bg-brand-600 text-white font-semibold text-sm h-10 rounded-card transition-colors duration-150"
          >
            Unlock
          </button>
        </form>

        <p className="text-center text-xs text-subtle mt-6">
          SPORT25 · Admin
        </p>
      </div>
    </div>
  );
}
