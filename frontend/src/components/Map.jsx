import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { getBins, getFullBins } from "../services/api";
import L from "leaflet";
import axios from "axios";

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

export default function Map() {
  const [bins, setBins] = useState([]);
  const [mainRoute, setMainRoute] = useState([]);
  const [altRoute, setAltRoute] = useState([]);
  const [truckPosition, setTruckPosition] = useState(null);
  const [animationRef, setAnimationRef] = useState(null);

  const truckStart = { lat: 20.2955, lng: 85.8240 };

  const truckIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/743/743922.png",
    iconSize: [40, 40],
  });

  // 🎨 Bin icon
  const getIcon = (status) => {
    let color = "green";
    if (status === "Full") color = "red";
    else if (status === "Half") color = "orange";

    return new L.Icon({
      iconUrl: `https://maps.google.com/mapfiles/ms/icons/${color}-dot.png`,
      iconSize: [32, 32],
    });
  };

  // 🌍 ORS routing
  const getRouteFromORS = async (coordinates) => {
    const apiKey = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjE0MWRiNDMyYjkwZTQyYTdhMmVmMTkwMzZhMjhmZTU0IiwiaCI6Im11cm11cjY0In0=";

    const res = await axios.post(
      "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
      { coordinates },
      {
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    return res.data.features[0].geometry.coordinates;
  };

  // 🚛 Animate truck
  const animateTruck = (route) => {
    if (!route || route.length === 0) return;

    // stop previous animation
    if (animationRef) clearInterval(animationRef);

    let i = 0;
    setTruckPosition(route[0]);

    const interval = setInterval(() => {
      i++;

      if (i >= route.length) {
        clearInterval(interval);
        return;
      }

      setTruckPosition(route[i]);
    }, 300); // speed

    setAnimationRef(interval);
  };

  useEffect(() => {
    const fetchData = async () => {
      const allBins = await getBins();
      setBins(allBins);

      const fullBins = await getFullBins();
      if (!fullBins.length) {
        setTruckPosition([truckStart.lat, truckStart.lng]);
        return;
      }

      try {
        // 🔵 MAIN ROUTE
        const coords = [
          [truckStart.lng, truckStart.lat],
          ...fullBins.map((b) => [b.lng, b.lat]),
        ];

        const route = await getRouteFromORS(coords);

        const leafletRoute = route.map(([lng, lat]) => [lat, lng]);
        setMainRoute(leafletRoute);

        // 🚛 START MOVEMENT
        animateTruck(leafletRoute);

        // 🟣 ALT ROUTE
        const reversed = [...fullBins].reverse();
        const altCoords = [
          [truckStart.lng, truckStart.lat],
          ...reversed.map((b) => [b.lng, b.lat]),
        ];

        const alt = await getRouteFromORS(altCoords);
        setAltRoute(alt.map(([lng, lat]) => [lat, lng]));

      } catch (err) {
        console.error("Routing error:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[60vh] sm:h-[70vh] lg:h-full rounded-xl overflow-hidden">
      
      {/* 🧭 Legend */}
      <div className="absolute z-[1000] top-2 right-2 bg-white p-3 rounded-lg shadow-md text-xs sm:text-sm">
        <p>🔵 Route</p>
        <p>🟣 Alt Route</p>
        <p>🔴 Full</p>
        <p>🟠 Half</p>
        <p>🟢 Empty</p>
      </div>

      <MapContainer
        center={[20.2961, 85.8245]}
        zoom={14}
        className="w-full h-full"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* 📍 Bins */}
        {bins.map((bin) => (
          <Marker
            key={bin.id}
            position={[bin.lat, bin.lng]}
            icon={getIcon(bin.status)}
          >
            <Popup>
              <div className="text-sm">
                <b>{bin.id}</b><br />
                {bin.status} ({bin.level}%)
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 🚛 Moving Truck */}
        {truckPosition && (
          <Marker position={truckPosition} icon={truckIcon}>
            <Popup>🚛 Collecting Waste</Popup>
          </Marker>
        )}

        {/* 🔵 Main Route */}
        {mainRoute.length > 0 && (
          <Polyline positions={mainRoute} color="blue" weight={5} />
        )}

        {/* 🟣 Alt Route */}
        {altRoute.length > 0 && (
          <Polyline
            positions={altRoute}
            color="purple"
            weight={4}
            dashArray="6,10"
          />
        )}
      </MapContainer>
    </div>
  );
}