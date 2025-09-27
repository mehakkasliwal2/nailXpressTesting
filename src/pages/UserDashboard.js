import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { User, Heart, Calendar, Star, Search, MapPin } from 'lucide-react';

const UserDashboard = () => {
  const { userProfile } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {userProfile?.name || 'User'}!</h1>
          <p className="text-gray-600">Discover amazing nail artists and book your next appointment</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link
            to="/artists"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-pink-100 p-3 rounded-lg group-hover:bg-pink-200 transition-colors">
                <Search className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Find Artists</h3>
                <p className="text-gray-600 text-sm">Browse nail artists near you</p>
              </div>
            </div>
          </Link>

          <Link
            to="/artists"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-pink-100 p-3 rounded-lg group-hover:bg-pink-200 transition-colors">
                <MapPin className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">By Location</h3>
                <p className="text-gray-600 text-sm">Find artists in your area</p>
              </div>
            </div>
          </Link>

          <Link
            to="/"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-pink-100 p-3 rounded-lg group-hover:bg-pink-200 transition-colors">
                <Star className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">AI Match</h3>
                <p className="text-gray-600 text-sm">Upload a photo to find your style</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Favorites */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-5 h-5 text-pink-600" />
              <h3 className="text-lg font-semibold text-gray-900">Your Favorites</h3>
            </div>
            <div className="text-center py-8">
              <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No favorites yet</p>
              <Link
                to="/artists"
                className="text-pink-600 hover:text-pink-700 font-medium"
              >
                Browse Artists
              </Link>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-pink-600" />
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No recent activity</p>
              <Link
                to="/artists"
                className="text-pink-600 hover:text-pink-700 font-medium"
              >
                Start Exploring
              </Link>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="mt-8 bg-gradient-to-r from-pink-600 to-pink-300 rounded-lg p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Ready to get started?</h3>
          <p className="text-pink-100 mb-6">
            Discover amazing nail artists, upload photos for AI matching, and book your next appointment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/artists"
              className="bg-white text-pink-600 px-6 py-3 rounded-lg font-semibold hover:bg-pink-50 transition-colors text-center"
            >
              Browse Artists
            </Link>
            <Link
              to="/"
              className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-pink-600 transition-colors text-center"
            >
              Try AI Match
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
