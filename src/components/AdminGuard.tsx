import React, { useState, useEffect } from 'react';

const PASSCODE_KEY = 'wwcs_admin_auth';

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-10">
          <img src="/wildwest_icon.svg" alt="Wild West Crypto Show" className="w-8 h-8 opacity-80" />
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-500">
            Admin Access
          </span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl"
        >
          <h1 className="text-xl font-black text-white mb-1 tracking-tight">
            Protected Area
          </h1>
          <p className="text-xs text-zinc-500 mb-7">
            Enter your passcode to continue.
          </p>

          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
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
              className={`w-full bg-zinc-800 border ${
                error ? 'border-red-500' : 'border-zinc-700'
              } rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-amber-500 transition-colors pr-12`}
            />
            <button
              type="button"
              onClick={() => setShow(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs transition-colors"
              tabIndex={-1}
            >
              {show ? 'Hide' : 'Show'}
            </button>
          </div>

          {error && (
            <p className="text-red-400 text-xs mb-4 font-medium">
              Incorrect passcode. Try again.
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm py-3 rounded-lg transition-colors"
          >
            Unlock
          </button>
        </form>

        <p className="text-center text-[10px] text-zinc-700 mt-6 uppercase tracking-widest">
          Wild West Crypto Show · Admin
        </p>
      </div>
    </div>
  );
}
