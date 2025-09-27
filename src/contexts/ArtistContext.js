import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

const ArtistContext = createContext();

export const useArtists = () => {
  const context = useContext(ArtistContext);
  if (!context) {
    throw new Error('useArtists must be used within an ArtistProvider');
  }
  return context;
};

export const ArtistProvider = ({ children }) => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: '',
    style: [], // Changed to array for multiple selections
    search: ''
  });

  // Fetch all artists
  const fetchArtists = async () => {
    try {
      setLoading(true);
      const artistsRef = collection(db, 'artists');
      const q = query(artistsRef, where('isActive', '==', true));
      const querySnapshot = await getDocs(q);
      
      const artistsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by createdAt in descending order (newest first)
      const sortedArtists = artistsData.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB - dateA;
      });
      
      setArtists(sortedArtists);
    } catch (error) {
      console.error('Error fetching artists:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter artists based on current filters
  const filteredArtists = artists.filter(artist => {
    const matchesLocation = !filters.location || 
      artist.city?.toLowerCase().includes(filters.location.toLowerCase()) ||
      artist.state?.toLowerCase().includes(filters.location.toLowerCase());
    
    const matchesStyle = !filters.style.length || 
      filters.style.some(selectedStyle => 
        artist.styles?.some(artistStyle => 
          artistStyle.toLowerCase().includes(selectedStyle.toLowerCase())
        )
      );
    
    const matchesSearch = !filters.search || 
      artist.displayName?.toLowerCase().includes(filters.search.toLowerCase()) ||
      artist.bio?.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesLocation && matchesStyle && matchesSearch;
  });

  // Update filters
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      location: '',
      style: [], // Changed to empty array
      search: ''
    });
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  const value = {
    artists: filteredArtists,
    allArtists: artists,
    loading,
    filters,
    updateFilters,
    clearFilters,
    refetchArtists: fetchArtists
  };

  return (
    <ArtistContext.Provider value={value}>
      {children}
    </ArtistContext.Provider>
  );
};
