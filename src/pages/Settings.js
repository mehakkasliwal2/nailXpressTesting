import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../firebase';
import { doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { auth } from '../firebase';
import { Trash2, AlertTriangle, User, Mail, Calendar, Edit, Check, X, AtSign } from 'lucide-react';

const Settings = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [localUserProfile, setLocalUserProfile] = useState(null);

  // Direct fetch of user profile as fallback
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (currentUser && !userProfile) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            console.log('Direct fetch - userData:', userData);
            setLocalUserProfile(userData);
          }
        } catch (error) {
          console.error('Error fetching user profile directly:', error);
        }
      }
    };

    fetchUserProfile();
  }, [currentUser, userProfile]);

  // Update editedName when userProfile changes
  useEffect(() => {
    const name = userProfile?.name || localUserProfile?.name || currentUser?.displayName || '';
    setEditedName(name);
  }, [userProfile?.name, localUserProfile?.name, currentUser?.displayName]);

  // Debug logging
  useEffect(() => {
    console.log('=== SETTINGS DEBUG ===');
    console.log('Settings - currentUser:', currentUser);
    console.log('Settings - userProfile:', userProfile);
    console.log('Settings - userProfile type:', typeof userProfile);
    console.log('Settings - userProfile keys:', userProfile ? Object.keys(userProfile) : 'null');
    if (userProfile) {
      console.log('userProfile.name:', userProfile.name);
      console.log('userProfile.username:', userProfile.username);
      console.log('userProfile.email:', userProfile.email);
      console.log('userProfile.userType:', userProfile.userType);
      console.log('userProfile.createdAt:', userProfile.createdAt);
    }
    console.log('=== END DEBUG ===');
  }, [currentUser, userProfile]);

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      return;
    }

    if (!currentUser) {
      return;
    }

    setIsDeleting(true);
    try {
      // Delete user's Firestore data
      if (userProfile?.userType === 'artist') {
        // Delete artist profile
        await deleteDoc(doc(db, 'artists', currentUser.uid));
        
        // Delete artist's storage files
        try {
          const storageRef = storage.ref(`artists/${currentUser.uid}`);
          const listResult = await storageRef.listAll();
          const deletePromises = listResult.items.map(item => item.delete());
          await Promise.all(deletePromises);
        } catch (storageError) {
          console.log('No storage files to delete or error deleting files:', storageError);
        }
      }

      // Delete user profile
      await deleteDoc(doc(db, 'users', currentUser.uid));

      // Delete any other user-related data
      // (You can add more collections here if needed)

      // Delete the Firebase Auth user
      await deleteUser(auth.currentUser);

      
      // The AuthContext will automatically handle the logout via onAuthStateChanged
      // Navigate to home page
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        name: editedName.trim(),
        updatedAt: new Date()
      });
      
      // The AuthContext will automatically update via onAuthStateChanged

      setIsEditingName(false);
    } catch (error) {
      console.error('Error updating name:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    const name = userProfile?.name || localUserProfile?.name || currentUser?.displayName || '';
    setEditedName(name);
    setIsEditingName(false);
  };


  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-pink-600">Manage your account preferences and data</p>
        </div>

        <div className="max-w-2xl">
          {/* Account Info */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-l-4 border-pink-500">
            <h2 className="text-xl font-semibold text-pink-900 mb-4">Account Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-pink-500" />
                <div className="flex-1">
                  <p className="text-sm text-pink-600">Name</p>
                  {isEditingName ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                        placeholder="Enter your name"
                      />
                      <button
                        onClick={handleSaveName}
                        disabled={isSaving}
                        className="p-2 text-green-600 hover:text-green-700 disabled:opacity-50"
                        title="Save"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-2 text-gray-600 hover:text-gray-700"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">
                        {userProfile?.name || localUserProfile?.name || currentUser?.displayName || 'Loading...'}
                      </p>
                      <button
                        onClick={() => setIsEditingName(true)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Edit name"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <AtSign className="w-5 h-5 text-pink-500" />
                <div>
                  <p className="text-sm text-pink-600">Username</p>
                  <p className="font-medium text-gray-900">
                    {userProfile?.username || localUserProfile?.username ? `@${userProfile?.username || localUserProfile?.username}` : 'Loading...'}
                  </p>
                  <p className="text-xs text-pink-500 mt-1">Note: username cannot be changed*</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-pink-500" />
                <div>
                  <p className="text-sm text-pink-600">Email</p>
                  <p className="font-medium text-gray-900">{currentUser?.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-pink-500" />
                <div>
                  <p className="text-sm text-pink-600">Member Since</p>
                  <p className="font-medium text-gray-900">
                    {userProfile?.createdAt 
                      ? new Date(userProfile.createdAt.seconds * 1000).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : currentUser?.metadata?.creationTime 
                        ? new Date(currentUser.metadata.creationTime).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'Unknown'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

              {/* Danger Zone */}
              <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-pink-800">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-pink-900">Danger Zone</h3>
                    <p className="text-pink-700 text-sm">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="bg-pink-800 hover:bg-pink-900 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </button>
              </div>
        </div>

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Account</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    This action cannot be undone. This will permanently delete your account and remove all data from our servers.
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type <span className="font-bold text-red-600">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                  placeholder="Type DELETE here"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirm('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deleteConfirm !== 'DELETE'}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
