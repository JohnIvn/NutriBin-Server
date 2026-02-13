import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Requests from "@/utils/Requests";
import { toast } from "sonner";
import {
  MapPin,
  Info,
  Users,
  Activity,
  Wrench,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

// Helper component to auto-fit bounds
function SetBounds({ markers }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [markers, map]);
  return null;
}

// Fix for default marker icons in Leaflet with React
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Using CDN for colored markers to avoid bundling issues with binary files
const GreenIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const RedIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Hardcoded coordinates for seed data addresses to ensure instant feedback
const SEED_GEO_MAP = {
  "123 Main St, Springfield, IL": [39.7817, -89.6501],
  "456 Oak Ave, Chicago, IL": [41.8781, -87.6298],
  "789 Pine Rd, Boston, MA": [42.3601, -71.0589],
  "321 Elm St, Seattle, WA": [47.6062, -122.3321],
  "654 Maple Dr, Austin, TX": [30.2672, -97.7431],
  "987 Cedar Ln, Denver, CO": [39.7392, -104.9903],
  "159 Birch Blvd, Portland, OR": [45.5152, -122.6784],
  "753 Willow Way, Miami, FL": [25.7617, -80.1918],
  "123 Admin Street, City, Country": [14.5995, 120.9842], // Fallback to Manila for testing if "City, Country"
  "100 Staff Street, City, Country": [14.6091, 121.0223],
  "200 Staff Ave, City, Country": [14.6507, 121.0494],
  "300 Staff Blvd, City, Country": [14.5547, 121.0244],
};

