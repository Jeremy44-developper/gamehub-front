import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Gamepad2, Star, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

function Home() {
  const [games, setGames] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/games')
      .then(response => {
        setGames(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Erreur lors de la récupération des jeux :", error);
        setLoading(false);
      });
  }, []);

  const filteredGames = games.filter(game => {
    const titleMatch = game.title ? game.title.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const categoryMatch = game.category ? game.category.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    return titleMatch || categoryMatch;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col w-full">
      {/* Intégration de la Navbar dynamique */}
      <Navbar />

      {/* Contenu principal en largeur fluide */}
      <main className="flex-1 w-full px-4 sm:px-10 py-8">
        
        {/* Section Titre & Recherche */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 w-full">
          <h1 className="text-3xl font-extrabold">Catalogue des Jeux</h1>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Rechercher un jeu, un genre..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* État de chargement */}
        {loading && (
          <div className="text-center py-20 text-slate-400">Chargement des jeux en cours...</div>
        )}

        {/* Message si aucun jeu */}
        {!loading && filteredGames.length === 0 && (
          <div className="text-center py-20 text-slate-400 bg-slate-800/50 rounded-xl border border-slate-800">
            Aucun jeu trouvé pour le moment. (La base de données est vide, c'est normal !)
          </div>
        )}

        {/* Grille des jeux */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
          {filteredGames.map(game => (
            <Link key={game.id} to={`/games/${game.id}`} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg hover:border-indigo-500 transition duration-300 flex flex-col">
              <div className="h-48 bg-slate-700 flex items-center justify-center">
                {game.imageCover ? (
                  <img src={game.imageCover} alt={game.title} className="w-full h-full object-cover" />
                ) : (
                  <Gamepad2 className="w-16 h-16 text-slate-500" />
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2.5 py-1 rounded-full font-medium">
                      {game.category}
                    </span>
                    <div className="flex items-center space-x-1 text-amber-400 font-semibold text-sm">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span>{game.averageRating ? game.averageRating.toFixed(1) : "N/A"}</span>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold mb-2">{game.title}</h2>
                  <p className="text-slate-400 text-sm line-clamp-2 mb-4">
                    {game.description || "Aucune description pour le moment."}
                  </p>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500 border-t border-slate-700 pt-3 mt-auto">
                  <span>Plateforme : <strong className="text-slate-300">{game.platform}</strong></span>
                  <span>Sortie : <strong className="text-slate-300">{game.releaseYear}</strong></span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </main>
    </div>
  );
}

export default Home;