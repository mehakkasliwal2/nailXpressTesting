import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArtists } from '../contexts/ArtistContext';
import { Upload, Search, MapPin, Sparkles, X, CheckCircle } from 'lucide-react';
import ImageUploadModal from '../components/ImageUploadModal';
// ArtistCard import removed since featured artists section was removed
// Map image will be loaded from public folder
import '../styles/Home.css';

export default function Home() {
  const navigate = useNavigate();
  const { updateFilters } = useArtists();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showArtistModal, setShowArtistModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    updateFilters({ search: searchQuery });
    navigate('/artists');
  };

  const handleLocationSearch = (location) => {
    updateFilters({ location });
    navigate('/artists');
  };

  // featuredArtists removed since featured artists section was removed

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero-section hero-custom-bg py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Match With the Right Nail Artist, Instantly
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Upload a nail photo to discover similar styles, browse by location, and explore artists across the U.S. 
              Whether you're an artist or a client, nailXpress makes connection effortless.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search by artist name, style, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 pr-16 rounded-lg border-2 border-gray-200 focus:border-pink-500 focus:outline-none text-lg"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-16 bg-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-pink-100 rounded-2xl p-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Find Your Perfect Nail Match
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our advanced AI analyzes your inspiration photos to find artists 
                who specialize in your style preferences.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <button 
                onClick={() => setShowUploadModal(true)}
                className="text-center p-6 rounded-xl hover:bg-pink-200 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="bg-pink-200 group-hover:bg-pink-300 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                  <Upload className="w-8 h-8 text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Photo</h3>
                <p className="text-gray-600">Share your nail inspiration or reference image</p>
              </button>
              
              <button 
                onClick={() => setShowUploadModal(true)}
                className="w-full text-center p-6 rounded-xl hover:bg-pink-200 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="bg-pink-200 group-hover:bg-pink-300 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                  <Sparkles className="w-8 h-8 text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Analysis</h3>
                <p className="text-gray-600">Our AI identifies style, technique, and design elements</p>
              </button>
              
              <button 
                onClick={() => navigate('/artists')}
                className="w-full text-center p-6 rounded-xl hover:bg-pink-200 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="bg-pink-200 group-hover:bg-pink-300 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                  <MapPin className="w-8 h-8 text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Perfect Match</h3>
                <p className="text-gray-600">Get matched with nearby artists who excel in your style</p>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (AI + Maps + Secure Auth) */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-6">
              <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Create your account</h3>
              <p className="text-gray-600">Sign up with email or Google. Your profile helps us personalize your experience.</p>
            </div>
            <div className="card p-6">
              <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload or browse</h3>
              <p className="text-gray-600">Upload an inspiration photo for AI style matching, or browse by style and location.</p>
            </div>
            <div className="card p-6">
              <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Match & connect</h3>
              <p className="text-gray-600">We recommend nearby artists who specialize in your style. Review their work and connect directly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits (modernized) */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Why nailXpress?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card p-6 hover:bg-pink-50 hover:border-pink-200 transition-all duration-300 group">
              <h3 className="text-xl font-semibold mb-2 group-hover:text-pink-600 transition-colors">AI-powered discovery</h3>
              <p className="text-gray-600 group-hover:text-gray-700 transition-colors">Get accurate style matches with confidence scoring. No more guesswork—find artists who truly fit your vibe.</p>
            </div>
            <div className="card p-6 hover:bg-pink-50 hover:border-pink-200 transition-all duration-300 group">
              <h3 className="text-xl font-semibold mb-2 group-hover:text-pink-600 transition-colors">Local and convenient</h3>
              <p className="text-gray-600 group-hover:text-gray-700 transition-colors">Discover home-based and studio artists nearby, visualized with interactive maps and location filters.</p>
            </div>
            <div className="card p-6 hover:bg-pink-50 hover:border-pink-200 transition-all duration-300 group">
              <h3 className="text-xl font-semibold mb-2 group-hover:text-pink-600 transition-colors">Support independent artists</h3>
              <p className="text-gray-600 group-hover:text-gray-700 transition-colors">Help talent grow by booking directly. Artists manage their own portfolios and availability.</p>
            </div>
            <div className="card p-6 hover:bg-pink-50 hover:border-pink-200 transition-all duration-300 group">
              <h3 className="text-xl font-semibold mb-2 group-hover:text-pink-600 transition-colors">Secure & modern</h3>
              <p className="text-gray-600 group-hover:text-gray-700 transition-colors">Protected login with Firebase Auth. Image uploads and data are safely stored on trusted infrastructure.</p>
            </div>
          </div>
        </div>
      </section>





      {/* Image Upload Modal */}
      {showUploadModal && (
        <ImageUploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            navigate('/artists');
          }}
        />
      )}

      {/* Artist Info Modal */}
      {showArtistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide">
            {/* Header - Sticky */}
            <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-gray-200 z-10">
              <h2 className="text-2xl font-bold text-gray-900">How to Join nailXpress as an Artist</h2>
              <button
                onClick={() => setShowArtistModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="text-center mb-8">
                <p className="text-lg text-gray-600">
                  Follow these simple steps to create your artist profile and start connecting with clients who love your style.
                </p>
              </div>

              {/* Steps */}
              <div className="space-y-6">
                {/* Step 1 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                    <span className="text-pink-600 font-bold text-sm">1</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign Up</h3>
                    <p className="text-gray-600">Create your free artist account with your name, email, username, and password.</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                    <span className="text-pink-600 font-bold text-sm">2</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Your Booking Info</h3>
                    <p className="text-gray-600">Share the best way for clients to reach you (Instagram, booking link, phone, or email).</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                    <span className="text-pink-600 font-bold text-sm">3</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Your Portfolio</h3>
                    <p className="text-gray-600">Showcase 10–15 photos of your nail work across different styles (e.g., minimalist, acrylic, French tips, seasonal designs).</p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                    <span className="text-pink-600 font-bold text-sm">4</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Set Your Location</h3>
                    <p className="text-gray-600">Enter your city and state so clients can easily find you nearby.</p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                    <span className="text-pink-600 font-bold text-sm">5</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Publish Your Profile</h3>
                    <p className="text-gray-600">Once complete, your profile goes live — clients can discover your work, match with your style through AI recommendations, and contact you directly to book.</p>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="border-t border-gray-200 pt-6 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ready to get started?</h3>
                <button
                  onClick={() => {
                    setShowArtistModal(false);
                    navigate('/signup?type=artist');
                  }}
                  className="bg-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Create Your Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Are you a nail artist? - CTA */}
      <section className="py-12 bg-gradient-to-r from-pink-600 to-pink-300 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Are you a nail artist?</h2>
          <p className="text-xl text-pink-100 mb-8">Join nailXpress and showcase your work to clients looking for your exact style.</p>
          <div className="flex justify-center">
            <button
              onClick={() => setShowArtistModal(true)}
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-pink-600 transition-colors"
            >
              Learn more
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
