import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

export function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500 text-slate-950 font-bold">
              CA
            </span>
            <div>
              <div className="font-semibold tracking-tight">CureAI</div>
              <div className="text-xs text-slate-400">
                AI-Powered Healthcare Monitoring
              </div>
            </div>
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            {user?.role === "doctor" && (
              <>
                <Link to="/doctor" className="hover:text-brand-500">
                  Doctor Dashboard
                </Link>
                <Link to="/search" className="hover:text-brand-500">
                  Search Patient
                </Link>
              </>
            )}
            {user?.role === "patient" && (
              <>
                <Link to="/patient" className="hover:text-brand-500">
                  Patient Dashboard
                </Link>
                <Link to="/profile" className="hover:text-brand-500">
                  Profile
                </Link>
              </>
            )}
            {!user && (
              <>
                <Link to="/login" className="hover:text-brand-500">
                  Login
                </Link>
                <Link to="/register" className="hover:text-brand-500">
                  Register
                </Link>
              </>
            )}
            {user && (
              <button onClick={handleLogout} className="btn-ghost">
                Logout
              </button>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-6">{children}</div>
      </main>
      <footer className="border-t border-slate-800 text-xs text-slate-500 py-3 text-center">
        CureAI · Academic demo · Do not use for real medical decisions.
      </footer>
    </div>
  );
}

