import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

// Basic container styles for the map
const containerStyle = {
	width: '100%',
	height: '480px'
};

// Default center (USA)
const defaultCenter = { lat: 39.8283, lng: -98.5795 };

/**
 * MapView
 * Renders a Google Map with markers for each artist. If artists don't have
 * lat/lng, attempts to geocode their string location via Maps JS Geocoder.
 */
const MapView = ({ artists = [] }) => {
	const { isLoaded } = useJsApiLoader({
		id: 'google-map-script',
		googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''
	});

	const mapRef = useRef(null);
	const [geocoded, setGeocoded] = useState([]);

	const center = useMemo(() => {
		const withCoords = artists.find(a => typeof a.lat === 'number' && typeof a.lng === 'number');
		if (withCoords) return { lat: withCoords.lat, lng: withCoords.lng };
		return defaultCenter;
	}, [artists]);

	useEffect(() => {
		if (!isLoaded) return;
		let cancelled = false;

		const run = async () => {
			const results = [];
			const geocoder = new window.google.maps.Geocoder();

			for (const artist of artists) {
				if (typeof artist.lat === 'number' && typeof artist.lng === 'number') {
					results.push({ ...artist, lat: artist.lat, lng: artist.lng });
					continue;
				}

				if (!artist.location) continue;
				try {
					// Geocode the textual location
					/* eslint no-await-in-loop: 0 */
					const geo = await geocoder.geocode({ address: artist.location });
					if (geo.results && geo.results[0]) {
						const { lat, lng } = geo.results[0].geometry.location;
						results.push({ ...artist, lat: lat(), lng: lng() });
					}
				} catch (e) {
					// Ignore individual geocode failures
				}
			}

			if (!cancelled) setGeocoded(results);
		};

		run();

		return () => {
			cancelled = true;
		};
	}, [artists, isLoaded]);

	const onLoad = map => {
		mapRef.current = map;
		// Fit bounds to markers when available
		if (geocoded.length > 0) {
			const bounds = new window.google.maps.LatLngBounds();
			geocoded.forEach(a => bounds.extend({ lat: a.lat, lng: a.lng }));
			map.fitBounds(bounds);
		}
	};

	const onUnmount = () => {
		mapRef.current = null;
	};

	if (!isLoaded) return (
		<div className="flex items-center justify-center h-64">
			<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
		</div>
	);

	const mapOptions = {
		zoomControl: true,
		streetViewControl: true,
		mapTypeControl: true,
		fullscreenControl: true,
		gestureHandling: 'greedy'
	};

	return (
		<div className="bg-white rounded-lg shadow-sm overflow-hidden">
			<GoogleMap
				mapContainerStyle={containerStyle}
				center={center}
				zoom={4}
				options={mapOptions}
				onLoad={onLoad}
				onUnmount={onUnmount}
			>
				{geocoded.map(artist => (
					<Marker
						key={artist.id}
						position={{ lat: artist.lat, lng: artist.lng }}
						title={artist.name || 'Nail Artist'}
					/>
				))}
			</GoogleMap>
		</div>
	);
};

export default MapView;


