import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArtists } from '../contexts/ArtistContext';
import USMap from '../components/USMap';

const Locations = () => {
  const navigate = useNavigate();
  const { updateFilters, allArtists } = useArtists();
  const [artistLocations, setArtistLocations] = useState([]);

  // Process artist locations to get unique cities and states
  useEffect(() => {
    if (!allArtists || allArtists.length === 0) return;
    
    const locations = new Map();
    const statesWithArtists = new Set();

    allArtists.forEach(artist => {
      if (artist.city && artist.state) {
        const cityKey = `${artist.city}, ${artist.state}`;
        if (locations.has(cityKey)) {
          locations.get(cityKey).count += 1;
        } else {
          locations.set(cityKey, {
            city: artist.city,
            state: artist.state,
            count: 1,
            artists: [artist.displayName || artist.email]
          });
        }
        statesWithArtists.add(artist.state);
      }
    });

    setArtistLocations(Array.from(locations.values()));
  }, [allArtists]);

  // Clear state filter when component mounts (coming back to Locations page)
  useEffect(() => {
    // Clear any existing state filter when entering the Locations page
    updateFilters({ stateSearch: '' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run on mount

  // State name to abbreviation mapping
  const stateNameToAbbr = {
    'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
    'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
    'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
    'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
    'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
    'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
    'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
    'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
    'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
    'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
  };

  // US States data for mapping (using full names as keys for TopoJSON compatibility)
  const usStates = useMemo(() => ({
    'Alabama': { name: 'Alabama', abbr: 'AL', hasArtists: artistLocations.some(loc => loc.state === 'AL') },
    'Alaska': { name: 'Alaska', abbr: 'AK', hasArtists: artistLocations.some(loc => loc.state === 'AK') },
    'Arizona': { name: 'Arizona', abbr: 'AZ', hasArtists: artistLocations.some(loc => loc.state === 'AZ') },
    'Arkansas': { name: 'Arkansas', abbr: 'AR', hasArtists: artistLocations.some(loc => loc.state === 'AR') },
    'California': { name: 'California', abbr: 'CA', hasArtists: artistLocations.some(loc => loc.state === 'CA') },
    'Colorado': { name: 'Colorado', abbr: 'CO', hasArtists: artistLocations.some(loc => loc.state === 'CO') },
    'Connecticut': { name: 'Connecticut', abbr: 'CT', hasArtists: artistLocations.some(loc => loc.state === 'CT') },
    'Delaware': { name: 'Delaware', abbr: 'DE', hasArtists: artistLocations.some(loc => loc.state === 'DE') },
    'Florida': { name: 'Florida', abbr: 'FL', hasArtists: artistLocations.some(loc => loc.state === 'FL') },
    'Georgia': { name: 'Georgia', abbr: 'GA', hasArtists: artistLocations.some(loc => loc.state === 'GA') },
    'Hawaii': { name: 'Hawaii', abbr: 'HI', hasArtists: artistLocations.some(loc => loc.state === 'HI') },
    'Idaho': { name: 'Idaho', abbr: 'ID', hasArtists: artistLocations.some(loc => loc.state === 'ID') },
    'Illinois': { name: 'Illinois', abbr: 'IL', hasArtists: artistLocations.some(loc => loc.state === 'IL') },
    'Indiana': { name: 'Indiana', abbr: 'IN', hasArtists: artistLocations.some(loc => loc.state === 'IN') },
    'Iowa': { name: 'Iowa', abbr: 'IA', hasArtists: artistLocations.some(loc => loc.state === 'IA') },
    'Kansas': { name: 'Kansas', abbr: 'KS', hasArtists: artistLocations.some(loc => loc.state === 'KS') },
    'Kentucky': { name: 'Kentucky', abbr: 'KY', hasArtists: artistLocations.some(loc => loc.state === 'KY') },
    'Louisiana': { name: 'Louisiana', abbr: 'LA', hasArtists: artistLocations.some(loc => loc.state === 'LA') },
    'Maine': { name: 'Maine', abbr: 'ME', hasArtists: artistLocations.some(loc => loc.state === 'ME') },
    'Maryland': { name: 'Maryland', abbr: 'MD', hasArtists: artistLocations.some(loc => loc.state === 'MD') },
    'Massachusetts': { name: 'Massachusetts', abbr: 'MA', hasArtists: artistLocations.some(loc => loc.state === 'MA') },
    'Michigan': { name: 'Michigan', abbr: 'MI', hasArtists: artistLocations.some(loc => loc.state === 'MI') },
    'Minnesota': { name: 'Minnesota', abbr: 'MN', hasArtists: artistLocations.some(loc => loc.state === 'MN') },
    'Mississippi': { name: 'Mississippi', abbr: 'MS', hasArtists: artistLocations.some(loc => loc.state === 'MS') },
    'Missouri': { name: 'Missouri', abbr: 'MO', hasArtists: artistLocations.some(loc => loc.state === 'MO') },
    'Montana': { name: 'Montana', abbr: 'MT', hasArtists: artistLocations.some(loc => loc.state === 'MT') },
    'Nebraska': { name: 'Nebraska', abbr: 'NE', hasArtists: artistLocations.some(loc => loc.state === 'NE') },
    'Nevada': { name: 'Nevada', abbr: 'NV', hasArtists: artistLocations.some(loc => loc.state === 'NV') },
    'New Hampshire': { name: 'New Hampshire', abbr: 'NH', hasArtists: artistLocations.some(loc => loc.state === 'NH') },
    'New Jersey': { name: 'New Jersey', abbr: 'NJ', hasArtists: artistLocations.some(loc => loc.state === 'NJ') },
    'New Mexico': { name: 'New Mexico', abbr: 'NM', hasArtists: artistLocations.some(loc => loc.state === 'NM') },
    'New York': { name: 'New York', abbr: 'NY', hasArtists: artistLocations.some(loc => loc.state === 'NY') },
    'North Carolina': { name: 'North Carolina', abbr: 'NC', hasArtists: artistLocations.some(loc => loc.state === 'NC') },
    'North Dakota': { name: 'North Dakota', abbr: 'ND', hasArtists: artistLocations.some(loc => loc.state === 'ND') },
    'Ohio': { name: 'Ohio', abbr: 'OH', hasArtists: artistLocations.some(loc => loc.state === 'OH') },
    'Oklahoma': { name: 'Oklahoma', abbr: 'OK', hasArtists: artistLocations.some(loc => loc.state === 'OK') },
    'Oregon': { name: 'Oregon', abbr: 'OR', hasArtists: artistLocations.some(loc => loc.state === 'OR') },
    'Pennsylvania': { name: 'Pennsylvania', abbr: 'PA', hasArtists: artistLocations.some(loc => loc.state === 'PA') },
    'Rhode Island': { name: 'Rhode Island', abbr: 'RI', hasArtists: artistLocations.some(loc => loc.state === 'RI') },
    'South Carolina': { name: 'South Carolina', abbr: 'SC', hasArtists: artistLocations.some(loc => loc.state === 'SC') },
    'South Dakota': { name: 'South Dakota', abbr: 'SD', hasArtists: artistLocations.some(loc => loc.state === 'SD') },
    'Tennessee': { name: 'Tennessee', abbr: 'TN', hasArtists: artistLocations.some(loc => loc.state === 'TN') },
    'Texas': { name: 'Texas', abbr: 'TX', hasArtists: artistLocations.some(loc => loc.state === 'TX') },
    'Utah': { name: 'Utah', abbr: 'UT', hasArtists: artistLocations.some(loc => loc.state === 'UT') },
    'Vermont': { name: 'Vermont', abbr: 'VT', hasArtists: artistLocations.some(loc => loc.state === 'VT') },
    'Virginia': { name: 'Virginia', abbr: 'VA', hasArtists: artistLocations.some(loc => loc.state === 'VA') },
    'Washington': { name: 'Washington', abbr: 'WA', hasArtists: artistLocations.some(loc => loc.state === 'WA') },
    'West Virginia': { name: 'West Virginia', abbr: 'WV', hasArtists: artistLocations.some(loc => loc.state === 'WV') },
    'Wisconsin': { name: 'Wisconsin', abbr: 'WI', hasArtists: artistLocations.some(loc => loc.state === 'WI') },
    'Wyoming': { name: 'Wyoming', abbr: 'WY', hasArtists: artistLocations.some(loc => loc.state === 'WY') }
  }), [artistLocations]);

  const handleStateClick = (stateName) => {
    const stateAbbr = stateNameToAbbr[stateName];
    const stateHasArtists = usStates[stateName]?.hasArtists;
    
    if (stateHasArtists) {
      // Navigate to Artists page with state filter
      updateFilters({ stateSearch: stateAbbr });
      navigate('/artists');
    }
  };

  const getCityXPosition = () => 50;
  const getCityYPosition = () => 50;

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-none mx-auto px-4 sm:px-6 lg:px-20 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Artist Locations</h1>
              <p className="text-gray-600 mt-1">
                Click to view the artists in your state!
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-none mx-auto px-4 sm:px-6 lg:px-20 py-4 sm:py-8 2xl:pb-4">
        {/* Map */}
        <div className="mb-4 flex justify-center">
          <div className="w-full max-w-6xl">
            <div className="w-full h-[450px] sm:h-[550px] bg-pink-50 rounded-lg overflow-hidden relative mb-4">
              <div className="w-full h-full relative -mt-6 -mb-32 sm:mt-0 sm:mb-0">
                <USMap 
                  artistLocations={artistLocations}
                  usStates={usStates}
                  onStateClick={handleStateClick}
                  getCityXPosition={getCityXPosition}
                  getCityYPosition={getCityYPosition}
                />
              </div>
            </div>
            
            {/* Legend - Below the map */}
            <div className="flex justify-center">
              <div className="bg-white rounded-lg shadow-sm p-2 sm:p-3 text-xs sm:text-sm border">
                <div className="flex items-center gap-3 sm:gap-6">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-pink-300 rounded-full"></div>
                    <span>States with artists</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white border border-gray-300 rounded-full"></div>
                    <span>States without artists</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Locations;