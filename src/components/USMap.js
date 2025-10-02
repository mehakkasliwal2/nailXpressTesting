import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker, Annotation } from 'react-simple-maps';
import { geoCentroid } from 'd3-geo';

// US TopoJSON URL with centroids
const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

const USMap = ({ artistLocations, usStates, onStateClick, getCityXPosition, getCityYPosition, selectedState }) => {
  const [hoveredState, setHoveredState] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });


  // Calculate artist count and cities per state
  const getStateInfo = (stateCode) => {
    const stateLocations = artistLocations.filter(location => location.state === stateCode);
    const totalArtists = stateLocations.reduce((sum, loc) => sum + loc.count, 0);
    const cityCount = stateLocations.length;
    return { totalArtists, cityCount };
  };

  const handleMouseMove = (event) => {
    setTooltipPosition({ 
      x: event.clientX, 
      y: event.clientY 
    });
  };


  return (
    <div className="w-full h-full relative bg-pink-50">
      <ComposableMap
        projection="geoAlbersUsa"
        width={800}
        height={500}
        className="w-full h-full"
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) => {
            if (!geographies || geographies.length === 0) {
              return <text x={400} y={300} textAnchor="middle">Loading map...</text>;
            }
            
            return (
              <>
                {/* States */}
                {geographies.map((geo) => {
                  const stateName = geo.properties.NAME || geo.properties.name || 'Unknown';
                  const stateInfo = usStates[stateName];
                  const hasArtists = stateInfo?.hasArtists || false;
                  const stateAbbr = stateInfo?.abbr;
                  const stateData = getStateInfo(stateAbbr);
                  
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => onStateClick(stateName)}
                      onMouseEnter={() => {
                        setHoveredState({ 
                          name: stateName, 
                          abbr: stateAbbr,
                          count: stateData.totalArtists,
                          cityCount: stateData.cityCount
                        });
                      }}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={() => {
                        setHoveredState(null);
                      }}
                                  style={{
                                    default: {
                                      fill: selectedState && selectedState === stateName ? 
                                        (hasArtists ? "#EC4899" : "#E0E0E0") : 
                                        (hasArtists ? "#F8BBD9" : "#FFFFFF"),
                                      stroke: "#000000",
                                      strokeWidth: selectedState && selectedState === stateName ? 2 : 1,
                                      outline: "none",
                                    },
                                    hover: {
                                      fill: hasArtists ? "#EC4899" : "#E0E0E0",
                                      stroke: "#000000",
                                      strokeWidth: 2,
                                      outline: "none",
                                    },
                                    pressed: {
                                      fill: hasArtists ? "#EC4899" : "#E0E0E0",
                                      stroke: "#000000",
                                      strokeWidth: 2,
                                      outline: "none",
                                    },
                                  }}
                      className="cursor-pointer transition-all duration-200"
                    />
                  );
                })}

                {/* State Abbreviations - Using react-simple-maps components */}
                {geographies.map((geo) => {
                  const stateName = geo.properties.NAME || geo.properties.name || 'Unknown';
                  const stateInfo = usStates[stateName];
                  const stateAbbr = stateInfo?.abbr;
                  
                  if (!stateAbbr) return null;

                  const centroid = geoCentroid(geo);
                  if (!centroid) return null;

                  const tinyStates = [
                    "Rhode Island", 
                    "Delaware", 
                    "District of Columbia", 
                    "Connecticut", 
                    "New Jersey", 
                    "Massachusetts",
                    "Maryland"
                  ];

                  if (tinyStates.includes(stateName)) {
                    // Custom positioning for each state to prevent overlap
                    const getStateOffset = (stateName) => {
                      const offsets = {
                        "Massachusetts": { dx: 40, dy: -20 },
                        "Rhode Island": { dx: 40, dy: -10 },
                        "Connecticut": { dx: 40, dy: 0 },
                        "New Jersey": { dx: 40, dy: 10 },
                        "Delaware": { dx: 40, dy: 20 },
                        "Maryland": { dx: 40, dy: 30 },
                        "District of Columbia": { dx: 40, dy: 40 }
                      };
                      return offsets[stateName] || { dx: 40, dy: -8 };
                    };

                    const offset = getStateOffset(stateName);

                    return (
                      <Annotation
                        key={`annotation-${geo.rsmKey}`}
                        subject={centroid}
                        dx={offset.dx}
                        dy={offset.dy}
                        connectorProps={{ stroke: "#999", strokeWidth: 0.8, strokeOpacity: 0.8 }}
                      >
                        <text fontSize={11} fontWeight="700" fill="#1F2937" pointerEvents="none">
                          {stateAbbr}
                        </text>
                      </Annotation>
                    );
                  }

                  // Special positioning for Florida and Hawaii
                  if (stateName === "Florida") {
                    return (
                      <Marker key={`marker-${geo.rsmKey}`} coordinates={centroid}>
                        <text
                          textAnchor="middle"
                          alignmentBaseline="central"
                          fontSize={11}
                          fontWeight="700"
                          fill="#1F2937"
                          x={8}
                          pointerEvents="none"
                        >
                          {stateAbbr}
                        </text>
                      </Marker>
                    );
                  }

                  if (stateName === "Hawaii") {
                    return (
                      <Marker key={`marker-${geo.rsmKey}`} coordinates={centroid}>
                        <text
                          textAnchor="middle"
                          alignmentBaseline="central"
                          fontSize={11}
                          fontWeight="700"
                          fill="#1F2937"
                          x={-8}
                          y={8}
                          pointerEvents="none"
                        >
                          {stateAbbr}
                        </text>
                      </Marker>
                    );
                  }

                  if (stateName === "Louisiana") {
                    return (
                      <Marker key={`marker-${geo.rsmKey}`} coordinates={centroid}>
                        <text
                          textAnchor="middle"
                          alignmentBaseline="central"
                          fontSize={11}
                          fontWeight="700"
                          fill="#1F2937"
                          x={-6}
                          pointerEvents="none"
                        >
                          {stateAbbr}
                        </text>
                      </Marker>
                    );
                  }

                  if (stateName === "California") {
                    return (
                      <Marker key={`marker-${geo.rsmKey}`} coordinates={centroid}>
                        <text
                          textAnchor="middle"
                          alignmentBaseline="central"
                          fontSize={11}
                          fontWeight="700"
                          fill="#1F2937"
                          x={-5}
                          pointerEvents="none"
                        >
                          {stateAbbr}
                        </text>
                      </Marker>
                    );
                  }

                  return (
                    <Marker key={`marker-${geo.rsmKey}`} coordinates={centroid}>
                      <text
                        textAnchor="middle"
                        alignmentBaseline="central"
                        fontSize={11}
                        fontWeight="700"
                        fill="#1F2937"
                        pointerEvents="none"
                      >
                        {stateAbbr}
                      </text>
                    </Marker>
                  );
                })}
              </>
            );
          }}
        </Geographies>
      </ComposableMap>

      {/* Tooltip */}
      {hoveredState && (
        <div
          className="fixed z-50 bg-pink-600 text-white px-3 py-2 rounded-lg shadow-lg text-sm pointer-events-none max-w-xs"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 40,
          }}
        >
          <div className="font-semibold">{hoveredState.name}</div>
          <div className="text-xs">
            {hoveredState.count > 0 
              ? `${hoveredState.count} artist${hoveredState.count > 1 ? 's' : ''}`
              : 'No artists'
            }
          </div>
        </div>
      )}


    </div>
  );
};

export default USMap;
