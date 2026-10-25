import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { ShieldAlert, Users, Gamepad2, MessageSquare, Trash2, Edit, X, Save, Plus, Star, Shield, Search } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [games, setGames] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminSearch, setAdminSearch] = useState('');

  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentGameId, setCurrentGameId] = useState(null);
  const [gameFormData, setGameFormData] = useState({
    title: '',
    category: '',
    platform: '',
    releaseYear: '',
    description: '',
    imageCover: ''
  });

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const fetchData = () => {
    if (!token) {
      navigate('/login');
      return;
    }

    Promise.all([
      api.get('/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
      api.get('/admin/games', { headers: { Authorization: `Bearer ${token}` } }),
      api.get('/admin/reviews', { headers: { Authorization: `Bearer ${token}` } }),
      api.get('/admin/users', { headers: { Authorization: `Bearer ${token}` } })
    ])
    .then(([statsRes, gamesRes, reviewsRes, usersRes]) => {
      setStats(statsRes.data);
      setGames(gamesRes.data);
      setReviews(reviewsRes.data);
      setUsers(usersRes.data);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setError("Accès refusé ou erreur lors du chargement du dashboard.");
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const filteredAdminGames = games.filter(g => 
    g.title?.toLowerCase().includes(adminSearch.toLowerCase()) ||
    g.category?.toLowerCase().includes(adminSearch.toLowerCase()) ||
    g.platform?.toLowerCase().includes(adminSearch.toLowerCase())
  );

  const filteredAdminReviews = reviews.filter(r => 
    r.user?.username?.toLowerCase().includes(adminSearch.toLowerCase()) ||
    r.game?.title?.toLowerCase().includes(adminSearch.toLowerCase()) ||
    r.comment?.toLowerCase().includes(adminSearch.toLowerCase())
  );

  const filteredAdminUsers = users.filter(u => 
    u.username?.toLowerCase().includes(adminSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(adminSearch.toLowerCase())
  );

  const handleOpenCreateGameModal = () => {
    setModalMode('create');
    setCurrentGameId(null);
    setGameFormData({
      title: '',
      category: '',
      platform: '',
      releaseYear: new Date().getFullYear(),
      description: '',
      imageCover: ''
    });
    setIsGameModalOpen(true);
  };

  const handleOpenEditGameModal = (game) => {
    setModalMode('edit');
    setCurrentGameId(game.id);
    setGameFormData({
      title: game.title || '',
      category: game.category || '',
      platform: game.platform || '',
      releaseYear: game.releaseYear || '',
      description: game.description || '',
      imageCover: game.imageCover || ''
    });
    setIsGameModalOpen(true);
  };

  const handleSaveGame = (e) => {
    e.preventDefault();
    const request = modalMode === 'create'
      ? api.post('/admin/games', gameFormData, { headers: { Authorization: `Bearer ${token}` } })
      : api.put(`/admin/games/${currentGameId}`, gameFormData, { headers: { Authorization: `Bearer ${token}` } });

    request
      .then(() => {
        setIsGameModalOpen(false);
        fetchData();
      })
      .catch(err => alert("Erreur lors de l'enregistrement du jeu."));
  };

  const handleDeleteGame = (gameId) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce jeu ?")) return;
    api.delete(`/admin/games/${gameId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => fetchData())
      .catch(err => alert("Erreur lors de la suppression du jeu."));
  };

  const handleDeleteReview = (reviewId) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet avis ?")) return;
    api.delete(`/admin/reviews/${reviewId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => fetchData())
      .catch(err => alert("Erreur lors de la suppression de l'avis."));
  };

  const handleToggleAdminRole = (userToUpdate) => {
    const isAdmin = userToUpdate.roles?.includes('ROLE_ADMIN');
    const newRoles = isAdmin ? ['ROLE_USER'] : ['ROLE_USER', 'ROLE_ADMIN'];

    const confirmMessage = isAdmin
      ? `Retirer les droits d'administrateur à ${userToUpdate.username} ?`
      : `Nommer ${userToUpdate.username} administrateur ?`;

    if (!window.confirm(confirmMessage)) return;

    api.put(`/admin/users/${userToUpdate.id}/roles`, { roles: newRoles }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => fetchData())
    .catch(err => alert("Erreur lors de la modification des rôles."));
  };

  const handleDeleteUser = (userId) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) return;
    api.delete(`/admin/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => fetchData())
      .catch(err => alert("Erreur lors de la suppression de l'utilisateur."));
  };

  if (loading) return <div className="min-h-screen bg-slate-950 text-cyan-400 p-10 text-center font-medium">Chargement...</div>;
  
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Accès Restreint</h1>
          <p className="text-slate-400 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col w-full">
      <Navbar />

      <div className="max-w-7xl mx-auto p-6 w-full flex-1">
        <h1 className="text-3xl font-extrabold mb-6 flex items-center space-x-3">
          <span>👑</span>
          <span className="text-cyan-400">Tableau de bord Administrateur</span>
        </h1>

        <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-800 pb-4">
          <button 
            onClick={() => { setActiveTab('stats'); setAdminSearch(''); }}
            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'stats' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
          >
            Vue d'ensemble
          </button>
          <button 
            onClick={() => { setActiveTab('games'); setAdminSearch(''); }}
            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'games' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
          >
            Gérer les jeux ({games.length})
          </button>
          <button 
            onClick={() => { setActiveTab('reviews'); setAdminSearch(''); }}
            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'reviews' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
          >
            Modérer les avis ({reviews.length})
          </button>
          <button 
            onClick={() => { setActiveTab('users'); setAdminSearch(''); }}
            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'users' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
          >
            Utilisateurs ({users.length})
          </button>
        </div>

        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center space-x-4">
              <div className="bg-cyan-500/10 p-4 rounded-xl text-cyan-400 border border-cyan-500/20"><Gamepad2 className="w-8 h-8" /></div>
              <div><p className="text-slate-400 text-sm">Jeux total</p><p className="text-2xl font-bold text-white">{stats?.totalGames}</p></div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center space-x-4">
              <div className="bg-orange-500/10 p-4 rounded-xl text-orange-400 border border-orange-500/20"><Users className="w-8 h-8" /></div>
              <div><p className="text-slate-400 text-sm">Utilisateurs inscrits</p><p className="text-2xl font-bold text-white">{stats?.totalUsers}</p></div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center space-x-4">
              <div className="bg-amber-500/10 p-4 rounded-xl text-amber-400 border border-amber-500/20"><MessageSquare className="w-8 h-8" /></div>
              <div><p className="text-slate-400 text-sm">Avis publiés</p><p className="text-2xl font-bold text-white">{stats?.totalReviews}</p></div>
            </div>
          </div>
        )}

        {activeTab === 'games' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
              <h2 className="text-xl font-bold">Liste des jeux</h2>
              
              <div className="flex items-center space-x-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-cyan-400" />
                  <input 
                    type="text" 
                    placeholder="Filtrer les jeux..." 
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <button 
                  onClick={handleOpenCreateGameModal}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 rounded-lg text-sm font-bold flex items-center space-x-2 transition shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter un jeu</span>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 text-sm border-b border-slate-800">
                    <th className="p-4">Titre</th>
                    <th className="p-4">Catégorie</th>
                    <th className="p-4">Plateforme</th>
                    <th className="p-4">Note moyenne</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {filteredAdminGames.map(game => (
                    <tr key={game.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4 font-semibold">{game.title}</td>
                      <td className="p-4 text-slate-300">{game.category}</td>
                      <td className="p-4 text-slate-300">{game.platform}</td>
                      <td className="p-4 text-orange-400 font-bold">{game.averageRating ? game.averageRating.toFixed(1) : "N/A"}</td>
                      <td className="p-4 text-right space-x-2">
                        <button 
                          onClick={() => handleOpenEditGameModal(game)}
                          className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 p-2 rounded-lg transition"
                          title="Modifier le jeu"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteGame(game.id)}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 p-2 rounded-lg transition"
                          title="Supprimer le jeu"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
              <h2 className="text-xl font-bold">Modération des avis</h2>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-cyan-400" />
                <input 
                  type="text" 
                  placeholder="Filtrer par auteur, jeu..." 
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 text-sm border-b border-slate-800">
                    <th className="p-4">Utilisateur</th>
                    <th className="p-4">Jeu</th>
                    <th className="p-4">Note</th>
                    <th className="p-4">Commentaire</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {filteredAdminReviews.map(review => (
                    <tr key={review.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4 font-semibold text-cyan-400">{review.user ? review.user.username : 'Inconnu'}</td>
                      <td className="p-4 text-slate-300">{review.game ? review.game.title : 'Jeu supprimé'}</td>
                      <td className="p-4 text-orange-400 font-bold flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-orange-400" />
                        <span>{review.rating}/5</span>
                      </td>
                      <td className="p-4 text-slate-300 max-w-xs truncate">{review.comment || 'Aucun commentaire'}</td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleDeleteReview(review.id)}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 p-2 rounded-lg transition"
                          title="Supprimer l'avis"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
              <h2 className="text-xl font-bold">Gestion des utilisateurs</h2>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-cyan-400" />
                <input 
                  type="text" 
                  placeholder="Filtrer par pseudo, email..." 
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 text-sm border-b border-slate-800">
                    <th className="p-4">Nom d'utilisateur</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Rôles</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {filteredAdminUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4 font-semibold flex items-center space-x-2">
                        <Users className="w-4 h-4 text-cyan-400" />
                        <span>{u.username}</span>
                      </td>
                      <td className="p-4 text-slate-300">{u.email}</td>
                      <td className="p-4">
                        {u.roles?.includes('ROLE_ADMIN') ? (
                          <span className="bg-orange-500/10 border border-orange-500/20 text-orange-400 px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center space-x-1">
                            <Shield className="w-3 h-3" />
                            <span>Admin</span>
                          </span>
                        ) : (
                          <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full text-xs font-semibold">
                            Utilisateur
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button 
                          onClick={() => handleToggleAdminRole(u)}
                          className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 p-2 rounded-lg transition"
                          title={u.roles?.includes('ROLE_ADMIN') ? "Retirer l'accès Admin" : "Rendre Admin"}
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(u.id)}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 p-2 rounded-lg transition"
                          title="Supprimer l'utilisateur"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {isGameModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-xl font-bold text-white">
                {modalMode === 'create' ? 'Ajouter un nouveau jeu' : `Modifier "${gameFormData.title}"`}
              </h3>
              <button onClick={() => setIsGameModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGame} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Titre du jeu</label>
                <input 
                  type="text"
                  value={gameFormData.title}
                  onChange={e => setGameFormData({...gameFormData, title: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Catégorie</label>
                  <input 
                    type="text"
                    value={gameFormData.category}
                    onChange={e => setGameFormData({...gameFormData, category: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Plateforme</label>
                  <input 
                    type="text"
                    value={gameFormData.platform}
                    onChange={e => setGameFormData({...gameFormData, platform: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Année de sortie</label>
                <input 
                  type="number"
                  value={gameFormData.releaseYear}
                  onChange={e => setGameFormData({...gameFormData, releaseYear: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">URL de l'image de couverture</label>
                <input 
                  type="text"
                  value={gameFormData.imageCover}
                  onChange={e => setGameFormData({...gameFormData, imageCover: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Description</label>
                <textarea 
                  rows="3"
                  value={gameFormData.description}
                  onChange={e => setGameFormData({...gameFormData, description: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-cyan-400"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setIsGameModalOpen(false)} className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-medium">
                  Annuler
                </button>
                <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 rounded-lg text-sm font-bold flex items-center space-x-2">
                  <Save className="w-4 h-4" />
                  <span>Enregistrer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}