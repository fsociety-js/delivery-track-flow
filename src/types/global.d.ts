
declare global {
  interface Window {
    locationUpdateCallback?: (location: { lat: number; lng: number }) => void;
    mapInstance?: any;
  }
}

export {};
