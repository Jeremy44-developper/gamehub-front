import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Star, ArrowLeft, Send, Gamepad2, CheckCircle2, Trash2, Edit3, X } from 'lucide-react';

export default function GameDetails() {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // États pour le formulaire d'avis (Création)
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // États pour le mode Édition de son propre avis
  const [isEditing, setIsEditing] = useState(false);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');

  // Récupérer l'email depuis le token JWT
  const getCurrentEmail = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload).email;
    } catch (e) {
      return null;
    }
  };

  const currentEmail = getCurrentEmail();

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

  // Soumission d'un nouvel avis
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
      fetchGame();
    })
    .catch(err => {
      setError(err.response?.data?.message || 'Une erreur est survenue.');
    });
  };

  // Suppression de son avis
  const handleDeleteReview = (reviewId) => {
    if (!window.confirm("Voulez-vous vraiment supprimer votre avis ?")) return;

    const token = localStorage.getItem('token');
    api.delete(`/games/reviews/${reviewId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      setIsEditing(false);
      fetchGame();
    })
    .catch(err => {
      alert(err.response?.data?.message || "Erreur lors de la suppression.");
    });
  };

  // Mise à jour de son avis
  const handleUpdateReview = (e, reviewId) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    api.put(`/games/reviews/${reviewId}`, { rating: parseInt(editRating), comment: editComment }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      setIsEditing(false);
      fetchGame();
    })
    .catch(err => {
      alert(err.response?.data?.message || "Erreur lors de la modification.");
    });
  };

  if (loading) return <div className="min-h-screen bg-slate-950 text-cyan-400 p-10 text-center font-medium">Chargement...</div>;
  if (!game) return <div className="min-h-screen bg-slate-950 text-white p-10 text-center">Jeu introuvable.</div>;

  const userReview = game.reviews && game.reviews.find(
    review => review.user && review.user.email === currentEmail
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col w-full">
      <Navbar />

      <div className="max-w-4xl mx-auto p-6 w-full flex-1">
        <Link to="/" className="inline-flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 mb-6 transition font-medium text-sm">
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au catalogue</span>
        </Link>

        {/* En-tête du jeu */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl mb-8">
          <div className="h-64 sm:h-80 bg-slate-950 relative border-b border-slate-800">
            {game.imageCover ? (
              <img src={game.imageCover} alt={game.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><Gamepad2 className="w-20 h-20 text-slate-700" /></div>
            )}
          </div>
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
              <span className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-3.5 py-1 rounded-full text-xs font-semibold">
                {game.category}
              </span>
              <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 px-3.5 py-1.5 rounded-xl text-amber-400 font-black text-lg">
                <Star className="w-5 h-5 fill-amber-400" />
                <span>{game.averageRating ? game.averageRating.toFixed(1) : "Pas encore noté"}</span>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight">{game.title}</h1>
            <p className="text-slate-300 leading-relaxed mb-6 text-sm">{game.description}</p>
            <div className="flex justify-between text-xs text-slate-400 border-t border-slate-800 pt-4">
              <span>Plateforme : <strong className="text-slate-200 text-sm">{game.platform}</strong></span>
              <span>Année de sortie : <strong className="text-slate-200 text-sm">{game.releaseYear}</strong></span>
            </div>
          </div>
        </div>

        {/* Section Avis */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl mb-8">
          <h2 className="text-2xl font-black mb-6 tracking-tight">Avis de la communauté</h2>

          {/* Si l'utilisateur a déjà posté un avis */}
          {userReview ? (
            <div className="mb-8 bg-slate-950 p-6 rounded-2xl border border-cyan-500/30 shadow-inner">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 text-cyan-300">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span className="font-bold text-sm">Votre avis sur ce jeu</span>
                </div>
                {!isEditing && (
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => {
                        setIsEditing(true);
                        setEditRating(userReview.rating);
                        setEditComment(userReview.comment || '');
                      }}
                      className="bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Modifier</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteReview(userReview.id)}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Supprimer</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Mode Édition ou Affichage de l'avis perso */}
              {isEditing ? (
                <form onSubmit={(e) => handleUpdateReview(e, userReview.id)} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Modifier la note</label>
                    <select 
                      value={editRating} 
                      onChange={(e) => setEditRating(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white w-full sm:w-48 focus:outline-none focus:border-cyan-400 text-sm"
                    >
                      <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                      <option value="4">⭐⭐⭐⭐ (4/5)</option>
                      <option value="3">⭐⭐⭐ (3/5)</option>
                      <option value="2">⭐⭐ (2/5)</option>
                      <option value="1">⭐ (1/5)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Modifier le commentaire</label>
                    <textarea 
                      rows="3"
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-400 text-sm"
                    ></textarea>
                  </div>
                  <div className="flex space-x-2">
                    <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-cyan-500/20 transition">
                      Enregistrer
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setIsEditing(false)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm font-medium flex items-center space-x-1 transition"
                    >
                      <X className="w-4 h-4" />
                      <span>Annuler</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <div className="flex items-center text-amber-400 text-sm mb-2 font-bold">
                    <Star className="w-4 h-4 fill-amber-400 mr-1" />
                    <span>{userReview.rating}/5</span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{userReview.comment || "Aucun commentaire."}</p>
                </div>
              )}
            </div>
          ) : (
            /* Formulaire d'ajout d'avis */
            <form onSubmit={handleReviewSubmit} className="mb-8 bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <h3 className="text-lg font-bold mb-4">Donner votre avis</h3>
              {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-4 text-xs">{error}</div>}
              {success && <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-xl mb-4 text-xs">{success}</div>}
              
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Note (1 à 5)</label>
                <select 
                  value={rating} 
                  onChange={(e) => setRating(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white w-full sm:w-48 focus:outline-none focus:border-cyan-400 text-sm"
                >
                  <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                  <option value="4">⭐⭐⭐⭐ (4/5)</option>
                  <option value="3">⭐⭐⭐ (3/5)</option>
                  <option value="2">⭐⭐ (2/5)</option>
                  <option value="1">⭐ (1/5)</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Votre commentaire</label>
                <textarea 
                  rows="3"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Qu'avez-vous pensé de ce jeu ?"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-400 text-sm"
                ></textarea>
              </div>

              <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-6 py-2.5 rounded-xl font-bold flex items-center space-x-2 transition shadow-lg shadow-cyan-500/20 text-sm">
                <Send className="w-4 h-4" />
                <span>Publier l'avis</span>
              </button>
            </form>
          )}

          {/* Liste des avis de la communauté */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold mb-2">Tous les avis</h3>
            {game.reviews && game.reviews.filter(review => !userReview || review.id !== userReview.id).length > 0 ? (
              game.reviews
                .filter(review => !userReview || review.id !== userReview.id)
                .map(review => (
                  <div key={review.id} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-md">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-cyan-400 text-sm">
                        {review.user ? review.user.username : 'Utilisateur'}
                      </span>
                      <div className="flex items-center text-amber-400 text-xs font-bold bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
                        <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                        <span>{review.rating}/5</span>
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">{review.comment}</p>
                  </div>
                ))
            ) : (
              <p className="text-slate-400 text-center py-6 bg-slate-950 rounded-2xl border border-slate-800 text-sm">
                {userReview ? "Il n'y a pas d'autres avis pour le moment." : "Aucun avis pour le moment. Soyez le premier à donner le vôtre !"}
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}