import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para los íconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationMapProps {
  latitude: string;
  longitude: string;
  title?: string;
  onClose: () => void;
}

const LocationMap: React.FC<LocationMapProps> = ({ latitude, longitude, title, onClose }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // Validar coordenadas
    if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
      console.warn('Coordenadas inválidas:', { latitude, longitude });
      return;
    }

    // Crear el mapa
    const map = L.map(mapRef.current).setView([lat, lng], 15);
    mapInstanceRef.current = map;

    // Agregar capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Agregar marcador
    const marker = L.marker([lat, lng]).addTo(map);
    
    if (title) {
      marker.bindPopup(title).openPopup();
    }

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, title]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Ubicación</h3>
              <p className="text-sm text-gray-600">
                {title || `Lat: ${latitude}, Lng: ${longitude}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4">
          <div 
            ref={mapRef} 
            className="w-full h-96 rounded-lg border border-gray-200"
            style={{ minHeight: '400px' }}
          />
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Información de Ubicación</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Latitud:</span>
                <span className="ml-2 font-medium">{latitude}</span>
              </div>
              <div>
                <span className="text-gray-500">Longitud:</span>
                <span className="ml-2 font-medium">{longitude}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationMap;
