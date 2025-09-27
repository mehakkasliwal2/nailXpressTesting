import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Sparkles, Grid, List, Heart, Share2 } from 'lucide-react';
import ArtistCard from '../components/ArtistCard';
import toast from 'react-hot-toast';

const Favorites = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list'
  const [searchTerm, setSearchTerm] = useState('');

  // Redirect if not logged in or if user is an artist
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (userProfile?.userType === 'artist') {
      navigate('/dashboard');
      return;
    }
  }, [currentUser, userProfile, navigate]);

  // Load favorites from localStorage
  useEffect(() => {
    if (currentUser && userProfile?.userType !== 'artist') {
      const savedFavorites = localStorage.getItem(`favorites_${currentUser.uid}`);
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
      setLoading(false);
    }
  }, [currentUser, userProfile]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(e.target.search.value);
  };

  const handleShare = async (artist) => {
    const shareUrl = `@https://nailxpress.net/artists/${artist.username || artist.displayName || artist.name}`;
    try {
      await navigator.share({
        title: `nailXpress`,
        text: `Check out ${artist.displayName || artist.name}'s nail art portfolio on nailXpress`,
        url: shareUrl
      });
    } catch (error) {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard');
    }
  };

  const removeFromFavorites = (artistId) => {
    const updatedFavorites = favorites.filter(artist => artist.id !== artistId);
    setFavorites(updatedFavorites);
    localStorage.setItem(`favorites_${currentUser.uid}`, JSON.stringify(updatedFavorites));
    toast.success('Removed from favorites');
  };

  // Filter favorites based on search term
  const filteredFavorites = favorites.filter(artist => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      artist.displayName?.toLowerCase().includes(searchLower) ||
      artist.name?.toLowerCase().includes(searchLower) ||
      artist.city?.toLowerCase().includes(searchLower) ||
      artist.state?.toLowerCase().includes(searchLower) ||
      artist.bio?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                My Favorites
              </h1>
              <p className="text-gray-600 mt-2">
                {favorites.length} {favorites.length === 1 ? 'artist' : 'artists'} saved
              </p>
            </div>

            {/* Search and View Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    name="search"
                    placeholder="Search favorites..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
              </form>

              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Grid view"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredFavorites.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No favorites match your search' : 'No favorites yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Start exploring artists and add them to your favorites!'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate('/artists')}
                className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Browse Artists
              </button>
            )}
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-2">
            {filteredFavorites.map((artist) => (
              <div key={artist.id} className={`${artist.profileBackgroundColor || 'bg-white'} rounded-lg shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow`}>
                {/* Profile Picture */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-lg bg-white">
                    {artist.profileImage ? (
                      <img
                        src={artist.profileImage}
                        alt={artist.displayName || artist.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-100 to-pink-200">
                        <div className="w-8 h-8 text-gray-400">👤</div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Artist Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {artist.displayName || artist.name}
                  </h3>
                  <div className="flex items-center gap-1 text-gray-600 mt-1">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm truncate">
                      {artist.city && artist.state ? `${artist.city}, ${artist.state}` : artist.location}
                    </span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex-shrink-0 flex items-center gap-2">
                  {/* Share and Remove buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleShare(artist)}
                      className="p-2 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded transition-colors"
                      title="Share"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeFromFavorites(artist.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Remove from favorites"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                  
                  {/* View Profile Button */}
                  <button
                    onClick={() => navigate(`/artist/${artist.id}`)}
                    className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-gray-700"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {filteredFavorites.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
