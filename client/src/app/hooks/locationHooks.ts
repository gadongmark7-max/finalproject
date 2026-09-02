import { useEffect, useState } from "react";

export function useCurrentLocation() {
    const [location, setLocation] = useState<{
        lat: number;
        lng: number;
    } | null>(null);
      

  useEffect(() => {
    if (!navigator.geolocation) {
      console.log("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => console.error(err.message)
    );
  }, []);

  return location;
}

export default useCurrentLocation;
