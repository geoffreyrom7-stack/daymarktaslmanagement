import { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { ArrowRight, Check, Circle, ListTodo, LoaderCircle, Moon, Sun } from 'lucide-react';
import { auth, firebaseConfigured } from '../firebase';

export default function AuthScreen({ theme, onToggleTheme }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const runAuth = async (action) => {
    setError('');
    setBusy(true);
    try {
      await action();
    } catch (authError) {
      setError(authError.message);
    } finally {
      setBusy(false);
    }
  };

  const handleEmailAuth = async (event) => {
    event.preventDefault();
    await runAuth(async () => {
      if (mode === 'register') {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: name.trim() });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    });
  };

  const handleGoogleAuth = () => runAuth(() => signInWithPopup(auth, new GoogleAuthProvider()));

  return (
    <main className="auth-layout">
      <section className="auth-brand">
        <a className="brand-lockup" href="/" aria-label="Daymark home">
          <span className="brand-icon"><ListTodo size={21} /></span>
          <span>daymark</span>
        </a>
        <div className="brand-copy">
          <span className="eyebrow light-eyebrow">MAKE SPACE FOR WHAT MATTERS</span>
          <h1>Small steps.<br />Big momentum.</h1>
          <p>A quieter way to organize your day, keep promises to yourself, and make progress that lasts.</p>
          <div className="auth-preview">
            <div className="preview-heading"><span>Today’s focus</span><span>3 of 5 done</span></div>
            <div className="preview-progress"><span /></div>
            <div className="preview-task done"><span className="preview-check"><Check size={12} /></span><span>Plan the week ahead</span></div>
            <div className="preview-task"><span className="preview-check empty" /><span>Send project update</span><span className="preview-priority">HIGH</span></div>
            <div className="preview-task"><span className="preview-check empty" /><span>Take a proper lunch break</span></div>
          </div>
        </div>
        <div className="brand-footer">A little more intentional, every day.</div>
      </section>

      <section className="auth-panel">
        <button className="auth-theme-toggle" type="button" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`} aria-pressed={theme === 'dark'} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`} onClick={onToggleTheme}>
          {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
          <span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
        </button>
        <div className="auth-card">
          <div className="mobile-brand brand-lockup"><span className="brand-icon"><ListTodo size={20} /></span><span>daymark</span></div>
          <span className="eyebrow">YOUR PERSONAL WORKSPACE</span>
          <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
          <p className="auth-subtitle">{mode === 'login' ? 'Sign in to pick up where you left off.' : 'Start building a calmer, more focused day.'}</p>

          {!firebaseConfigured && (
            <div className="inline-alert" role="alert">
              Firebase is not configured. Copy <code>.env.example</code> to <code>.env.local</code>, enter the Web app settings from Firebase Console, and restart the Vite server.
            </div>
          )}
          {error && <div className="inline-alert" role="alert">{error}</div>}

          <button className="google-button" type="button" disabled={busy || !firebaseConfigured} onClick={handleGoogleAuth}>
            {busy ? <LoaderCircle className="spin" size={18} /> : <GoogleMark />}
            Continue with Google
          </button>
          <div className="divider"><span />or continue with email<span /></div>

          <form className="auth-form" onSubmit={handleEmailAuth}>
            {mode === 'register' && (
              <label>
                <span>Your name</span>
                <input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={80} placeholder="Alex Morgan" />
              </label>
            )}
            <label>
              <span>Email address</span>
              <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@example.com" />
            </label>
            <label>
              <span>Password</span>
              <input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} placeholder="At least 6 characters" />
            </label>
            <button className="primary-button auth-submit" type="submit" disabled={busy || !firebaseConfigured}>
              {busy ? <LoaderCircle className="spin" size={18} /> : <>{mode === 'login' ? 'Sign in' : 'Create account'} <ArrowRight size={17} /></>}
            </button>
          </form>

          <p className="auth-switch">
            {mode === 'login' ? 'New to Daymark?' : 'Already have an account?'}
            <button type="button" onClick={() => { setError(''); setMode(mode === 'login' ? 'register' : 'login'); }}>
              {mode === 'login' ? 'Create an account' : 'Sign in'}
            </button>
          </p>
          <p className="auth-privacy"><Circle size={7} fill="currentColor" /> Your tasks are private and only visible to you.</p>
        </div>
      </section>
    </main>
  );
}

function GoogleMark() {
  return <svg aria-hidden="true" viewBox="0 0 48 48" className="google-mark"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" transform="translate(0 4)" /><path fill="#4285F4" d="M47.98 24.55c0-1.57-.15-3.09-.39-4.55H24v9.02h13.46c-.58 2.96-2.26 5.48-4.75 7.18l7.73 6C45.04 37.83 48 31.7 48 24.55h-.02Z" transform="translate(0 0)" /><path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.93 23.93 0 0 0 0 21.56l7.98-6.19Z" transform="translate(0 0)" /><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.73-6c-2.14 1.45-4.88 2.3-8.17 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" transform="translate(0 0)" /></svg>;
}
