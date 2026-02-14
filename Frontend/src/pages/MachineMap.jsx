import React, { useState, useEffect, useMemo } from "react";
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
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Navigation,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Helper component to handle map movements
function MapController({ bounds, flyToTarget }) {
  const map = useMap();

  useEffect(() => {
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);

  useEffect(() => {
    if (flyToTarget) {
      map.flyTo(flyToTarget.coords, 14, {
        duration: 1.5,
      });
    }
  }, [flyToTarget, map]);

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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [flyToTarget, setFlyToTarget] = useState(null);

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

  const filteredMachines = useMemo(() => {
    return geocodedData.filter((m) => {
      const matchesSearch =
        m.machine_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.currentLocation.customer_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === "all" || m.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [geocodedData, searchQuery, filterStatus]);

  const mapBounds = useMemo(() => {
    if (geocodedData.length === 0) return null;
    return L.latLngBounds(geocodedData.map((m) => [m.lat, m.lng]));
  }, [geocodedData]);

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
    <div className="flex-1 flex flex-col w-full bg-[#FFF5E4] overflow-hidden">
      {/* Main Map Content - Now on top */}
      <div className="flex-1 relative flex flex-col overflow-hidden">
        {/* Toggle Directory Button */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-white px-4 py-2 rounded-xl shadow-lg border border-gray-100 text-[#4F6F52] hover:bg-gray-50 transition-all flex items-center gap-2 font-bold text-sm"
          >
            <ChevronUp className="w-4 h-4" />
            Show Unit Directory
          </button>
        )}

        {/* Floating Header */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-md px-4 pointer-events-none">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/80 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-white/50 flex items-center justify-between pointer-events-auto"
          >
            <div className="flex items-center gap-3">
              <div className="bg-[#4F6F52] p-2 rounded-xl shadow-inner">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-black text-gray-800 text-sm leading-tight">
                  Interactive Map
                </h1>
                <p className="text-[10px] text-gray-500 font-bold">
                  {geocodingProgress.current}/{geocodingProgress.total} units
                  geocoded
                </p>
              </div>
            </div>
          </motion.div>

          {/* Progress Mini Bar */}
          {geocodingProgress.total > 0 &&
            geocodingProgress.current < geocodingProgress.total && (
              <div className="mt-2 w-full bg-white/50 backdrop-blur-sm rounded-full h-1 overflow-hidden">
                <motion.div
                  className="bg-[#4F6F52] h-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(geocodingProgress.current / geocodingProgress.total) * 100}%`,
                  }}
                />
              </div>
            )}
        </div>

        {/* Map Container */}
        <div className="h-full w-full">
          {loading && geocodedData.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center bg-[#FFF5E4]/50 backdrop-blur-sm z-50">
              <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-[2.5rem] shadow-2xl border border-white">
                <div className="relative">
                  <Loader2 className="w-12 h-12 text-[#4F6F52] animate-spin" />
                  <Activity className="w-6 h-6 text-[#4F6F52] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="text-center">
                  <span className="font-black text-[#4F6F52] text-xl block">
                    Initializing Map
                  </span>
                  <p className="text-xs text-gray-400 font-bold tracking-widest uppercase mt-1">
                    Fetching Unit Coordinates
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <MapContainer
              center={[14.5995, 120.9842]} // Default center
              zoom={6}
              zoomControl={false}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapController bounds={mapBounds} flyToTarget={flyToTarget} />

              {filteredMachines.map((marker, idx) => (
                <Marker
                  key={`${marker.machine_id}-${idx}`}
                  position={[marker.lat, marker.lng]}
                  icon={marker.status === "healthy" ? GreenIcon : RedIcon}
                >
                  <Popup className="custom-popup" offset={[0, -20]}>
                    <div className="p-1 min-w-[220px]">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-gray-800 text-base">
                              {marker.machine_id}
                            </span>
                            {marker.hasMultipleLocations && (
                              <Info
                                className="w-3 h-3 text-[#4F6F52]"
                                title="Multi-user unit"
                              />
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400 font-black tracking-widest uppercase">
                            Machine Unit
                          </span>
                        </div>
                        <div
                          className={`text-[9px] px-2 py-0.5 rounded-lg font-black uppercase tracking-wider ${
                            marker.status === "healthy"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700 font-black"
                          }`}
                        >
                          {marker.status === "healthy" ? "Healthy" : "Repair"}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100 italic">
                          <div className="flex items-center gap-2 text-gray-600 mb-1">
                            <Users className="w-3.5 h-3.5" />
                            <span className="font-bold text-[10px] uppercase tracking-wider">
                              Primary Customer
                            </span>
                          </div>
                          <p className="text-sm font-bold text-[#4F6F52] pl-5">
                            {marker.currentLocation.customer_name}
                          </p>
                        </div>

                        <div className="space-y-1 pl-1">
                          <div className="flex items-start gap-2 text-gray-400">
                            <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <div className="text-[11px] leading-snug">
                              {marker.currentLocation.address}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex items-center justify-between">
                        <button
                          onClick={() =>
                            (window.location.href = `/machine/${marker.machine_id}`)
                          }
                          className="w-full bg-[#4F6F52] text-white py-2 rounded-xl text-xs font-bold hover:bg-[#3d5a40] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#4F6F52]/20"
                        >
                          Machine Analytics{" "}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>
      </div>

      {/* Directory - Now on Bottom */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "35vh", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border-t border-gray-200 flex flex-col w-full z-20 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.1)]"
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-black text-[#4F6F52] flex items-center gap-2 shrink-0">
                  <Activity className="w-5 h-5" />
                  Unit Directory
                </h2>

                {/* Stats Summary - Inline */}
                <div className="hidden sm:flex gap-2">
                  <div className="bg-green-50 px-3 py-1 rounded-full flex items-center gap-2 border border-green-100">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest">
                      {stats.healthy} Healthy
                    </span>
                  </div>
                  <div className="bg-red-50 px-3 py-1 rounded-full flex items-center gap-2 border border-red-100">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-[10px] font-bold text-red-700 uppercase tracking-widest">
                      {stats.needsRepair} Alert
                    </span>
                  </div>
                </div>
              </div>

              {/* Search & Filters - In header for bottom layout */}
              <div className="flex-1 flex gap-3 max-w-2xl">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search machines or users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4F6F52]/20 focus:border-[#4F6F52] transition-all"
                  />
                </div>
                <div className="flex gap-1 p-1 bg-gray-50 rounded-xl border border-gray-100 min-w-[300px]">
                  {["all", "healthy", "needs_repair"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`flex-1 py-1 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                        filterStatus === status
                          ? "bg-white text-[#4F6F52] shadow-sm"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {status.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchData}
                  disabled={loading}
                  className="p-2 hover:bg-gray-100 rounded-xl text-[#4F6F52] transition-all"
                  title="Refresh Data"
                >
                  <RefreshCw
                    className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                  />
                </button>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-500 transition-all"
                >
                  <ChevronDown className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Grid List for bottom layout */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {filteredMachines.length === 0 ? (
                <div className="text-center py-10">
                  <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-sm font-medium text-gray-400">
                    No units found matching your search
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredMachines.map((machine, idx) => (
                    <motion.div
                      key={`${machine.machine_id}-${idx}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3 bg-white border border-gray-100 rounded-2xl hover:border-[#4F6F52]/30 hover:shadow-md transition-all group cursor-pointer"
                      onClick={() =>
                        setFlyToTarget({
                          coords: [machine.lat, machine.lng],
                          id: machine.machine_id,
                        })
                      }
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${machine.status === "healthy" ? "bg-green-500" : "bg-red-500 animate-pulse"}`}
                          />
                          <span className="font-black text-gray-800 text-sm tracking-tight">
                            {machine.machine_id}
                          </span>
                        </div>
                        <button
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#4F6F52]/10 rounded-lg text-[#4F6F52] transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `/machine/${machine.machine_id}`;
                          }}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 mb-2">
                        <Users className="w-3 h-3" />
                        <span className="truncate font-medium">
                          {machine.currentLocation.customer_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 pt-2 border-t border-gray-50 opacity-60">
                        <Navigation className="w-3 h-3 text-[#4F6F52]" />
                        <span className="text-[10px] text-gray-400 truncate italic">
                          {machine.currentLocation.address}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MachineMap;
