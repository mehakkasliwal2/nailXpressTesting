import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Star, Camera, Share2, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

const ArtistCard = ({ artist }) => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);

  const handleViewProfile = () => {
    navigate(`/artist/${artist.id}`);
  };

  const handleShare = async (e) => {
    e.stopPropagation(); // Prevent card click
    const shareUrl = `https://nailxpress.net/artist/${artist.id}`;
    try {
      await navigator.share({
        url: shareUrl
      });
    } catch (error) {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard');
    }
  };

  // Check if artist is favorited
  useEffect(() => {
    if (currentUser && userProfile?.userType !== 'artist') {
      const savedFavorites = localStorage.getItem(`favorites_${currentUser.uid}`);
      if (savedFavorites) {
        const favorites = JSON.parse(savedFavorites);
        setIsFavorited(favorites.some(fav => fav.id === artist.id));
      }
    }
  }, [currentUser, userProfile, artist.id]);

  const handleToggleFavorite = (e) => {
    e.stopPropagation(); // Prevent card click
    if (!currentUser || userProfile?.userType === 'artist') return;

    const savedFavorites = localStorage.getItem(`favorites_${currentUser.uid}`);
    let favorites = savedFavorites ? JSON.parse(savedFavorites) : [];

    if (isFavorited) {
      // Remove from favorites
      favorites = favorites.filter(fav => fav.id !== artist.id);
      toast.success('Removed from favorites');
    } else {
      // Add to favorites
      favorites.push(artist);
      toast.success('Added to favorites');
    }

    localStorage.setItem(`favorites_${currentUser.uid}`, JSON.stringify(favorites));
    setIsFavorited(!isFavorited);
  };

  return (
    <div className={`rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-col h-full ${artist.profileBackgroundColor || 'bg-pink-100'}`}>
      {/* Artist Image */}
      <div className="relative h-48 flex items-center justify-center">
        <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{ top: '55%' }}>
          {artist.profileImage ? (
            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <img
                src={artist.profileImage}
                alt={artist.displayName || artist.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-40 h-40 rounded-full flex items-center justify-center bg-gradient-to-br from-pink-100 to-pink-200 border-4 border-white shadow-lg">
              <Camera className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </div>
        
        {/* Featured Badge */}
        {artist.isFeatured && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold">
            Featured
          </div>
        )}
      </div>

      {/* Artist Info */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800 truncate">
            {artist.displayName || artist.name}
          </h3>
          <div className="flex items-center gap-2">
            {artist.rating && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span>{artist.rating}</span>
              </div>
            )}
            {/* Share and Heart buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleShare}
                className="p-1 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded transition-colors"
                title="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>
              {/* Only show heart for logged-in clients (not artists) */}
              {currentUser && userProfile?.userType !== 'artist' && (
                <button 
                  onClick={handleToggleFavorite}
                  className={`p-1 rounded transition-colors ${
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
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-700 mb-3">
          <MapPin className="w-4 h-4" />
          <span>{artist.city && artist.state ? `${artist.city}, ${artist.state}` : artist.location}</span>
        </div>


        {/* Styles */}
        {artist.styles && artist.styles.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {artist.styles.slice(0, 3).map((style, index) => (
                <span
                  key={index}
                  className="bg-pink-100 text-pink-800 px-2 py-1 rounded text-xs"
                >
                  {style}
                </span>
              ))}
              {artist.styles.length > 3 && (
                <span className="text-xs text-gray-600">
                  +{artist.styles.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Portfolio Preview */}
        {artist.portfolio && artist.portfolio.length > 0 && (
          <div className="mb-4 flex-1">
            <div className="flex gap-1 justify-center items-center flex-wrap">
              {/* Show different numbers of images based on screen size */}
              {artist.portfolio.slice(0, 6).map((image, index) => (
                <div key={index} className="w-12 h-16 bg-gray-200 rounded overflow-hidden sm:hidden flex-shrink-0">
                  <img
                    src={image}
                    alt={`${artist.displayName || artist.name} portfolio ${index + 1}`}
                    className="w-12 h-16 object-cover"
                  />
                </div>
              ))}
              {artist.portfolio.slice(0, 5).map((image, index) => (
                <div key={index} className="w-12 h-16 bg-gray-200 rounded overflow-hidden hidden sm:block md:hidden flex-shrink-0">
                  <img
                    src={image}
                    alt={`${artist.displayName || artist.name} portfolio ${index + 1}`}
                    className="w-12 h-16 object-cover"
                  />
                </div>
              ))}
              {artist.portfolio.slice(0, 6).map((image, index) => (
                <div key={index} className="w-12 h-16 bg-gray-200 rounded overflow-hidden hidden md:block lg:hidden flex-shrink-0">
                  <img
                    src={image}
                    alt={`${artist.displayName || artist.name} portfolio ${index + 1}`}
                    className="w-12 h-16 object-cover"
                  />
                </div>
              ))}
              {artist.portfolio.slice(0, 7).map((image, index) => (
                <div key={index} className="w-12 h-16 bg-gray-200 rounded overflow-hidden hidden lg:block flex-shrink-0">
                  <img
                    src={image}
                    alt={`${artist.displayName || artist.name} portfolio ${index + 1}`}
                    className="w-12 h-16 object-cover"
                  />
                </div>
              ))}
              
              {/* Responsive +X counter - only show if there are more images */}
              {artist.portfolio.length > 6 && (
                <div className="w-12 h-16 bg-white bg-opacity-50 rounded flex items-center justify-center text-sm font-semibold text-gray-700 sm:hidden flex-shrink-0 relative">
                  <span className="absolute inset-0 flex items-center justify-center" style={{left: '1px'}}>+{artist.portfolio.length - 6}</span>
                </div>
              )}
              {artist.portfolio.length > 5 && (
                <div className="w-12 h-16 bg-white bg-opacity-50 rounded flex items-center justify-center text-sm font-semibold text-gray-700 hidden sm:block md:hidden flex-shrink-0 relative">
                  <span className="absolute inset-0 flex items-center justify-center" style={{left: '1px'}}>+{artist.portfolio.length - 5}</span>
                </div>
              )}
              {artist.portfolio.length > 6 && (
                <div className="w-12 h-16 bg-white bg-opacity-50 rounded flex items-center justify-center text-sm font-semibold text-gray-700 hidden md:block lg:hidden flex-shrink-0 relative">
                  <span className="absolute inset-0 flex items-center justify-center" style={{left: '1px'}}>+{artist.portfolio.length - 6}</span>
                </div>
              )}
              {artist.portfolio.length > 7 && (
                <div className="w-12 h-16 bg-white bg-opacity-50 rounded flex items-center justify-center text-sm font-semibold text-gray-700 hidden lg:block flex-shrink-0 relative">
                  <span className="absolute inset-0 flex items-center justify-center" style={{left: '1px'}}>+{artist.portfolio.length - 7}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <button
          onClick={handleViewProfile}
          className="w-full bg-gray-800 hover:bg-gray-900 text-white py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 border border-gray-700 mt-auto"
        >
          View Profile
        </button>
      </div>
    </div>
  );
};

export default ArtistCard;