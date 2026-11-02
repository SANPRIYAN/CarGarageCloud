import { useAuth0 } from '@auth0/auth0-react';

export function Login() {
  const { loginWithRedirect, isLoading } = useAuth0();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950/60 to-slate-950 text-white p-4 relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-purple-600/30 rounded-full filter blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-600/30 rounded-full filter blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl flex flex-col items-center relative z-10">
        
        {/* Brand Icon */}
        <div className="w-16 h-16 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg mb-5 shadow-purple-500/30">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>

        {/* Title & Tagline */}
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-white to-blue-300 text-center">
          Car Garage
        </h1>
        <p className="text-slate-300 mb-8 text-center text-sm font-medium">
          Cloud-native vehicle collection and garage management platform.
        </p>

        {/* Login CTA */}
        <button
          id="login-btn"
          onClick={() => loginWithRedirect()}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 px-6 py-4 rounded-xl font-bold shadow-xl hover:bg-gray-100 transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100 cursor-pointer"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
              Connecting...
            </span>
          ) : (
            <>
              {/* Lock/Key icon */}
              <svg className="w-5 h-5 flex-shrink-0 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Sign In to Continue</span>
            </>
          )}
        </button>

        <p className="text-[11px] text-slate-400 mt-5 text-center">
          Secure authentication using Single Sign-On (SSO).
        </p>
      </div>
    </div>
  );
}

export default Login;
