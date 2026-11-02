import { useAuth0 } from '@auth0/auth0-react';
import { Link, useLocation } from 'react-router-dom';
import { normalizeAuth0User } from '../services/auth';
import { Login } from './Login';

/**
 * AuthWrapper — Central Auth0 Wrapper Page & Layout
 *
 * Replaces Firebase authentication gating across the application.
 * Provides:
 * 1. Branded loading screen while Auth0 verifies credentials.
 * 2. Error handling banner if Auth0 encounters an authentication issue.
 * 3. Auth0 Login wrapper page when unauthenticated.
 * 4. Authenticated application shell with persistent navigation, user profile
 *    capsule (avatar, name, email, SSO badge), and Auth0 sign-out action.
 */
export function AuthWrapper({ children }) {
  const { isLoading, isAuthenticated, error, user, loginWithRedirect, logout } = useAuth0();
  const location = useLocation();

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center gap-6 p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30 animate-bounce">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="absolute -inset-2 border-2 border-purple-500/50 border-t-transparent rounded-full animate-spin"></div>
          </div>

          <div className="text-center">
            <h3 className="text-xl font-bold tracking-tight text-white">Car Garage</h3>
            <p className="text-sm text-slate-400 mt-1 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping"></span>
              Authenticating session with Auth0 SSO...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Authentication Error State
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-4">
        <div className="max-w-md w-full bg-red-950/40 border border-red-500/30 rounded-3xl p-8 backdrop-blur-xl shadow-2xl flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-400 mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Auth0 Authentication Error</h2>
          <p className="text-sm text-red-200/80 mb-6">{error.message || 'Unable to connect to Auth0 authorization server.'}</p>
          <button
            onClick={() => loginWithRedirect()}
            className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl font-semibold text-white shadow-lg transition-all"
          >
            Retry Login
          </button>
        </div>
      </div>
    );
  }

  // 3. Unauthenticated State → Render Auth0 Login Wrapper
  if (!isAuthenticated) {
    return <Login />;
  }

  // 4. Authenticated State → Wrap Application with Persistent Auth0 Navigation & Header
  const normalizedUser = normalizeAuth0User(user);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-purple-500/30 flex flex-col">
      {/* Top Persistent Auth0 Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand & Navigation */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-white to-blue-300">
                  Car Garage
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-white/10">
              <Link
                to="/"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  location.pathname === '/'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Collection
              </Link>
            </nav>
          </div>

          {/* User Profile Capsule & Logout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl py-1.5 px-3">
              {normalizedUser?.picture ? (
                <img
                  src={normalizedUser.picture}
                  alt={normalizedUser.displayName}
                  className="w-8 h-8 rounded-full border border-purple-400/40 object-cover shadow-sm"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                  {(normalizedUser?.displayName || 'U').charAt(0).toUpperCase()}
                </div>
              )}

              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-white truncate max-w-[130px]">
                  {normalizedUser?.displayName}
                </span>
                <span className="text-[10px] text-slate-400 truncate max-w-[130px]">
                  {normalizedUser?.email || 'Authenticated'}
                </span>
              </div>
            </div>

            <button
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              title="Sign Out of Auth0 session"
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-red-950/40 border border-slate-700 hover:border-red-500/40 rounded-xl text-xs font-semibold text-slate-300 hover:text-red-300 transition-all shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {typeof children === 'function' ? children({ user: normalizedUser, logout }) : children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-4 px-6 text-center text-xs text-slate-500">
        Car Garage Collection
      </footer>
    </div>
  );
}

export default AuthWrapper;
