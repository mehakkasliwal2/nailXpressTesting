import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { MapPin, Star, Camera, ArrowLeft, Heart, Share2, Lock, Instagram, Phone, Mail, Link as LinkIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import toast from 'react-hot-toast';

const ArtistProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  // Removed unused selectedImage state
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    fetchArtist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Set page title dynamically
  useEffect(() => {
    if (artist) {
      document.title = `${artist.displayName || artist.name} | nailXpress`;
    }
    return () => {
      document.title = 'nailXpress';
    };
  }, [artist]);

  // Check if artist is favorited
  useEffect(() => {
    if (currentUser && userProfile?.userType !== 'artist' && artist) {
      const savedFavorites = localStorage.getItem(`favorites_${currentUser.uid}`);
      if (savedFavorites) {
        const favorites = JSON.parse(savedFavorites);
        setIsFavorited(favorites.some(fav => fav.id === artist.id));
      }
    }
  }, [currentUser, userProfile, artist]);

  const fetchArtist = async () => {
    try {
      const artistRef = doc(db, 'artists', id);
      const artistSnap = await getDoc(artistRef);
      
      if (artistSnap.exists()) {
        setArtist({ id: artistSnap.id, ...artistSnap.data() });
      } else {
        toast.error('Artist not found');
        navigate('/artists');
      }
    } catch (error) {
      console.error('Error fetching artist:', error);
      toast.error('Failed to load artist profile');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `https://nailxpress.net/artist/${artist.id}`;
    const shareText = `Check out ${artist.displayName || artist.name}'s nail art portfolio on nailXpress!`;
    
    try {
      await navigator.share({
        title: `${artist.displayName || artist.name} | nailXpress`,
        text: shareText,
        url: shareUrl
      });
    } catch (error) {
      // Fallback: copy to clipboard with text
      try {
        const fullText = `${shareText}\n\n${shareUrl}`;
        await navigator.clipboard.writeText(fullText);
        toast.success('Link and text copied to clipboard');
      } catch (clipboardError) {
        // If clipboard fails, just show the URL
        toast.success(`Link: ${shareUrl}`);
      }
    }
  };

  const handleToggleFavorite = () => {
    if (!currentUser || userProfile?.userType === 'artist' || !artist) return;

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

  const openGallery = (index) => {
    setGalleryIndex(index);
    setShowGallery(true);
  };

  const closeGallery = React.useCallback(() => {
    setShowGallery(false);
  }, []);

  const nextImage = React.useCallback(() => {
    if (artist && artist.portfolio) {
      setGalleryIndex((prev) => (prev + 1) % artist.portfolio.length);
    }
  }, [artist]);

  const prevImage = React.useCallback(() => {
    if (artist && artist.portfolio) {
      setGalleryIndex((prev) => (prev - 1 + artist.portfolio.length) % artist.portfolio.length);
    }
  }, [artist]);

  const handleKeyDown = React.useCallback((e) => {
    if (showGallery) {
      if (e.key === 'Escape') closeGallery();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    }
  }, [showGallery, closeGallery, prevImage, nextImage]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll when gallery is open on mobile
  useEffect(() => {
    if (showGallery) {
      // Prevent scrolling on the body
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
    } else {
      // Restore scrolling
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, [showGallery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Artist not found</h2>
          <button
            onClick={() => navigate('/artists')}
            className="text-pink-600 hover:text-pink-700 font-medium"
          >
            Back to Artists
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{artist.displayName || artist.name}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Profile Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
            {/* Large Profile Picture */}
            <div className="flex-shrink-0">
              <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white">
                {artist.profileImage ? (
                  <img
                    src={artist.profileImage}
                    alt={artist.displayName || artist.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-100 to-pink-200">
                    <Camera className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Profile Info */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                <h2 className="text-3xl font-bold text-gray-900">{artist.displayName || artist.name}</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShare}
                    className="p-2 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                    title="Share"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  {/* Only show heart for logged-in clients (not artists) */}
                  {currentUser && userProfile?.userType !== 'artist' && (
                    <button 
                      onClick={handleToggleFavorite}
                      className={`p-2 rounded-lg transition-colors ${
                        isFavorited 
                          ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                          : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                      }`}
                      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-center lg:justify-start gap-4 text-gray-600 mb-6">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{artist.city && artist.state ? `${artist.city}, ${artist.state}` : artist.location}</span>
                </div>
                {artist.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span>{artist.rating}</span>
                  </div>
                )}
              </div>
              
              {artist.bio && (
                <p className="text-gray-600 leading-relaxed mb-6">{artist.bio}</p>
              )}

              {/* Specialties */}
              {artist.styles && artist.styles.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Specialties</h3>
                  <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                    {artist.styles.map((style, index) => (
                      <span
                        key={index}
                        className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm"
                      >
                        {style}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Info - Only show if user is logged in */}
              {currentUser ? (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {artist.bookingInfo?.instagram && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Instagram className="w-4 h-4" />
                        <a 
                          href={`https://instagram.com/${artist.bookingInfo.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-pink-600 hover:text-pink-700"
                        >
                          {artist.bookingInfo.instagram}
                        </a>
                      </div>
                    )}
                    {artist.bookingInfo?.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${artist.bookingInfo.phone}`} className="text-pink-600 hover:text-pink-700">
                          {artist.bookingInfo.phone}
                        </a>
                      </div>
                    )}
                    {artist.bookingInfo?.email && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${artist.bookingInfo.email}`} className="text-pink-600 hover:text-pink-700">
                          {artist.bookingInfo.email}
                        </a>
                      </div>
                    )}
                    {artist.bookingInfo?.bookingLink && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <LinkIcon className="w-4 h-4" />
                        <a 
                          href={artist.bookingInfo.bookingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-pink-600 hover:text-pink-700"
                        >
                          Book Appointment
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="border-t pt-6">
                  <div className="bg-pink-50 border border-pink-200 rounded-lg p-6 text-center">
                    <Lock className="w-8 h-8 text-pink-600 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Information</h3>
                    <p className="text-gray-600 mb-4">
                      Sign up or log in to view contact information and book appointments with this artist.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={() => navigate('/signup')}
                        className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        Sign Up
                      </button>
                      <button
                        onClick={() => navigate('/login')}
                        className="bg-white hover:bg-pink-50 text-pink-600 border border-pink-600 px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        Log In
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Portfolio Gallery */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Portfolio</h3>
          
          {artist && artist.portfolio && artist.portfolio.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {artist.portfolio.map((image, index) => (
                <div
                  key={index}
                  className="aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => openGallery(index)}
                >
                  <img
                    src={image}
                    alt={`${artist.displayName || artist.name} portfolio ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No portfolio images yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Gallery Modal */}
      {showGallery && artist && artist.portfolio && artist.portfolio.length > 0 && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            overflow: 'hidden'
          }}
        >
          <div className="relative max-w-7xl h-full w-full flex flex-col items-center justify-center">
            {/* Close Button */}
            <button
              onClick={closeGallery}
              className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-30 rounded-full p-2"
            >
              <X className="w-8 h-8" />
            </button>
            
            {/* Navigation Buttons */}
            {artist && artist.portfolio && artist.portfolio.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-30 rounded-full p-2"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-30 rounded-full p-2"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}
            
            {/* Main Image */}
            <div className="flex items-center justify-center w-full h-full">
              <div className="relative w-full h-full">
                <img
                  src={artist && artist.portfolio ? artist.portfolio[galleryIndex] : ''}
                  alt={`${artist && artist.displayName ? artist.displayName : artist && artist.name ? artist.name : 'Artist'} portfolio ${galleryIndex + 1}`}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            
            {/* Image Counter */}
            {artist && artist.portfolio && artist.portfolio.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
                {galleryIndex + 1} of {artist.portfolio.length}
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default ArtistProfile;
