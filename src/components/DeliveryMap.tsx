
import React, { useEffect, useRef, useState } from 'react';
import { Navigation, MapPin, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface DeliveryMapProps {
  pickupLocation: Location;
  dropoffLocation: Location;
  currentLocation?: Location;
  deliveryPartnerName?: string;
  showDirections?: boolean;
  onRouteCalculated?: (distance: number, duration: number) => void;
}

const DeliveryMap: React.FC<DeliveryMapProps> = ({
  pickupLocation,
  dropoffLocation,
  currentLocation,
  deliveryPartnerName,
  showDirections = false,
  onRouteCalculated
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);
  const mapboxToken = 'pk.eyJ1IjoiYXl1c2gyODg4IiwiYSI6ImNtYjZ0MTJkbjAyeXYybHNlenMxbXBjYjUifQ.9QvBaY9lvM6IAuq_l-VAsA';

  useEffect(() => {
    initializeMap();
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (map && currentLocation) {
      updateDeliveryPartnerLocation();
    }
  }, [currentLocation, map]);

  useEffect(() => {
    if (map && showDirections) {
      calculateRoute();
    }
  }, [map, showDirections, pickupLocation, dropoffLocation]);

  const initializeMap = async () => {
    if (!mapContainer.current) return;

    try {
      const mapboxgl = await import('mapbox-gl');
      mapboxgl.default.accessToken = mapboxToken;

      const mapInstance = new mapboxgl.default.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: currentLocation ? [currentLocation.lng, currentLocation.lat] : [dropoffLocation.lng, dropoffLocation.lat],
        zoom: 13,
        attributionControl: false
      });

      mapInstance.addControl(new mapboxgl.default.NavigationControl(), 'top-right');

      mapInstance.on('load', () => {
        addMarkers(mapInstance, mapboxgl.default);
        setMap(mapInstance);
      });

    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  const addMarkers = (mapInstance: any, mapboxgl: any) => {
    // Pickup location marker (blue)
    new mapboxgl.Marker({ color: '#3B82F6' })
      .setLngLat([pickupLocation.lng, pickupLocation.lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div class="p-2">
            <h3 class="font-semibold">Pickup Location</h3>
            <p class="text-sm text-gray-600">${pickupLocation.address || 'Restaurant'}</p>
          </div>
        `)
      )
      .addTo(mapInstance);

    // Dropoff location marker (red)
    new mapboxgl.Marker({ color: '#EF4444' })
      .setLngLat([dropoffLocation.lng, dropoffLocation.lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div class="p-2">
            <h3 class="font-semibold">Delivery Location</h3>
            <p class="text-sm text-gray-600">${dropoffLocation.address || 'Customer Address'}</p>
          </div>
        `)
      )
      .addTo(mapInstance);

    // Current location marker (green) if available
    if (currentLocation) {
      new mapboxgl.Marker({ color: '#10B981' })
        .setLngLat([currentLocation.lng, currentLocation.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-2">
              <h3 class="font-semibold">${deliveryPartnerName || 'Delivery Partner'}</h3>
              <p class="text-sm text-gray-600">Current Location</p>
              <p class="text-xs text-gray-500">Updated just now</p>
            </div>
          `)
        )
        .addTo(mapInstance);
    }
  };

  const updateDeliveryPartnerLocation = async () => {
    if (!map || !currentLocation) return;

    // Remove existing delivery partner markers
    const markers = document.querySelectorAll('.mapboxgl-marker[style*="rgb(16, 185, 129)"]');
    markers.forEach(marker => marker.remove());

    // Add new marker
    const mapboxgl = await import('mapbox-gl');
    new mapboxgl.default.Marker({ color: '#10B981' })
      .setLngLat([currentLocation.lng, currentLocation.lat])
      .setPopup(
        new mapboxgl.default.Popup({ offset: 25 }).setHTML(`
          <div class="p-2">
            <h3 class="font-semibold">${deliveryPartnerName || 'Delivery Partner'}</h3>
            <p class="text-sm text-gray-600">Current Location</p>
            <p class="text-xs text-gray-500">Updated just now</p>
          </div>
        `)
      )
      .addTo(map);

    // Center map on current location
    map.flyTo({
      center: [currentLocation.lng, currentLocation.lat],
      zoom: 15
    });
  };

  const calculateRoute = async () => {
    if (!map) return;

    const startPoint = currentLocation || pickupLocation;
    const endPoint = dropoffLocation;

    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${startPoint.lng},${startPoint.lat};${endPoint.lng},${endPoint.lat}?geometries=geojson&access_token=${mapboxToken}`
      );
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const distance = (route.distance / 1000).toFixed(2); // km
        const duration = Math.round(route.duration / 60); // minutes

        setRouteInfo({ distance: parseFloat(distance), duration });
        onRouteCalculated?.(parseFloat(distance), duration);

        // Add route to map
        if (map.getSource('route')) {
          map.removeSource('route');
          map.removeLayer('route');
        }

        map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: route.geometry
          }
        });

        map.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#10B981',
            'line-width': 4
          }
        });

        // Fit map to show entire route
        const coordinates = route.geometry.coordinates;
        const bounds = coordinates.reduce((bounds: any, coord: any) => {
          return bounds.extend(coord);
        }, new (await import('mapbox-gl')).default.LngLatBounds(coordinates[0], coordinates[0]));

        map.fitBounds(bounds, { padding: 50 });
      }
    } catch (error) {
      console.error('Error calculating route:', error);
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
      
      {/* Route Info Overlay */}
      {routeInfo && (
        <Card className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm">
          <CardContent className="p-3">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Navigation className="h-4 w-4 text-blue-500" />
                <span className="font-medium">{routeInfo.distance} km</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="font-medium">{routeInfo.duration} min</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Tracking Indicator */}
      {currentLocation && (
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Live tracking</span>
          </div>
        </div>
      )}

      {/* Legend */}
      <Card className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm">
        <CardContent className="p-3">
          <div className="space-y-2 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Pickup Location</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Delivery Location</span>
            </div>
            {currentLocation && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Current Location</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryMap;
