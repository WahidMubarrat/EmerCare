import { useEffect, useState } from 'react';

export function useGeolocation(options) {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setError(new Error('Geolocation not supported'));
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setPosition({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      }),
      (err) => setError(err),
      options
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [options]);

  return { position, error };
}
