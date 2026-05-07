import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Polygon, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapEvents({ mode, onAddPoint }) {
    useMapEvents({
        click(e) {
            if (mode === 'manual') {
                onAddPoint(e.latlng);
            }
        },
    });
    return null;
}

function LocationMarker() {
    const [position, setPosition] = useState(null)
    const map = useMap()

    useEffect(() => {
        map.locate({ setView: true, maxZoom: 16 }).on("locationfound", function (e) {
            setPosition(e.latlng)
            map.flyTo(e.latlng, 16)
        })
    }, [map])

    return position === null ? null : (
        <Marker position={position}>
        </Marker>
    )
}

const LandMap = ({ onPolygonChange, otherLands = [] }) => {
    const [markers, setMarkers] = useState([]);
    const [mode, setMode] = useState('manual'); // 'manual' or 'tracking'
    const [trackingId, setTrackingId] = useState(null);
    const [currentPos, setCurrentPos] = useState(null);

    const handleAddPoint = (latlng) => {
        const newMarkers = [...markers, { lat: latlng.lat, lng: latlng.lng, accuracy: 5.0 }]; // Manual points assumed accurate (~5m)
        setMarkers(newMarkers);
        onPolygonChange(newMarkers);
    };

    const startTracking = () => {
        setMode('tracking');
        setMarkers([]); // Clear previous markers
        if (navigator.geolocation) {
            const id = navigator.geolocation.watchPosition(
                (position) => {
                    const latlng = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    };
                    setCurrentPos(latlng);
                    setMarkers(prev => {
                        const newMarkers = [...prev, latlng];
                        onPolygonChange(newMarkers);
                        return newMarkers;
                    });
                },
                (error) => console.error(error),
                { enableHighAccuracy: true }
            );
            setTrackingId(id);
        }
    };

    const stopTracking = () => {
        if (trackingId !== null) {
            navigator.geolocation.clearWatch(trackingId);
            setTrackingId(null);
        }
        setMode('manual'); // Default back to manual
    };

    const clearMap = () => {
        setMarkers([]);
        onPolygonChange([]);
        stopTracking();
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-2 mb-2">
                <button
                    className={`px-4 py-2 rounded ${mode === 'manual' ? 'bg-blue-600' : 'bg-gray-600'}`}
                    onClick={() => { stopTracking(); setMode('manual'); }}
                >
                    Manual Points
                </button>
                <button
                    className={`px-4 py-2 rounded ${mode === 'tracking' ? 'bg-green-600' : 'bg-gray-600'}`}
                    onClick={mode === 'tracking' ? stopTracking : startTracking}
                >
                    {mode === 'tracking' ? 'Stop Tracking' : 'Start Tracking'}
                </button>
                <button
                    className="px-4 py-2 rounded bg-red-600"
                    onClick={clearMap}
                >
                    Clear Map
                </button>
            </div>

            <div className="h-[400px] w-full border rounded-lg overflow-hidden relative">
                <MapContainer center={[20.5937, 78.9629]} zoom={15} maxZoom={19} scrollWheelZoom={true} className="h-full w-full">
                    <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                    />
                    <LocationMarker />
                    <MapEvents mode={mode} onAddPoint={handleAddPoint} />

                    {/* Current Drawing */}
                    {markers.map((position, idx) => (
                        <Marker key={`marker-${idx}`} position={position} />
                    ))}

                    {markers.length > 2 && (
                        <Polygon
                            positions={markers}
                            pathOptions={{ color: 'green', fillColor: 'green' }}
                        />
                    )}

                    {/* Verified Lands from Backend */}
                    {otherLands && otherLands.map((land) => {
                        if (!land.polygon_coordinates) return null;
                        const positions = land.polygon_coordinates.map(p => [p.lat, p.lng]);
                        const color = land.status === 'VERIFIED' ? 'blue' : (land.status === 'REJECTED' ? 'red' : 'orange');

                        return (
                            <Polygon
                                key={land.id}
                                positions={positions}
                                pathOptions={{ color: color, fillColor: color, fillOpacity: 0.2 }}
                            >
                                <Popup>
                                    <div className="text-gray-900 text-sm">
                                        <strong>Status:</strong> {land.status}<br />
                                        <strong>Area:</strong> {land.area_sqm?.toFixed(2)} sqm<br />
                                        <span className="text-xs text-gray-500">ID: {land.id.substring(0, 8)}...</span>
                                    </div>
                                </Popup>
                            </Polygon>
                        );
                    })}
                </MapContainer>

                {/* Legend overlay */}
                <div className="absolute bottom-4 left-4 z-[400] bg-white p-2 rounded shadow text-xs text-black opacity-80 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 bg-green-500 rounded-full"></span> Your Drawing</div>
                    <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 bg-blue-500 rounded-full"></span> Verified Land</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-500 rounded-full"></span> Rejected/Failed</div>
                </div>
            </div>

            <div className="text-sm text-gray-400">
                {markers.length} points recorded. Area will be calculated upon submission.
            </div>
        </div>
    );
};

export default LandMap;
