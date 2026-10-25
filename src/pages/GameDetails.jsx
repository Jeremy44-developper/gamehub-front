import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Star, ArrowLeft, Send, Gamepad2 } from 'lucide-react';

export default function GameDetails() {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // États pour le formulaire d'avis
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchGame = () => {
    api.get(`/games/${id}`)
      .then(res => {
        setGame(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchGame();
  }, [id]);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Vous devez être connecté pour poster un avis.');
      return;
    }

    api.post(`/games/${id}/reviews`, { rating: parseInt(rating), comment }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      setSuccess('Avis publié avec succès !');
      setComment('');
      fetchGame(); // Recharge les données pour actualiser la note moyenne et les avis
    })
    .catch(err => {
      setError(err.response?.data?.message || 'Une erreur est survenue.');
    });
  };

  if (loading) return <div className="min-h-screen bg-slate-900 text-white p-10 text-center">Chargement...</div>;
  if (!game) return <div className="min-h-screen bg-slate-900 text-white p-10 text-center">Jeu introuvable.</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col w-full">
      {/* Intégration de la Navbar dynamique */}
      <Navbar />

      <div className="max-w-4xl mx-auto p-6 w-full flex-1">
        <Link to="/" className="inline-flex items-center space-x-2 text-indigo-400 hover:underline mb-6">
          <ArrowLeft className="w-5 h-5" />
          <span>Retour au catalogue</span>
        </Link>

        {/* En-tête du jeu */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl mb-8">
          <div className="h-64 sm:h-80 bg-slate-700 relative">
            {game.imageCover ? (
              <img src={game.imageCover} alt={game.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><Gamepad2 className="w-20 h-20 text-slate-500" /></div>
            )}
          </div>
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
              <span className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-sm font-semibold">
                {game.category}
              </span>
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-lg">
                <Star className="w-6 h-6 fill-amber-400" />
                <span>{game.averageRating ? game.averageRating.toFixed(1) : "Pas encore noté"}</span>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-4">{game.title}</h1>
            <p className="text-slate-300 leading-relaxed mb-6">{game.description}</p>
            <div className="flex justify-between text-sm text-slate-400 border-t border-slate-700 pt-4">
              <span>Plateforme : <strong className="text-white">{game.platform}</strong></span>
              <span>Année de sortie : <strong className="text-white">{game.releaseYear}</strong></span>
            </div>
          </div>
        </div>

        {/* Section Avis */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-xl mb-8">
          <h2 className="text-2xl font-bold mb-6">Avis de la communauté</h2>

          {/* Formulaire d'ajout d'avis */}
          <form onSubmit={handleReviewSubmit} className="mb-8 bg-slate-900/50 p-6 rounded-xl border border-slate-700">
            <h3 className="text-lg font-semibold mb-4">Donner votre avis</h3>
            {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}
            {success && <div className="bg-green-500/20 text-green-400 p-3 rounded-lg mb-4 text-sm">{success}</div>}
            
            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">Note (1 à 5)</label>
              <select 
                value={rating} 
                onChange={(e) => setRating(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white w-full sm:w-40 focus:outline-none focus:border-indigo-500"
              >
                <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                <option value="4">⭐⭐⭐⭐ (4/5)</option>
                <option value="3">⭐⭐⭐ (3/5)</option>
                <option value="2">⭐⭐ (2/5)</option>
                <option value="1">⭐ (1/5)</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">Votre commentaire</label>
              <textarea 
                rows="3"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Qu'avez-vous pensé de ce jeu ?"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500"
              ></textarea>
            </div>

            <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg font-medium flex items-center space-x-2 transition duration-200">
              <Send className="w-4 h-4" />
              <span>Publier l'avis</span>
            </button>
          </form>

          {/* Liste des avis */}
          <div className="space-y-4">
            {game.reviews && game.reviews.length > 0 ? (
              game.reviews.map(review => (
                <div key={review.id} className="bg-slate-900 border border-slate-700/60 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-indigo-400">{review.user ? review.user.username : 'Utilisateur'}</span>
                    <div className="flex items-center text-amber-400 text-sm">
                      <Star className="w-4 h-4 fill-amber-400 mr-1" />
                      <span>{review.rating}/5</span>
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm">{review.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-center py-6">Aucun avis pour le moment. Soyez le premier à donner le vôtre !</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}