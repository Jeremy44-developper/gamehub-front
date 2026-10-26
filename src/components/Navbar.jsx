import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, LogOut, ArrowLeft } from 'lucide-react';
import logo from '../assets/logo.png'; // Assure-toi que le chemin correspond à ton image

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');

  const isAdminPage = location.pathname.startsWith('/admin');

  const getUserRoles = () => {
    if (!token) return [];
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.roles || [];
    } catch {
      return [];
    }
  };

  const isAdmin = getUserRoles().includes('ROLE_ADMIN');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-slate-950 border-b border-slate-800 px-4 md:px-8 py-3 md:py-4 flex justify-between items-center w-full sticky top-0 z-50 shadow-xl shadow-black/50 overflow-hidden">
      {/* Logo et Nom du site */}
      <Link to="/" className="flex items-center space-x-2 md:space-x-4 group shrink-0">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-amber-500 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-300"></div>
          <img 
            src={logo} 
            alt="GameHub Logo" 
            className="relative h-9 md:h-12 w-auto object-contain transform group-hover:scale-105 transition duration-300" 
          />
        </div>
        <span className="text-xl md:text-2xl font-black tracking-widest uppercase font-sans">
          <span className="text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]">GAME</span>
          <span className="text-amber-500 drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]">HUB</span>
        </span>
      </Link>

      {/* Actions de navigation adaptées mobile (compactes) et desktop (grandes) */}
      <div className="flex items-center space-x-2 md:space-x-5 shrink-0">
        {isAdmin && (
          isAdminPage ? (
            <Link 
              to="/" 
              className="flex items-center space-x-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 px-3 py-2 md:px-4 md:py-2.5 rounded-xl text-xs md:text-base font-bold transition shadow-md whitespace-nowrap"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
              <span className="hidden sm:inline">Retour au catalogue</span>
              <span className="sm:hidden">Catalogue</span>
            </Link>
          ) : (
            <Link 
              to="/admin" 
              className="flex items-center space-x-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 px-3 py-2 md:px-4 md:py-2.5 rounded-xl text-xs md:text-base font-bold transition shadow-md whitespace-nowrap"
            >
              <Shield className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Administration</span>
              <span className="sm:hidden">Admin</span>
            </Link>
          )
        )}

        {token ? (
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1.5 md:space-x-2 bg-slate-900 hover:bg-slate-800 text-slate-300 px-3.5 py-2 md:px-4.5 md:py-2.5 rounded-xl text-xs md:text-base font-medium transition border border-slate-800 whitespace-nowrap"
          >
            <LogOut className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2 md:space-x-4">
            <Link
              to="/login"
              className="text-slate-300 hover:text-cyan-400 text-xs md:text-base font-medium transition px-2 py-1.5 md:px-3 md:py-2 whitespace-nowrap"
            >
              Connexion
            </Link>
            <Link
              to="/register"
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-3.5 py-2 md:px-6 md:py-3 rounded-xl text-xs md:text-base font-extrabold transition shadow-lg shadow-cyan-500/25 whitespace-nowrap"
            >
              Inscription
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}