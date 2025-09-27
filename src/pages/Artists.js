import React, { useState, useEffect } from 'react';
import { useArtists } from '../contexts/ArtistContext';
import { useAuth } from '../contexts/AuthContext';
import { Search, MapPin, Sparkles, Grid, List, Lock, Share2, Heart } from 'lucide-react';
import ArtistCard from '../components/ArtistCard';
import ImageUploadModal from '../components/ImageUploadModal';
import toast from 'react-hot-toast';

const Artists = () => {
  const { artists, loading, filters, updateFilters, clearFilters } = useArtists();
  const { currentUser, userProfile } = useAuth();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list'
  const [favoritedArtists, setFavoritedArtists] = useState(new Set());

  // Load favorited artists from localStorage
  useEffect(() => {
    if (currentUser) {
      const savedFavorites = localStorage.getItem(`favorites_${currentUser.uid}`);
      if (savedFavorites) {
        const favorites = JSON.parse(savedFavorites);
        const favoriteIds = new Set(favorites.map(fav => fav.id));
        setFavoritedArtists(favoriteIds);
      }
    }
  }, [currentUser]);

  const popularStyles = [
    'French Tips', 'Gel Extensions', 'Nail Art', 'Ombre', 'Glitter',
    'Acrylic', 'Dip Powder', 'Stiletto', 'Coffin', 'Almond'
  ];

  const popularLocations = [
    'New York', 'Los Angeles', 'Chicago', 'Miami', 'Seattle',
    'Austin', 'Denver', 'Boston', 'San Francisco', 'Portland'
  ];

  const handleStyleFilter = (style) => {
    const currentStyles = filters.style || [];
    
    // If already selected, remove it
    if (currentStyles.includes(style)) {
      const updatedStyles = currentStyles.filter(s => s !== style);
      updateFilters({ style: updatedStyles });
    } else {
      // Add to selection
      const updatedStyles = [...currentStyles, style];
      updateFilters({ style: updatedStyles });
    }
  };

  const handleLocationFilter = (location) => {
    // If already selected, deselect it
    if (filters.location === location) {
      updateFilters({ location: '' });
    } else {
      updateFilters({ location });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = e.target.search.value;
    updateFilters({ search: searchTerm });
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

  const handleToggleFavorite = (artist) => {
    if (!currentUser || userProfile?.userType === 'artist') return;

    const savedFavorites = localStorage.getItem(`favorites_${currentUser.uid}`);
    let favorites = savedFavorites ? JSON.parse(savedFavorites) : [];

    const isFavorited = favorites.some(fav => fav.id === artist.id);

    if (isFavorited) {
      // Remove from favorites
      favorites = favorites.filter(fav => fav.id !== artist.id);
      toast.success('Removed from favorites');
      // Update state
      setFavoritedArtists(prev => {
        const newSet = new Set(prev);
        newSet.delete(artist.id);
        return newSet;
      });
    } else {
      // Add to favorites
      favorites.push(artist);
      toast.success('Added to favorites');
      // Update state
      setFavoritedArtists(prev => new Set([...prev, artist.id]));
    }

    localStorage.setItem(`favorites_${currentUser.uid}`, JSON.stringify(favorites));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nail Artists</h1>
              <p className="text-gray-600 mt-1">
                {artists.length} artists found
                {filters.location && ` in ${filters.location}`}
                {filters.style && filters.style.length > 0 && ` specializing in ${filters.style.join(', ')}`}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                AI Match
              </button>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-pink-100 text-pink-600' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Grid view"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-pink-100 text-pink-600' : 'text-gray-600 hover:bg-gray-100'
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                >
                  Clear All
                </button>
              </div>

              {/* Active Filters - Moved to top */}
              {(filters.location || (filters.style && filters.style.length > 0) || filters.search) && (
                <div className="mb-6 border-b pb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Active Filters</h3>
                  <div className="space-y-1">
                    {filters.location && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Location: {filters.location}</span>
                        <button
                          onClick={() => updateFilters({ location: '' })}
                          className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
                        >
                          ×
                        </button>
                      </div>
                    )}
                    {filters.style && filters.style.length > 0 && (
                      <div className="space-y-1">
                        {filters.style.map((selectedStyle, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Style: {selectedStyle}</span>
                            <button
                              onClick={() => {
                                const updatedStyles = filters.style.filter(s => s !== selectedStyle);
                                updateFilters({ style: updatedStyles });
                              }}
                              className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {filters.search && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Search: {filters.search}</span>
                        <button
                          onClick={() => updateFilters({ search: '' })}
                          className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    name="search"
                    placeholder="Artist name, style..."
                    defaultValue={filters.search}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Location Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="space-y-2">
                  {popularLocations.map((location) => (
                    <button
                      key={location}
                      onClick={() => handleLocationFilter(location)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        filters.location === location
                          ? 'bg-pink-100 text-pink-700 border border-pink-200'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <MapPin className="w-4 h-4 inline mr-2" />
                      {location}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Style
                </label>
                <div className="flex flex-wrap gap-2">
                  {popularStyles.map((style) => (
                    <button
                      key={style}
                      onClick={() => handleStyleFilter(style)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        filters.style?.includes(style)
                          ? 'bg-pink-100 text-pink-700 border border-pink-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Artists Grid/List */}
            <div className="flex-1">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
                </div>
              ) : artists.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No artists found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your filters or search terms
                  </p>
                  <button
                    onClick={clearFilters}
                    className="text-pink-600 hover:text-pink-700 font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : viewMode === 'list' ? (
                <div className="space-y-2">
                  {artists.map((artist) => {
                    // Check if artist is favorited using state
                    const isFavorited = favoritedArtists.has(artist.id);
                    
                    return (
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
                        {/* Share and Heart buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleShare(artist)}
                            className="p-2 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded transition-colors"
                            title="Share"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          {/* Only show heart for logged-in clients (not artists) */}
                          {currentUser && userProfile?.userType !== 'artist' && (
                            <button 
                              onClick={() => handleToggleFavorite(artist)}
                              className={`p-2 rounded transition-colors ${
                                isFavorited 
                                  ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                                  : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                              }`}
                              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                            >
                              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                            </button>
                          )}
                        </div>
                        
                        {/* View Profile Button */}
                        <button
                          onClick={() => window.location.href = `/artist/${artist.id}`}
                          className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-gray-700"
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                  {artists.map((artist) => (
                    <ArtistCard key={artist.id} artist={artist} />
                  ))}
                </div>
              )}
            </div>
        </div>
      </div>

      {/* AI Upload Modal */}
      {showUploadModal && (
        <ImageUploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => setShowUploadModal(false)}
        />
      )}
    </div>
  );
};

export default Artists;