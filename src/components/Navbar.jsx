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
    <nav className="bg-slate-950 border-b border-slate-800 px-8 py-4 flex justify-between items-center w-full sticky top-0 z-50 shadow-xl shadow-black/50">
      {/* Logo et Nom du site */}
      <Link to="/" className="flex items-center space-x-4 group">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-amber-500 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-300"></div>
          <img 
            src={logo} 
            alt="GameHub Logo" 
            className="relative h-12 w-auto object-contain transform group-hover:scale-105 transition duration-300" 
          />
        </div>
        <span className="text-2xl font-black tracking-widest uppercase font-sans">
          <span className="text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]">GAME</span>
          <span className="text-amber-500 drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]">HUB</span>
        </span>
      </Link>

      {/* Actions de navigation (taille augmentée pour un meilleur confort visuel) */}
      <div className="flex items-center space-x-5">
        {isAdmin && (
          isAdminPage ? (
            <Link 
              to="/" 
              className="flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 px-4 py-2.5 rounded-xl text-base font-bold transition shadow-md"
            >
              <ArrowLeft className="w-5 h-5 text-amber-400" />
              <span>Retour au catalogue</span>
            </Link>
          ) : (
            <Link 
              to="/admin" 
              className="flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 px-4 py-2.5 rounded-xl text-base font-bold transition shadow-md"
            >
              <Shield className="w-5 h-5" />
              <span>Administration</span>
            </Link>
          )
        )}

        {token ? (
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-slate-300 px-4.5 py-2.5 rounded-xl text-base font-medium transition border border-slate-800"
          >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        ) : (
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="text-slate-300 hover:text-cyan-400 text-base font-medium transition px-3 py-2"
            >
              Connexion
            </Link>
            <Link
              to="/register"
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-6 py-3 rounded-xl text-base font-extrabold transition shadow-lg shadow-cyan-500/25"
            >
              Inscription
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}