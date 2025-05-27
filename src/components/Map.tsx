
import React, { useEffect, useRef, useState } from 'react';
import { Navigation } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapProps {
  deliveryLocation?: { lat: number; lng: number };
  deliveryPartnerName?: string;
}

const Map: React.FC<MapProps> = ({ deliveryLocation, deliveryPartnerName }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [mapboxToken, setMapboxToken] = useState('pk.eyJ1IjoiYXl1c2gyODg4IiwiYSI6ImNtYjZ0MTJkbjAyeXYybHNlenMxbXBjYjUifQ.9QvBaY9lvM6IAuq_l-VAsA');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if token is already stored or use the provided one
    const storedToken = localStorage.getItem('mapbox_token') || mapboxToken;
    if (storedToken) {
      setMapboxToken(storedToken);
      setShowTokenInput(false);
      initializeMap(storedToken);
    }
  }, []);

  useEffect(() => {
    if (mapboxToken && deliveryLocation && !showTokenInput) {
      updateMapLocation();
    }
  }, [deliveryLocation, mapboxToken, showTokenInput]);

  const initializeMap = async (token: string) => {
    if (!mapContainer.current) return;

    try {
      // Dynamic import of mapbox-gl
      const mapboxgl = await import('mapbox-gl');
      
      mapboxgl.default.accessToken = token;

      const map = new mapboxgl.default.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: deliveryLocation ? [deliveryLocation.lng, deliveryLocation.lat] : [-122.4194, 37.7749],
        zoom: 15,
        attributionControl: false
      });

      // Add navigation controls
      map.addControl(new mapboxgl.default.NavigationControl(), 'top-right');

      // Add delivery partner marker
      if (deliveryLocation) {
        const marker = new mapboxgl.default.Marker({
          color: '#10B981'
        })
          .setLngLat([deliveryLocation.lng, deliveryLocation.lat])
          .addTo(map);

        // Add popup
        const popup = new mapboxgl.default.Popup({ offset: 25 })
          .setHTML(`
            <div class="p-2">
              <h3 class="font-semibold">${deliveryPartnerName || 'Delivery Partner'}</h3>
              <p class="text-sm text-gray-600">Current location</p>
            </div>
          `);
        
        marker.setPopup(popup);
      }

      // Store map instance for updates
      (window as any).mapInstance = map;

      toast({
        title: 'Map Loaded',
        description: 'Map has been successfully initialized'
      });

    } catch (error) {
      console.error('Error initializing map:', error);
      toast({
        title: 'Map Error',
        description: 'Failed to load map. Please check your Mapbox token.',
        variant: 'destructive'
      });
    }
  };

  const updateMapLocation = () => {
    const map = (window as any).mapInstance;
    if (map && deliveryLocation) {
      // Update map center
      map.flyTo({
        center: [deliveryLocation.lng, deliveryLocation.lat],
        zoom: 15
      });

      // Remove existing markers
      const markers = document.querySelectorAll('.mapboxgl-marker');
      markers.forEach(marker => marker.remove());

      // Add new marker
      import('mapbox-gl').then(mapboxgl => {
        const marker = new mapboxgl.default.Marker({
          color: '#10B981'
        })
          .setLngLat([deliveryLocation.lng, deliveryLocation.lat])
          .addTo(map);

        const popup = new mapboxgl.default.Popup({ offset: 25 })
          .setHTML(`
            <div class="p-2">
              <h3 class="font-semibold">${deliveryPartnerName || 'Delivery Partner'}</h3>
              <p class="text-sm text-gray-600">Current location</p>
              <p class="text-xs text-gray-500">Updated just now</p>
            </div>
          `);
        
        marker.setPopup(popup);
      });
    }
  };

  const handleTokenSubmit = () => {
    if (!mapboxToken.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your Mapbox token',
        variant: 'destructive'
      });
      return;
    }

    localStorage.setItem('mapbox_token', mapboxToken);
    setShowTokenInput(false);
    initializeMap(mapboxToken);
    
    toast({
      title: 'Success',
      description: 'Mapbox token saved and map initialized'
    });
  };

  if (showTokenInput) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100 p-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-6">
            <Navigation className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Mapbox Token Required</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please enter your Mapbox public token to display the map.
            </p>
            <p className="text-xs text-blue-600">
              Get your token at: 
              <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="underline ml-1">
                mapbox.com
              </a>
            </p>
          </div>
          
          <div className="space-y-4">
            <Input
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              placeholder="pk.eyJ1IjoieW91cm..."
              type="password"
            />
            <Button onClick={handleTokenSubmit} className="w-full">
              Initialize Map
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
      {deliveryLocation && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Live tracking</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;
