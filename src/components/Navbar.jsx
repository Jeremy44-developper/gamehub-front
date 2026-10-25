import { Link, useNavigate } from 'react-router-dom';
import { Gamepad2, LogOut, User, LogIn, UserPlus } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="bg-slate-800 border-b border-slate-700 py-4 px-6 sm:px-10 flex justify-between items-center shadow-md w-full">
      <Link to="/" className="flex items-center space-x-3 hover:opacity-85 transition">
        <Gamepad2 className="w-8 h-8 text-indigo-400" />
        <span className="text-xl font-bold tracking-wider">Game<span className="text-indigo-400">Hub</span></span>
      </Link>

      <div className="flex items-center space-x-4">
        {token ? (
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        ) : (
          <div className="flex items-center space-x-3">
            <Link 
              to="/login" 
              className="flex items-center space-x-1.5 text-slate-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition"
            >
              <LogIn className="w-4 h-4 text-indigo-400" />
              <span>Connexion</span>
            </Link>
            <Link 
              to="/register" 
              className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg shadow-indigo-600/20"
            >
              <UserPlus className="w-4 h-4" />
              <span>Inscription</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}