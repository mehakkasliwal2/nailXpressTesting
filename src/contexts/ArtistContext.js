import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

// State mapping for search functionality
const STATE_MAPPING = {
  // Full names to abbreviations
  'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
  'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
  'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
  'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
  'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
  'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
  'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
  'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
  'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY',
  // Abbreviations to full names (for reverse lookup)
  'AL': 'alabama', 'AK': 'alaska', 'AZ': 'arizona', 'AR': 'arkansas', 'CA': 'california',
  'CO': 'colorado', 'CT': 'connecticut', 'DE': 'delaware', 'FL': 'florida', 'GA': 'georgia',
  'HI': 'hawaii', 'ID': 'idaho', 'IL': 'illinois', 'IN': 'indiana', 'IA': 'iowa',
  'KS': 'kansas', 'KY': 'kentucky', 'LA': 'louisiana', 'ME': 'maine', 'MD': 'maryland',
  'MA': 'massachusetts', 'MI': 'michigan', 'MN': 'minnesota', 'MS': 'mississippi', 'MO': 'missouri',
  'MT': 'montana', 'NE': 'nebraska', 'NV': 'nevada', 'NH': 'new hampshire', 'NJ': 'new jersey',
  'NM': 'new mexico', 'NY': 'new york', 'NC': 'north carolina', 'ND': 'north dakota', 'OH': 'ohio',
  'OK': 'oklahoma', 'OR': 'oregon', 'PA': 'pennsylvania', 'RI': 'rhode island', 'SC': 'south carolina',
  'SD': 'south dakota', 'TN': 'tennessee', 'TX': 'texas', 'UT': 'utah', 'VT': 'vermont',
  'VA': 'virginia', 'WA': 'washington', 'WV': 'west virginia', 'WI': 'wisconsin', 'WY': 'wyoming'
};

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
    color: [], // Added for multiple color selections
    artistName: '', // Separate search for artist names
    citySearch: '', // Separate search for cities
    stateSearch: '' // Separate search for states
  });

  // Helper function to expand search terms with state mappings
  const expandSearchTerms = (searchTerm) => {
    const normalizedTerm = searchTerm.toLowerCase();
    const expandedTerms = [normalizedTerm];
    
        // Check if search term is a state name or abbreviation
        if (STATE_MAPPING[normalizedTerm]) {
          // If it's a full state name, add the abbreviation
          expandedTerms.push(STATE_MAPPING[normalizedTerm]);
        } else if (STATE_MAPPING[normalizedTerm.toUpperCase()]) {
          // If it's an abbreviation, add the full name
          expandedTerms.push(STATE_MAPPING[normalizedTerm.toUpperCase()]);
        }
    
    return expandedTerms;
  };

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
    const matchesLocation = !filters.location || (() => {
      const locationTerms = expandSearchTerms(filters.location);
      
      // Check city (full and partial matches)
      if (artist.city && locationTerms.some(term => 
        artist.city.toLowerCase().includes(term))) return true;
      
        // Check state (full and partial matches)
        if (artist.state && locationTerms.some(term => 
          artist.state.toLowerCase().includes(term))) return true;
        
        // Check if the location filter term is a state name and the artist's state is the abbreviation
        if (artist.state) {
          const artistStateUpper = artist.state.toUpperCase();
          const artistStateLower = artist.state.toLowerCase();
          
          // If artist has abbreviation (MN), check if location filter is full name (Minnesota)
          if (STATE_MAPPING[artistStateUpper] && locationTerms.some(term => 
            STATE_MAPPING[artistStateUpper].toLowerCase().includes(term.toLowerCase()))) {
            return true;
          }
          
          // If artist has full name (Minnesota), check if location filter is abbreviation (MN)
          const fullStateName = Object.keys(STATE_MAPPING).find(key => 
            STATE_MAPPING[key].toLowerCase() === artistStateLower);
          if (fullStateName && locationTerms.some(term => 
            term.toUpperCase() === fullStateName)) {
            return true;
          }
        }
      
      // Check full location string
      const fullLocation = `${artist.city || ''} ${artist.state || ''}`.toLowerCase();
      if (locationTerms.some(term => fullLocation.includes(term))) return true;
      
      // Check legacy location field (some artists might have location stored as single string)
      if (artist.location && locationTerms.some(term => 
        artist.location.toLowerCase().includes(term))) return true;
      
      // Check if any word in the location term matches any word in the location
      const allLocationWords = locationTerms.flatMap(term => term.split(/\s+/));
      const artistLocationWords = fullLocation.split(/[\s,]+/);
      
      return allLocationWords.some(searchWord => 
        searchWord.length > 1 && // Only match words longer than 1 character
        artistLocationWords.some(locationWord => 
          locationWord.includes(searchWord) || searchWord.includes(locationWord)
        )
      );
    })();
    
    const matchesStyle = !filters.style.length || 
      filters.style.some(selectedStyle => 
        artist.styles?.some(artistStyle => 
          artistStyle.toLowerCase().includes(selectedStyle.toLowerCase())
        )
      );
    
    const matchesColor = !filters.color.length || 
      filters.color.some(selectedColor => 
        artist.colors?.some(artistColor => 
          artistColor.toLowerCase().includes(selectedColor.toLowerCase())
        )
      );
    
    // Check artist name search
    const matchesArtistName = !filters.artistName || 
      (artist.displayName && artist.displayName.toLowerCase().includes(filters.artistName.toLowerCase()));
    
    // Check city search
    const matchesCitySearch = !filters.citySearch || (() => {
      const cityTerms = expandSearchTerms(filters.citySearch);
      
      // Check city (full and partial matches)
      if (artist.city && cityTerms.some(term => 
        artist.city.toLowerCase().includes(term))) return true;
      
      // Check legacy location field for city
      if (artist.location && cityTerms.some(term => 
        artist.location.toLowerCase().includes(term))) return true;
      
      return false;
    })();
    
    // Check state search
    const matchesStateSearch = !filters.stateSearch || (() => {
      const stateTerms = expandSearchTerms(filters.stateSearch);
      
      // Check state (full and partial matches)
      if (artist.state && stateTerms.some(term => 
        artist.state.toLowerCase().includes(term))) return true;
      
      // Check if the state search term is a state name and the artist's state is the abbreviation
      if (artist.state) {
        const artistStateUpper = artist.state.toUpperCase();
        const artistStateLower = artist.state.toLowerCase();
        
        // If artist has abbreviation (MN), check if state search is full name (Minnesota)
        if (STATE_MAPPING[artistStateUpper] && stateTerms.some(term => 
          STATE_MAPPING[artistStateUpper].toLowerCase().includes(term.toLowerCase()))) {
          return true;
        }
        
        // If artist has full name (Minnesota), check if state search is abbreviation (MN)
        const fullStateName = Object.keys(STATE_MAPPING).find(key => 
          STATE_MAPPING[key].toLowerCase() === artistStateLower);
        if (fullStateName && stateTerms.some(term => 
          term.toUpperCase() === fullStateName)) {
          return true;
        }
      }
      
      return false;
    })();
    
    
    return matchesLocation && matchesStyle && matchesColor && matchesArtistName && matchesCitySearch && matchesStateSearch;
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
      color: [], // Added color field
      artistName: '',
      citySearch: '',
      stateSearch: ''
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