function MachineMap() {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [geocodedData, setGeocodedData] = useState([]);
  const [geocodingProgress, setGeocodingProgress] = useState({
    current: 0,
    total: 0,
  });
  const [stats, setStats] = useState({ healthy: 0, needsRepair: 0, total: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setGeocodedData([]);
    setGeocodingProgress({ current: 0, total: 0 });
    try {
      const response = await Requests({
        url: "/management/machine-map",
        method: "GET",
        credentials: true,
      });
      if (response.data.ok) {
        setMachines(response.data.data);
        const data = response.data.data;

        // Calculate stats
        const healthyCount = data.filter((m) => m.status === "healthy").length;
        const needsRepairCount = data.filter(
          (m) => m.status === "needs_repair",
        ).length;
        setStats({
          healthy: healthyCount,
          needsRepair: needsRepairCount,
          total: data.length,
        });

        // Calculate total locations to geocode
        const totalLocs = data.reduce((acc, m) => acc + m.locations.length, 0);
        setGeocodingProgress({ current: 0, total: totalLocs });

        geocodeAll(data);
      }
    } catch (error) {
      toast.error("Failed to fetch machine map data");
    } finally {
      setLoading(false);
    }
  };

  const geocodeAll = async (machineList) => {
    const results = [];
    const cache = JSON.parse(localStorage.getItem("geo_cache") || "{}");
    let processedCount = 0;

    for (const machine of machineList) {
      for (const loc of machine.locations) {
        processedCount++;
        setGeocodingProgress((prev) => ({ ...prev, current: processedCount }));

        if (!loc.address) continue;

        // 1. Check hardcoded
        if (SEED_GEO_MAP[loc.address]) {
          results.push({
            ...machine,
            lat: SEED_GEO_MAP[loc.address][0],
            lng: SEED_GEO_MAP[loc.address][1],
            currentLocation: loc,
          });
          continue;
        }

        // 2. Check cache
        if (cache[loc.address]) {
          results.push({
            ...machine,
            lat: cache[loc.address].lat,
            lng: cache[loc.address].lng,
            currentLocation: loc,
          });
          continue;
        }

        // 3. Try dynamic geocoding
        try {
          // Small delay to respect Nominatim usage policy (1 request/sec ideally)
          await new Promise((r) => setTimeout(r, 800));
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(loc.address)}`,
          );
          const data = await response.json();
          if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);

            // Update cache
            cache[loc.address] = { lat, lng };
            localStorage.setItem("geo_cache", JSON.stringify(cache));

            results.push({
              ...machine,
              lat,
              lng,
              currentLocation: loc,
            });
          }
        } catch (error) {
          console.error("Geocoding failed for:", loc.address, error);
        }
      }
      // Update intermediate results so markers appear as they are geocoded
      setGeocodedData([...results]);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-[#FFF5E4] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#4F6F52] flex items-center gap-3">
            <MapPin className="w-8 h-8" />
            Interactive Machine Map
          </h1>
          <p className="text-gray-600 mt-1">
            Real-time geographic distribution of NutriBin units and their
            operational status.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={fetchData}
            disabled={
              loading ||
              (geocodingProgress.current > 0 &&
                geocodingProgress.current < geocodingProgress.total)
            }
            className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 text-[#4F6F52] hover:bg-gray-50 transition-colors disabled:opacity-50"
            title="Refresh Map Data"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm font-semibold text-gray-700">
              {stats.healthy} Healthy
            </span>
          </div>
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm font-semibold text-gray-700">
              {stats.needsRepair} Needs Repair
            </span>
          </div>
        </div>
      </div>

      {/* Geocoding Progress */}
      {geocodingProgress.total > 0 &&
        geocodingProgress.current < geocodingProgress.total && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-[#4F6F52]/10 border border-[#4F6F52]/20 p-4 rounded-3xl flex items-center gap-4"
          >
            <Loader2 className="w-5 h-5 text-[#4F6F52] animate-spin" />
            <div className="flex-1">
              <div className="flex justify-between text-xs font-bold text-[#4F6F52] mb-1">
                <span>Geocoding machine locations...</span>
                <span>
                  {Math.round(
                    (geocodingProgress.current / geocodingProgress.total) * 100,
                  )}
                  %
                </span>
              </div>
              <div className="w-full bg-white rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className="bg-[#4F6F52] h-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(geocodingProgress.current / geocodingProgress.total) * 100}%`,
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}

      {/* Map Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] p-4 shadow-xl border border-white/50 overflow-hidden h-[70vh] relative"
      >
        {loading && geocodedData.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10 rounded-[2.5rem]">
            <div className="flex flex-col items-center gap-3 text-[#4F6F52]">
              <Activity className="w-10 h-10 animate-spin" />
              <span className="font-bold">Fetching Units...</span>
            </div>
          </div>
        ) : (
          <MapContainer
            center={[39.8283, -98.5795]}
            zoom={4}
            style={{ height: "100%", width: "100%", borderRadius: "1.5rem" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <SetBounds markers={geocodedData} />
            {geocodedData.map((marker, idx) => (
              <Marker
                key={`${marker.machine_id}-${idx}`}
                position={[marker.lat, marker.lng]}
                icon={marker.status === "healthy" ? GreenIcon : RedIcon}
              >
                <Popup className="custom-popup">
                  <div className="p-2 min-w-[200px]">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-black text-[#4F6F52] text-sm">
                        {marker.machine_id}
                        {marker.hasMultipleLocations && (
                          <span
                            className="ml-2 bg-[#4F6F52] text-white text-[10px] px-1.5 py-0.5 rounded-full"
                            title="Multiple users associated with this unit"
                          >
                            *
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          marker.status === "healthy"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {marker.status === "healthy"
                          ? "Healthy"
                          : "Needs Repair"}
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="w-3.5 h-3.5" />
                          <span className="font-semibold">
                            {marker.hasMultipleLocations
                              ? "Associated Users:"
                              : "Customer Name:"}
                          </span>
                        </div>
                        {marker.hasMultipleLocations ? (
                          <div className="pl-5 space-y-0.5">
                            {marker.locations.map((loc, lIdx) => (
                              <div
                                key={lIdx}
                                className={`text-gray-500 ${
                                  loc.customer_id ===
                                  marker.currentLocation.customer_id
                                    ? "text-[#4F6F52] font-bold"
                                    : ""
                                }`}
                              >
                                • {loc.customer_name}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="pl-5 text-gray-500">
                            {marker.currentLocation.customer_name}
                          </div>
                        )}
                      </div>

                      <div className="flex items-start gap-2 text-gray-500 pt-1">
                        <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-semibold text-gray-600 block">
                            Marker Address:
                          </span>
                          {marker.currentLocation.address}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                      <button
                        onClick={() =>
                          (window.location.href = `/machine/${marker.machine_id}`)
                        }
                        className="text-[#4F6F52] font-bold text-xs flex items-center gap-1 hover:underline"
                      >
                        Details <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </motion.div>

      {/* Legend / Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 text-green-600 rounded-xl">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-800">Operational Units</h3>
          </div>
          <p className="text-sm text-gray-600">
            Green markers indicate machines with no active repair tickets and
            all electronic sensors reporting healthy status.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-100 text-red-600 rounded-xl">
              <Wrench className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-800">Repair Required</h3>
          </div>
          <p className="text-sm text-gray-600">
            Red markers indicate machines with pending or active repair
            requests, or system component failures.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <Info className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-800">Multi-User Units</h3>
          </div>
          <p className="text-sm text-gray-600">
            Units marked with an asterisk (*) are shared by multiple customers.
            Each customer's location is shown on the map.
          </p>
        </div>
      </div>
    </div>
  );
}

export default MachineMap;
