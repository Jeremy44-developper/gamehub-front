import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Gamepad2, Star, Search, RotateCcw, ArrowUpDown } from 'lucide-react';
import { Link } from 'react-router-dom';

function Home() {
  const [games, setGames] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [sortBy, setSortBy] = useState('rating_desc');
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

  const getGamePlatforms = (platformString) => {
    if (!platformString) return [];
    return platformString
      .split(/[\/,&-]/)
      .map(p => p.trim())
      .filter(p => p.length > 0);
  };

  const categoriesMap = new Map();
  games.forEach(g => {
    if (g.category) {
      const cleanCat = g.category.trim();
      const lowerCat = cleanCat.toLowerCase();
      if (!categoriesMap.has(lowerCat)) {
        categoriesMap.set(lowerCat, cleanCat);
      }
    }
  });
  const categories = Array.from(categoriesMap.values()).sort();

  const platformsMap = new Map();
  games.forEach(g => {
    const gamePlats = getGamePlatforms(g.platform);
    gamePlats.forEach(p => {
      const lowerPlat = p.toLowerCase();
      if (!platformsMap.has(lowerPlat)) {
        platformsMap.set(lowerPlat, p);
      }
    });
  });
  const platforms = Array.from(platformsMap.values()).sort();

  const filteredGames = games.filter(game => {
    const matchesSearch = searchTerm === '' || 
      game.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === '' || 
      game.category?.trim().toLowerCase() === selectedCategory.toLowerCase();

    const gamePlats = getGamePlatforms(game.platform).map(p => p.toLowerCase());
    const matchesPlatform = selectedPlatform === '' || 
      gamePlats.includes(selectedPlatform.toLowerCase());

    return matchesSearch && matchesCategory && matchesPlatform;
  });

  const sortedGames = [...filteredGames].sort((a, b) => {
    switch (sortBy) {
      case 'rating_desc':
        return (b.averageRating || 0) - (a.averageRating || 0);
      case 'rating_asc':
        return (a.averageRating || 0) - (b.averageRating || 0);
      case 'year_desc':
        return (b.releaseYear || 0) - (a.releaseYear || 0);
      case 'year_asc':
        return (a.releaseYear || 0) - (b.releaseYear || 0);
      case 'title_asc':
        return (a.title || '').localeCompare(b.title || '');
      case 'title_desc':
        return (b.title || '').localeCompare(a.title || '');
      default:
        return 0;
    }
  });

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedPlatform('');
    setSortBy('rating_desc');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col w-full">
      <Navbar />

      <main className="flex-1 w-full px-4 sm:px-10 py-8">
        <div className="flex flex-col gap-4 mb-8 w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-3xl font-extrabold tracking-tight">Catalogue des Jeux</h1>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-3 w-5 h-5 text-cyan-400" />
              <input 
                type="text" 
                placeholder="Rechercher un jeu..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg p-2 focus:outline-none focus:border-cyan-400"
            >
              <option value="">Toutes les catégories</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg p-2 focus:outline-none focus:border-cyan-400"
            >
              <option value="">Toutes les plateformes</option>
              {platforms.map((plat, idx) => (
                <option key={idx} value={plat}>{plat}</option>
              ))}
            </select>

            <div className="h-6 w-px bg-slate-800 hidden sm:block mx-1"></div>

            <div className="flex items-center space-x-2">
              <ArrowUpDown className="w-4 h-4 text-orange-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-cyan-300 font-medium text-sm rounded-lg p-2 focus:outline-none focus:border-cyan-400"
              >
                <option value="rating_desc">Mieux notés ⭐</option>
                <option value="rating_asc">Moins bien notés</option>
                <option value="year_desc">Plus récents (Année ↓)</option>
                <option value="year_asc">Plus anciens (Année ↑)</option>
                <option value="title_asc">Nom (A - Z)</option>
                <option value="title_desc">Nom (Z - A)</option>
              </select>
            </div>

            {(searchTerm || selectedCategory || selectedPlatform || sortBy !== 'rating_desc') && (
              <button
                onClick={handleResetFilters}
                className="flex items-center space-x-1 text-xs bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 px-3 py-2 rounded-lg transition ml-auto font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Réinitialiser</span>
              </button>
            )}
          </div>
        </div>

        {loading && (
          <div className="text-center py-20 text-cyan-400 font-medium">Chargement des jeux en cours...</div>
        )}

        {!loading && sortedGames.length === 0 && (
          <div className="text-center py-20 text-slate-400 bg-slate-900/50 rounded-xl border border-slate-800">
            Aucun jeu ne correspond à vos critères de recherche.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
          {sortedGames.map(game => (
            <Link key={game.id} to={`/games/${game.id}`} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg hover:border-cyan-400 hover:shadow-cyan-500/10 transition duration-300 flex flex-col group">
              <div className="h-48 bg-slate-800 flex items-center justify-center relative overflow-hidden">
                {game.imageCover ? (
                  <img src={game.imageCover} alt={game.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                ) : (
                  <Gamepad2 className="w-16 h-16 text-slate-600 group-hover:text-cyan-400 transition" />
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2.5 py-1 rounded-full font-semibold">
                      {game.category}
                    </span>
                    <div className="flex items-center space-x-1 text-orange-400 font-bold text-sm">
                      <Star className="w-4 h-4 fill-orange-400" />
                      <span>{game.averageRating ? game.averageRating.toFixed(1) : "N/A"}</span>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold mb-2 group-hover:text-cyan-300 transition">{game.title}</h2>
                  <p className="text-slate-400 text-sm line-clamp-2 mb-4">
                    {game.description || "Aucune description pour le moment."}
                  </p>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500 border-t border-slate-800 pt-3 mt-auto">
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