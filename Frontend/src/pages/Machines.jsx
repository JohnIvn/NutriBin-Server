//Machines Page
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  Search,
  Clock,
  Wrench,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  ArrowRight,
  Filter,
  Calendar,
  History,
  ShieldAlert,
  HardDrive,
  Ban,
  MapPin,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Leaflet marker fix
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const SEED_GEO_MAP = {
  "123 Main St, Springfield, IL": [39.7817, -89.6501],
  "456 Oak Ave, Chicago, IL": [41.8781, -87.6298],
  "789 Pine Rd, Boston, MA": [42.3601, -71.0589],
  "321 Elm St, Seattle, WA": [47.6062, -122.3321],
  "654 Maple Dr, Austin, TX": [30.2672, -97.7431],
  "987 Cedar Ln, Denver, CO": [39.7392, -104.9903],
  "159 Birch Blvd, Portland, OR": [45.5152, -122.6784],
  "753 Willow Way, Miami, FL": [25.7617, -80.1918],
};

// Helper component to fix gray map issue after animation
function MapInvalidator() {
  const map = useMap();

  useEffect(() => {
    // Give the container time to fully render before invalidating
    // The motion animation takes 300ms, so we wait a bit longer
    const timer = setTimeout(() => {
      try {
        map.invalidateSize();
        // Force a redraw by zooming to the bounds
        window.dispatchEvent(new Event("resize"));
      } catch (error) {
        console.error("Error invalidating map:", error);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { machinesFilter } from "@/schema/machines";
import ConfirmBox from "@/components/partials/confirmBox";
import Requests from "@/utils/Requests";
import { toast } from "sonner";

function Machines() {
  const navigate = useNavigate();

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmInformation, setConfirmInformation] = useState({
    title: "",
    description: "",
    mode: "",
  });

  const [repairList, setRepairList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedRepairId, setExpandedRepairId] = useState(null);
  const [geocodedAddresses, setGeocodedAddresses] = useState({});
  const [sortBy, setSortBy] = useState("date-desc");

  const geocodeAddress = async (address) => {
    if (!address || geocodedAddresses[address]) return;

    // Check SEED_GEO_MAP
    if (SEED_GEO_MAP[address]) {
      setGeocodedAddresses((prev) => ({
        ...prev,
        [address]: {
          lat: SEED_GEO_MAP[address][0],
          lng: SEED_GEO_MAP[address][1],
        },
      }));
      return;
    }

    // Check localStorage cache
    const cache = JSON.parse(localStorage.getItem("geo_cache") || "{}");
    if (cache[address]) {
      setGeocodedAddresses((prev) => ({
        ...prev,
        [address]: cache[address],
      }));
      return;
    }

    // Dynamic Geocoding
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const coords = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
        cache[address] = coords;
        localStorage.setItem("geo_cache", JSON.stringify(cache));
        setGeocodedAddresses((prev) => ({ ...prev, [address]: coords }));
      }
    } catch (error) {
      console.error("Geocoding failed for:", address, error);
    }
  };

  const toggleExpand = (repair) => {
    if (expandedRepairId === repair.repair_id) {
      setExpandedRepairId(null);
    } else {
      setExpandedRepairId(repair.repair_id);
      if (repair.address) {
        geocodeAddress(repair.address);
      }
    }
  };

  const displayConfirm = (mode, title, description, repair = null) => {
    setSelectedRepair(repair);
    setShowConfirm(true);
    setConfirmInformation({ mode, title, description });
  };

  const onConfirm = async () => {
    if (!selectedRepair) return;

    try {
      setActionLoading(true);
      let endpoint = "";
      let statusValue = "";

      if (confirmInformation.mode === "Postpone") {
        endpoint = `/management/repair/${selectedRepair.repair_id}/status`;
        statusValue = "postponed";
      } else if (confirmInformation.mode === "Accept") {
        endpoint = `/management/repair/${selectedRepair.repair_id}/status`;
        statusValue = "accepted";
      } else if (confirmInformation.mode === "Reject") {
        endpoint = `/management/repair/${selectedRepair.repair_id}/status`;
        statusValue = "cancelled";
      }

      if (endpoint) {
        const response = await Requests({
          url: endpoint,
          method: "PATCH",
          data: { status: statusValue },
          credentials: true,
        });

        if (response.data.ok) {
          const pastTense = {
            Accept: "accepted",
            Postpone: "postponed",
            Reject: "rejected",
          };
          toast.success(
            `Repair ${pastTense[confirmInformation.mode] || "updated"} successfully`,
          );
          fetchRepairs();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to process action");
    } finally {
      setActionLoading(false);
      closeConfirm();
    }
  };

  const closeConfirm = () => {
    setShowConfirm(false);
  };

  const fetchRepairs = async () => {
    try {
      setLoading(true);
      const response = await Requests({
        url: "/management/repair",
        method: "GET",
        credentials: true,
      });
      if (response.data.ok) {
        setRepairList(response.data.repairs || []);
      }
    } catch {
      toast.error("Failed to load repair data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairs();
  }, []);

  const filterForm = useForm({
    resolver: zodResolver(machinesFilter),
    defaultValues: {
      count: "10",
      term: "",
    },
  });

  const term = filterForm.watch("term");
  const entriesCount = parseInt(filterForm.watch("count") || "10");

  const filteredRepairs = repairList.filter((repair) => {
    const searchTerm = term.toLowerCase();
    if (!searchTerm) return true;

    const fullName =
      repair.first_name && repair.last_name
        ? `${repair.first_name} ${repair.last_name}`.toLowerCase()
        : "";

    return (
      repair.repair_id.toLowerCase().includes(searchTerm) ||
      repair.machine_id?.toLowerCase().includes(searchTerm) ||
      repair.description?.toLowerCase().includes(searchTerm) ||
      fullName.includes(searchTerm)
    );
  });

  const sortedRepairs = [...filteredRepairs].sort((a, b) => {
    switch (sortBy) {
      case "date-desc":
        return new Date(b.date_created) - new Date(a.date_created);
      case "date-asc":
        return new Date(a.date_created) - new Date(b.date_created);
      case "status": {
        const statusOrder = {
          active: 1,
          accepted: 2,
          postponed: 3,
          cancelled: 4,
        };
        return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
      }
      case "name": {
        const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
        const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
        return nameA.localeCompare(nameB);
      }
      default:
        return 0;
    }
  });

  const paginatedRepairs = sortedRepairs.slice(
    (currentPage - 1) * entriesCount,
    currentPage * entriesCount,
  );
  const totalPages = Math.ceil(filteredRepairs.length / entriesCount);

  const stats = {
    pending: repairList.filter((r) => r.status === "active").length,
    inService: repairList.filter((r) => r.status === "accepted").length,
    postponed: repairList.filter((r) => r.status === "postponed").length,
    rejected: repairList.filter((r) => r.status === "cancelled").length,
    total: repairList.length,
  };

  return (
    <div className="w-full bg-[#FDFCFB] min-h-screen pb-20">
      <section className="max-w-7xl mx-auto px-4 md:px-8 pt-10 space-y-8 animate-in fade-in duration-700">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#4F6F52] font-bold text-xs uppercase tracking-widest">
              <Wrench className="w-4 h-4" />
              Service Registry
            </div>
            <h1 className="text-4xl font-black text-[#1A1A1A] tracking-tight">
              Maintenance <span className="text-[#4F6F52]">Nexus</span>
            </h1>
            <p className="text-gray-400 font-medium">
              Coordinate logistics and system restorations across the fleet.
            </p>
          </div>

          <div className="flex bg-white p-2 rounded-2xl border border-gray-100 shadow-sm gap-2">
            <div className="flex flex-col px-4 border-r border-gray-50">
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                Awaiting
              </span>
              <span className="text-lg font-black text-[#4F6F52]">
                {stats.pending}
              </span>
            </div>
            <div className="flex flex-col px-4 border-r border-gray-50">
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                In-Service
              </span>
              <span className="text-lg font-black text-amber-500">
                {stats.inService}
              </span>
            </div>
            <div className="flex flex-col px-4 border-r border-gray-50">
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                Postponed
              </span>
              <span className="text-lg font-black text-blue-500">
                {stats.postponed}
              </span>
            </div>
            <div className="flex flex-col px-4 border-r border-gray-50">
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                Rejected
              </span>
              <span className="text-lg font-black text-rose-500">
                {stats.rejected}
              </span>
            </div>
            <div className="flex flex-col px-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                Capacity
              </span>
              <span className="text-lg font-black text-gray-800">
                {stats.total}
              </span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-3xl border border-gray-100 shadow-sm relative z-10">
          <Form {...filterForm}>
            <form className="flex flex-col md:flex-row gap-4 w-full">
              <FormField
                control={filterForm.control}
                name="term"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#4F6F52] transition-colors" />
                        <Input
                          {...field}
                          placeholder="Search by ID, Serial, or Client Name..."
                          className="pl-12 h-14 bg-[#FAF9F6] border-none rounded-2xl text-base font-medium placeholder:text-gray-300 focus-visible:ring-2 focus-visible:ring-[#4F6F52]/50"
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex gap-4 w-full md:w-auto">
                <div className="relative w-full md:w-36">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400">
                    <History className="w-4 h-4" />
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full h-14 pl-10 pr-4 bg-[#FAF9F6] border-none rounded-2xl text-xs font-bold text-gray-600 appearance-none focus:ring-2 focus:ring-[#4F6F52]/50"
                  >
                    <option value="date-desc">Newest First</option>
                    <option value="date-asc">Oldest First</option>
                    <option value="status">Pipeline Stage</option>
                    <option value="name">Client A-Z</option>
                  </select>
                </div>

                <FormField
                  control={filterForm.control}
                  name="count"
                  render={({ field }) => (
                    <FormItem className="w-full md:w-32">
                      <FormControl>
                        <div className="relative">
                          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <select
                            {...field}
                            className="w-full h-14 pl-10 pr-4 bg-[#FAF9F6] border-none rounded-2xl text-sm font-bold text-gray-600 appearance-none focus:ring-2 focus:ring-[#4F6F52]/50"
                          >
                            <option value="10">10 Rows</option>
                            <option value="20">20 Rows</option>
                            <option value="50">50 Rows</option>
                          </select>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>

        {/* Repairs List */}
        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-40 gap-4">
                <div className="w-10 h-10 border-4 border-[#4F6F52]/20 border-t-[#4F6F52] rounded-full animate-spin" />
                <p className="text-xs font-bold text-[#4F6F52] uppercase tracking-[0.3em]">
                  Synching Logs
                </p>
              </div>
            ) : paginatedRepairs.length > 0 ? (
              paginatedRepairs.map((repair, idx) => (
                <motion.div
                  key={repair.repair_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => toggleExpand(repair)}
                  className={`group bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-[#4F6F52]/5 hover:border-[#4F6F52]/20 transition-all cursor-pointer ${
                    expandedRepairId === repair.repair_id
                      ? "ring-2 ring-[#4F6F52] border-transparent"
                      : ""
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                    {/* ID & Type */}
                    <div className="flex items-center gap-5 lg:w-1/4">
                      <div
                        className={`p-4 rounded-2xl ${
                          repair.status === "active"
                            ? "bg-amber-50 text-amber-600"
                            : repair.status === "accepted"
                              ? "bg-emerald-50 text-emerald-600"
                              : repair.status === "cancelled"
                                ? "bg-rose-50 text-rose-600"
                                : "bg-gray-50 text-gray-400"
                        }`}
                      >
                        <ShieldAlert className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-gray-300 uppercase leading-none mb-1">
                          REQ-{repair.repair_id}
                        </p>
                        <h3 className="text-lg font-black text-[#1A1A1A] truncate">
                          {repair.first_name} {repair.last_name}
                        </h3>
                        <p className="text-xs font-mono text-gray-400">
                          Unit: {repair.machine_id?.toUpperCase()}
                        </p>
                      </div>
                    </div>

                    {/* Status & Date */}
                    <div className="flex flex-wrap gap-6 lg:flex-1">
                      <div className="flex flex-col flex-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase mb-2">
                          Issue Description
                        </span>
                        <p className="text-sm font-medium text-gray-600 line-clamp-1">
                          {repair.description}
                        </p>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase mb-2 text-right">
                          View Details
                        </span>
                        <div
                          className={`flex items-center justify-center p-2 rounded-xl transition-all ${
                            expandedRepairId === repair.repair_id
                              ? "bg-[#4F6F52] text-white rotate-180"
                              : "bg-gray-50 text-gray-400 group-hover:bg-[#4F6F52]/10 group-hover:text-[#4F6F52]"
                          }`}
                        >
                          <ChevronDown className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase mb-2">
                          Filed On
                        </span>
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                          <Calendar className="w-4 h-4 text-[#4F6F52]" />
                          {new Date(repair.date_created).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase mb-2">
                          Stage
                        </span>
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                            repair.status === "active"
                              ? "bg-amber-100 text-amber-700"
                              : repair.status === "accepted"
                                ? "bg-emerald-100 text-emerald-700"
                                : repair.status === "cancelled"
                                  ? "bg-rose-100 text-rose-700"
                                  : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              repair.status === "active"
                                ? "bg-amber-500 animate-pulse"
                                : repair.status === "accepted"
                                  ? "bg-emerald-500"
                                  : repair.status === "cancelled"
                                    ? "bg-rose-500"
                                    : "bg-gray-400"
                            }`}
                          />
                          {repair.status === "active"
                            ? "active"
                            : repair.status}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 lg:w-48">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/machine/${repair.machine_id}`);
                        }}
                        className="p-3 rounded-xl bg-[#FAF9F6] text-gray-400 hover:text-[#4F6F52] hover:bg-[#4F6F52]/10 transition-all flex items-center gap-2 group/btn"
                      >
                        <span className="text-xs font-bold hidden group-hover/btn:block">
                          View Unit
                        </span>
                        <ArrowRight className="w-5 h-5" />
                      </button>

                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          disabled={["accepted", "cancelled"].includes(
                            repair.status,
                          )}
                        >
                          <button
                            onClick={(e) => e.stopPropagation()}
                            disabled={["accepted", "cancelled"].includes(
                              repair.status,
                            )}
                            className="p-3 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-gray-600 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
                          >
                            {["accepted", "cancelled"].includes(
                              repair.status,
                            ) ? (
                              <Ban className="w-5 h-5 text-rose-300" />
                            ) : (
                              <MoreHorizontal className="w-5 h-5" />
                            )}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          onClick={(e) => e.stopPropagation()}
                          className="w-56 rounded-2xl p-2 border-gray-100"
                        >
                          <DropdownMenuLabel className="text-[10px] font-bold uppercase text-gray-400 px-3 py-2">
                            Workflow Actions
                          </DropdownMenuLabel>
                          <DropdownMenuGroup>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                displayConfirm(
                                  "Accept",
                                  "Authorize Restoration",
                                  "This unit will be moved to active maintenance queue.",
                                  repair,
                                );
                              }}
                              className="rounded-xl px-3 py-2 gap-3 focus:bg-emerald-50 focus:text-emerald-600 cursor-pointer"
                            >
                              <CheckCircle className="w-4 h-4" />{" "}
                              <span className="font-bold text-sm">
                                Accept Request
                              </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                displayConfirm(
                                  "Postpone",
                                  "Defer Maintenance",
                                  "Notify the client that service will be delayed.",
                                  repair,
                                );
                              }}
                              className="rounded-xl px-3 py-2 gap-3 focus:bg-amber-50 focus:text-amber-600 cursor-pointer"
                            >
                              <Clock className="w-4 h-4" />{" "}
                              <span className="font-bold text-sm">
                                Postpone
                              </span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1 bg-gray-50" />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                displayConfirm(
                                  "Reject",
                                  "Hard Rejection",
                                  "Permanently close this maintenance ticket.",
                                  repair,
                                );
                              }}
                              className="rounded-xl px-3 py-2 gap-3 focus:bg-rose-50 focus:text-rose-600 cursor-pointer"
                            >
                              <XCircle className="w-4 h-4" />{" "}
                              <span className="font-bold text-sm text-rose-500">
                                Reject
                              </span>
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Expanded Section with Map */}
                  <AnimatePresence>
                    {expandedRepairId === repair.repair_id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden mt-6 pt-6 border-t border-gray-50 flex flex-col md:flex-row gap-6"
                      >
                        <div className="flex-1 space-y-4">
                          <div className="bg-[#FAF9F6] p-4 rounded-2xl">
                            <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                              Client Information
                            </span>
                            <h4 className="font-bold text-gray-800">
                              {repair.first_name} {repair.last_name}
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">
                              {repair.email}
                            </p>
                          </div>

                          <div className="bg-[#FAF9F6] p-4 rounded-2xl">
                            <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                              Service Address
                            </span>
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-[#4F6F52] mt-0.5 shrink-0" />
                              <p className="text-sm font-bold text-gray-700">
                                {repair.address || "No address provided"}
                              </p>
                            </div>
                          </div>

                          <div className="bg-[#FAF9F6] p-4 rounded-2xl">
                            <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                              Issue Log
                            </span>
                            <p className="text-sm text-gray-600 italic">
                              "{repair.description || "No description provided"}
                              "
                            </p>
                          </div>
                        </div>

                        <div
                          className="flex-1 rounded-2xl overflow-hidden border border-gray-100 shadow-inner relative group bg-[#F5F5F5]"
                          style={{ minHeight: "400px" }}
                        >
                          {repair.address &&
                          geocodedAddresses[repair.address] ? (
                            <MapContainer
                              key={`map-${repair.repair_id}`}
                              center={[
                                geocodedAddresses[repair.address].lat,
                                geocodedAddresses[repair.address].lng,
                              ]}
                              zoom={13}
                              zoomControl={false}
                              scrollWheelZoom={false}
                              style={{ width: "100%", height: "100%" }}
                              className="z-0"
                            >
                              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                              <MapInvalidator />
                              <Marker
                                position={[
                                  geocodedAddresses[repair.address].lat,
                                  geocodedAddresses[repair.address].lng,
                                ]}
                                icon={DefaultIcon}
                              >
                                <Popup>
                                  <div className="p-2 font-bold text-[#4F6F52]">
                                    Service Location
                                  </div>
                                </Popup>
                              </Marker>
                            </MapContainer>
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-[#FDFCFB]">
                              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                {repair.address ? (
                                  <div className="w-6 h-6 border-2 border-[#4F6F52]/20 border-t-[#4F6F52] rounded-full animate-spin" />
                                ) : (
                                  <MapPin className="w-6 h-6 text-gray-200" />
                                )}
                              </div>
                              <p className="text-xs font-black text-gray-300 uppercase tracking-widest">
                                {repair.address
                                  ? "Resolving Coordinates"
                                  : "Geolocation Unavailable"}
                              </p>
                            </div>
                          )}

                          <div className="absolute bottom-4 right-4 z-[10] flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/machine/${repair.machine_id}`);
                              }}
                              className="px-4 py-2 bg-white/90 backdrop-blur shadow-sm border border-gray-100 rounded-xl text-[10px] font-black uppercase text-[#4F6F52] hover:bg-[#4F6F52] hover:text-white transition-all"
                            >
                              Unit Details
                            </button>
                            {repair.address && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(
                                    `https://www.google.com/maps?q=${encodeURIComponent(repair.address)}`,
                                    "_blank",
                                  );
                                }}
                                className="px-4 py-2 bg-white/90 backdrop-blur shadow-sm border border-gray-100 rounded-xl text-[10px] font-black uppercase text-gray-600 hover:bg-gray-800 hover:text-white transition-all"
                              >
                                Full Map
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-40 text-center space-y-4">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                  <Search className="w-10 h-10 text-gray-200" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    No registry entries found
                  </h3>
                  <p className="text-sm text-gray-400">
                    Try adjusting your filters or search term.
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Pagination Section */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-4">
              Showing Page {currentPage} of {totalPages}
            </p>
            <Pagination className="w-auto mx-0">
              <PaginationContent className="gap-2">
                <PaginationItem>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className={`p-3 rounded-xl border-none font-bold transition-all ${currentPage === 1 ? "opacity-20 cursor-not-allowed" : "hover:bg-[#4F6F52]/10 text-[#4F6F52]"}`}
                  >
                    <ArrowRight className="w-5 h-5 rotate-180" />
                  </button>
                </PaginationItem>
                <PaginationItem>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className={`p-3 rounded-xl border-none font-bold transition-all ${currentPage === totalPages ? "opacity-20 cursor-not-allowed" : "hover:bg-[#4F6F52]/10 text-[#4F6F52]"}`}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </section>

      {showConfirm && (
        <ConfirmBox
          mode={confirmInformation.mode}
          cancel={closeConfirm}
          confirm={onConfirm}
          description={confirmInformation.description}
          title={confirmInformation.title}
          loading={actionLoading}
        />
      )}
    </div>
  );
}

export default Machines;
