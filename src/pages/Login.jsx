import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Gamepad2, LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    // Route gérée automatiquement par le bundle JWT de Symfony
    api.post('/login_check', { email, password })
      .then(res => {
        // On stocke le token JWT dans le localStorage
        localStorage.setItem('token', res.data.token);
        // Redirection vers l'accueil
        navigate('/');
      })
      .catch(() => {
        setError('Email ou mot de passe incorrect.');
      });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center p-6">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
        
        <div className="flex items-center justify-center space-x-3 mb-6">
          <Gamepad2 className="w-10 h-10 text-indigo-400" />
          <span className="text-2xl font-bold tracking-wider">Game<span className="text-indigo-400">Hub</span></span>
        </div>

        <h1 className="text-xl font-bold text-center mb-6">Connexion à GameHub</h1>

        {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Adresse Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500"
              placeholder="votre@email.com"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Mot de passe</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition duration-200">
            <LogIn className="w-5 h-5" />
            <span>Se connecter</span>
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Pas encore de compte ? <Link to="/register" className="text-indigo-400 hover:underline">S'inscrire</Link>
        </p>
      </div>
    </div>
  );
}