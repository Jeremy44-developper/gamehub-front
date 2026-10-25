import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { LogIn, Mail, Lock } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    api.post('/login_check', { email, password })
      .then(response => {
        localStorage.setItem('token', response.data.token);
        navigate('/');
      })
      .catch(err => {
        console.error(err);
        setError('Email ou mot de passe incorrect.');
      });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col w-full">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="text-center mb-8">
            <div className="bg-cyan-500/10 border border-cyan-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-cyan-400 shadow-inner">
              <LogIn className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">Connexion à GameHub</h1>
            <p className="text-slate-400 text-sm mt-1">Prêt à reprendre l'aventure ?</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="votre@email.com" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400 transition"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold py-3 rounded-xl transition shadow-lg shadow-cyan-500/20 mt-2"
            >
              Se connecter
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-cyan-400 font-semibold hover:underline">
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}