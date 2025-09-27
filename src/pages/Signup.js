import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, setDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { Mail, Lock, Eye, EyeOff, User, Palette } from 'lucide-react';
import toast from 'react-hot-toast';

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signup } = useAuth();
  const [userType, setUserType] = useState('user'); // 'user' or 'artist'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    username: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});


  // Check URL parameters for user type
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const type = urlParams.get('type');
    if (type === 'artist') {
      setUserType('artist');
      // Force scroll to top when coming from artist modal
      window.scrollTo(0, 0);
    }
  }, [location.search]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[e.target.name]) {
      setErrors(prev => ({
        ...prev,
        [e.target.name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Validate fields in order: Email → Username → Password → Confirm Password
    
    // 1. Email validation
    if (!formData.email.trim()) {
      setErrors({ email: 'Email is required' });
      return;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setErrors({ email: 'Please enter a valid email address' });
        return;
      }
    }

    // Skip email uniqueness check due to permissions - will check after signup

    // 2. Username validation
    if (!formData.username.trim()) {
      setErrors({ username: 'Username is required' });
      return;
    } else if (formData.username.length < 3) {
      setErrors({ username: 'Username must be at least 3 characters' });
      return;
    } else if (formData.username.length > 20) {
      setErrors({ username: 'Username must be less than 20 characters' });
      return;
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setErrors({ username: 'Username can only contain letters, numbers, and underscores' });
      return;
    }

    // Check username uniqueness before creating account
    try {
      console.log('Pre-signup username check for:', formData.username);
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', formData.username));
      const querySnapshot = await getDocs(q);
      
      console.log('Pre-signup: Found users with this username:', querySnapshot.size);
      
      if (!querySnapshot.empty) {
        setErrors({ username: 'Username is already taken. Please try a different username.' });
        return;
      }
      console.log('Pre-signup: Username is available');
    } catch (usernameError) {
      console.log('Pre-signup username check failed:', usernameError);
      setErrors({ username: 'Unable to verify username availability. Please try again later.' });
      return;
    }

    // 3. Password validation
    if (!formData.password) {
      setErrors({ password: 'Password is required' });
      return;
    } else if (formData.password.length < 8) {
      setErrors({ password: 'Password must be at least 8 characters' });
      return;
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      setErrors({ password: 'Password must contain at least one lowercase letter' });
      return;
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      setErrors({ password: 'Password must contain at least one uppercase letter' });
      return;
    } else if (!/(?=.*\d)/.test(formData.password)) {
      setErrors({ password: 'Password must contain at least one number' });
      return;
    } else if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(formData.password)) {
      setErrors({ password: 'Password must contain at least one special character' });
      return;
    }

    // 4. Confirm Password validation
    if (!formData.confirmPassword) {
      setErrors({ confirmPassword: 'Please confirm your password' });
      return;
    } else if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signup(formData.email, formData.password);

      // Create user profile in Firestore
      const userData = {
        name: formData.name,
        email: formData.email,
        username: formData.username,
        userType: userType,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('=== REGULAR SIGNUP DEBUG ===');
      console.log('Saving to Firestore:', userData);
      console.log('User UID:', userCredential.uid);
      
      await setDoc(doc(db, 'users', userCredential.uid), userData);
          
      console.log('Successfully saved to Firestore');
      console.log('=== END REGULAR SIGNUP DEBUG ===');
      
      // Navigate based on user type
      if (userType === 'artist') {
        navigate('/dashboard'); // Artist goes to profile setup
      } else {
        navigate('/'); // Regular user goes to home
      }
    } catch (error) {
      console.error('Signup error:', error);
      
      // Handle specific Firebase auth errors
      if (error.code === 'auth/email-already-in-use') {
        setErrors({ email: 'This email is already registered. Please use a different email or try logging in.' });
      } else if (error.code === 'auth/weak-password') {
        setErrors({ password: 'Password is too weak. Please choose a stronger password with at least 8 characters.' });
      } else if (error.code === 'auth/invalid-email') {
        setErrors({ email: 'Please enter a valid email address.' });
      } else if (error.code === 'auth/operation-not-allowed') {
        setErrors({ email: 'Email/password accounts are not enabled. Please contact support.' });
      } else if (error.code === 'auth/network-request-failed') {
        setErrors({ email: 'Network error. Please check your internet connection and try again.' });
      } else {
        setErrors({ email: error.message || 'Failed to create account. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img src="/favicon.ico" alt="nailXpress" className="h-12 w-12" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link
            to="/login"
            className="font-medium text-pink-600 hover:text-pink-500"
          >
            sign in to your existing account
          </Link>
        </p>
        
        {/* User Type Selection */}
        <div className="mt-6">
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              type="button"
              onClick={() => setUserType('user')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
                userType === 'user'
                  ? 'bg-pink-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <User className="w-4 h-4" />
              I'm a Client
            </button>
            <button
              type="button"
              onClick={() => setUserType('artist')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
                userType === 'artist'
                  ? 'bg-pink-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Palette className="w-4 h-4" />
              I'm an Artist
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500 text-center">
            {userType === 'user' 
              ? 'Browse and book nail artists' 
              : 'Create your artist profile and start getting clients'
            }
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full name
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <p className="mt-1 text-xs text-gray-500">
                Only letters, numbers, and underscores allowed
              </p>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-sm">@</span>
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className={`appearance-none block w-full pl-8 pr-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm ${
                    errors.username ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Choose a username"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none block w-full pl-10 pr-10 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`appearance-none block w-full pl-10 pr-10 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;