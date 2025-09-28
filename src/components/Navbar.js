import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, User, LogOut, Home, Users, ChevronDown, Settings, Palette, BookOpen, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      toast.error('Failed to log out');
      console.error('Logout error:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest('.user-dropdown')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="nailXpress" className="h-8 w-8" />
            <span className="text-xl text-pink-600">
              <span className="font-normal">nail</span><span className="font-bold">Xpress</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-pink-600 hover:bg-pink-50 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              onClick={() => window.scrollTo(0, 0)}
            >
              <Home className="w-4 h-4 inline mr-1" />
              Home
            </Link>
            <Link
              to="/artists"
              className="text-gray-700 hover:text-pink-600 hover:bg-pink-50 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <Users className="w-4 h-4 inline mr-1" />
              Our Artists
            </Link>
            <Link
              to="/about"
              className="text-gray-700 hover:text-pink-600 hover:bg-pink-50 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <BookOpen className="w-4 h-4 inline mr-1" />
              About
            </Link>
          </div>

          {/* Desktop Auth */}
          <div className="hidden lg:flex items-center space-x-4">
            {!currentUser && (
              <Link
                to="/signup?type=artist"
                className="bg-pink-50 hover:bg-pink-100 text-pink-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Become an artist
              </Link>
            )}
            {currentUser ? (
              <div className="flex items-center space-x-4">
                {userProfile?.userType === 'artist' && (
                  <Link
                    to="/dashboard"
                    className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <Palette className="w-4 h-4" />
                    Dashboard
                  </Link>
                )}
                
                {/* Favorites link for clients only */}
                {userProfile?.userType !== 'artist' && (
                  <Link
                    to="/favorites"
                    className="text-gray-700 hover:text-pink-600 hover:bg-pink-50 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <Heart className="w-4 h-4 inline mr-1" />
                    Favorite Artists
                  </Link>
                )}
                
                {/* User Dropdown Menu */}
                <div className="relative user-dropdown">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-1 text-gray-700 hover:text-pink-600 hover:bg-pink-50 p-2 rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {userProfile?.username || userProfile?.name || currentUser.displayName || currentUser.email}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Link>
                      
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsUserMenuOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-pink-600 hover:bg-pink-50 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
              <div className="lg:hidden">
                <button
                  onClick={toggleMenu}
                  className="text-pink-600 hover:text-pink-700 hover:bg-pink-100 p-2 rounded-md transition-colors"
                >
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
        </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
              <div className="lg:hidden">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
                  <Link
                    to="/"
                    className="text-gray-700 hover:text-pink-600 hover:bg-pink-50 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => {
                      setIsMenuOpen(false);
                      window.scrollTo(0, 0);
                    }}
                  >
                    <Home className="w-4 h-4 inline mr-2" />
                    Home
                  </Link>
                  <Link
                    to="/artists"
                    className="text-gray-700 hover:text-pink-600 hover:bg-pink-50 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Users className="w-4 h-4 inline mr-2" />
                    Our Artists
                  </Link>
                  <Link
                    to="/about"
                    className="text-gray-700 hover:text-pink-600 hover:bg-pink-50 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <BookOpen className="w-4 h-4 inline mr-2" />
                    About
                  </Link>
                  {!currentUser && (
                    <Link
                      to="/signup?type=artist"
                      className="text-pink-700 bg-pink-50 hover:bg-pink-100 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Become an artist
                    </Link>
                  )}
                  
                  {currentUser ? (
                    <>
                      {/* User Dropdown in Mobile */}
                      <div className="border-t border-gray-200 pt-2 mt-2">
                        <div className="flex items-center space-x-2 px-3 py-2 text-gray-700">
                          <User className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {userProfile?.username || userProfile?.name || currentUser.displayName || currentUser.email}
                          </span>
                        </div>
                        
                        {/* Favorites link for clients only */}
                        {userProfile?.userType !== 'artist' && (
                          <Link
                            to="/favorites"
                            className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Heart className="w-4 h-4 mr-2" />
                            Favorite Artists
                          </Link>
                        )}
                        
                        <Link
                          to="/profile"
                          className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </Link>
                        
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsMenuOpen(false);
                          }}
                          className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="text-gray-700 hover:text-pink-600 hover:bg-pink-50 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        to="/signup"
                        className="bg-pink-600 hover:bg-pink-700 text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}
      </div>
    </nav>
  );
};

export default Navbar;