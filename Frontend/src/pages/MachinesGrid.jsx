import { useState, useEffect, useMemo } from "react";
import {
  User,
  Mail,
  Cpu,
  Grid3x3,
  Users,
  Search,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Activity,
  Filter,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Requests from "@/utils/Requests";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";

function MachinesGrid() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("machines");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user && user.role !== "admin" && user.role !== "staff") {
      toast.error("Access denied. Staff privileges required.");
      navigate("/dashboard");
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      setLoading(true);
      const response = await Requests({
        url: "/management/machines",
        method: "GET",
        credentials: true,
      });
      if (response.data.ok) setMachines(response.data.machines || []);
    } catch {
      toast.error("Failed to load machines data");
    } finally {
      setLoading(false);
    }
  };

  // Group machines by machine_id
  const machinesByMachineId = useMemo(() => {
    const grouped = {};
    machines.forEach((record) => {
      if (!grouped[record.machine_id]) {
        grouped[record.machine_id] = {
          machine_id: record.machine_id,
          firmware_version: record.firmware_version,
          update_status: record.update_status,
          // Propagate activity flag from API
          is_active: record.is_active ?? true,
          users: [],
        };
      }
      if (record.user_id) {
        grouped[record.machine_id].users.push({
          user_id: record.user_id,
          first_name: record.first_name,
          last_name: record.last_name,
          email: record.email,
        });
      }
    });

    let result = Object.values(grouped);
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      result = result.filter(
        (m) =>
          m.machine_id.toLowerCase().includes(s) ||
          m.users.some(
            (u) =>
              `${u.first_name} ${u.last_name}`.toLowerCase().includes(s) ||
              u.email.toLowerCase().includes(s),
          ),
      );
    }
    return result;
  }, [machines, searchTerm]);

  // Group machines by user
  const machinesByUser = useMemo(() => {
    const grouped = {};
    machines.forEach((record) => {
      if (record.user_id) {
        const userKey = record.user_id;
        if (!grouped[userKey]) {
          grouped[userKey] = {
            user_id: record.user_id,
            first_name: record.first_name,
            last_name: record.last_name,
            email: record.email,
            machines: [],
          };
        }
        grouped[userKey].machines.push({
          machine_id: record.machine_id,
        });
      }
    });

    let result = Object.values(grouped);
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      result = result.filter(
        (u) =>
          `${u.first_name} ${u.last_name}`.toLowerCase().includes(s) ||
          u.email.toLowerCase().includes(s) ||
          u.machines.some((m) => m.machine_id.toLowerCase().includes(s)),
      );
    }
    return result;
  }, [machines, searchTerm]);

  return (
    <div className="w-full bg-[#FDFCFB] min-h-screen pb-20">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#4F6F52] font-semibold tracking-wider uppercase text-xs">
              <ShieldCheck className="w-4 h-4" />
              Infrastructure Management
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#1A1A1A] tracking-tight">
              Eco-Fleet <span className="text-[#4F6F52]">Directory</span>
            </h1>
            <p className="text-gray-500 max-w-xl">
              Real-time monitoring and administrative control for every NutriBin
              unit across your global network.
            </p>
          </div>

          <div className="flex bg-[#F3F4F1] p-1 rounded-xl border border-gray-200 shadow-inner">
            <button
              onClick={() => setViewMode("machines")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all duration-300 ${
                viewMode === "machines"
                  ? "bg-white text-[#4F6F52] shadow-sm transform scale-[1.02]"
                  : "text-gray-500 hover:text-[#4F6F52]"
              }`}
            >
              <Grid3x3 className="h-4 w-4" />
              By Unit
            </button>
            <button
              onClick={() => setViewMode("users")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all duration-300 ${
                viewMode === "users"
                  ? "bg-white text-[#4F6F52] shadow-sm transform scale-[1.02]"
                  : "text-gray-500 hover:text-[#4F6F52]"
              }`}
            >
              <Users className="h-4 w-4" />
              By Client
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#4F6F52] transition-colors" />
            <input
              type="text"
              placeholder="Search by serial, name, or email..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white focus:border-[#4F6F52] focus:ring-0 rounded-xl text-gray-800 placeholder-gray-400 transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-[#4F6F52]/10 text-[#4F6F52] rounded-xl font-bold hover:bg-[#4F6F52] hover:text-white transition-all">
            <Filter className="h-5 w-5" />
            Filters
          </button>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#4F6F52]/20 rounded-full" />
              <div className="absolute top-0 w-16 h-16 border-4 border-[#4F6F52] border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-[#4F6F52] font-bold animate-pulse">
              Syncing fleet data...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence mode="popLayout">
              {viewMode === "machines" ? (
                machinesByMachineId.length === 0 ? (
                  <NoResults
                    icon={Cpu}
                    text="No units found matching your criteria."
                  />
                ) : (
                  machinesByMachineId.map((m, idx) => (
                    <MachineCard
                      key={m.machine_id}
                      machine={m}
                      index={idx}
                      navigate={navigate}
                    />
                  ))
                )
              ) : machinesByUser.length === 0 ? (
                <NoResults
                  icon={Users}
                  text="No clients found matching your criteria."
                />
              ) : (
                machinesByUser.map((u, idx) => (
                  <UserCard
                    key={u.user_id}
                    user={u}
                    index={idx}
                    navigate={navigate}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  );
}

function MachineCard({ machine, index, navigate }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#4F6F52]/30 transition-all duration-500 overflow-hidden group ${!machine.is_active ? "opacity-70" : ""}`}
    >
      <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-50">
        {/* Machine Info */}
        <div
          onClick={() => navigate(`/machine/${machine.machine_id}`)}
          className="p-6 lg:w-1/3 cursor-pointer hover:bg-[#FDFCFB] transition-colors"
        >
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-[#ECE3CE] flex items-center justify-center group-hover:bg-[#4F6F52] transition-all duration-500 rotate-3 group-hover:rotate-0 shadow-sm">
              <Cpu className="h-7 w-7 text-[#4F6F52] group-hover:text-white transition-colors" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-xl text-gray-900 group-hover:text-[#4F6F52] transition-colors">
                  NutriBin
                </h3>
                <span
                  className={`${machine.is_active ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"} text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter`}
                >
                  {machine.is_active ? "Active" : "Offline"}
                </span>
                <div className="hidden sm:flex items-center gap-1.5 ml-2 px-2 py-0.5 bg-gray-50 rounded-full border border-gray-100">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      machine.update_status === "pending"
                        ? "bg-amber-400 animate-pulse"
                        : "bg-[#4F6F52]"
                    }`}
                  />
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                    {machine.firmware_version || "v1.0.0"}
                  </span>
                </div>
              </div>
              <p className="text-sm font-mono text-gray-400 group-hover:text-[#4F6F52]/60 transition-colors uppercase">
                {machine.machine_id}
              </p>
            </div>
          </div>
        </div>

        {/* Users Section */}
        <div className="p-6 flex-1 bg-gray-50/30">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <Users className="w-3 h-3" />
              Assigned Access ({machine.users.length})
            </span>
            {machine.users.length > 0 && (
              <div className="flex -space-x-2">
                {machine.users.slice(0, 3).map((u, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center text-[10px] font-bold text-[#4F6F52]"
                  >
                    {u.first_name[0]}
                  </div>
                ))}
                {machine.users.length > 3 && (
                  <div className="w-7 h-7 rounded-full bg-[#4F6F52] border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
                    +{machine.users.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {machine.users.length > 0 ? (
              machine.users.map((u, idx) => (
                <div
                  key={idx}
                  className="bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm flex items-center gap-2 hover:border-[#4F6F52] transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-bold text-gray-700">
                    {u.first_name} {u.last_name}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-xs text-gray-400 italic">
                No assigned users
              </span>
            )}
          </div>
        </div>

        {/* Action Panel */}
        <div className="p-6 lg:w-48 flex items-center justify-center bg-[#FDFCFB]">
          <button
            onClick={() =>
              machine.is_active && navigate(`/machine/${machine.machine_id}`)
            }
            disabled={!machine.is_active}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold shadow-lg active:scale-95 transition-all ${machine.is_active ? "bg-[#4F6F52] text-white hover:bg-[#3A4D39] shadow-[#4F6F52]/20" : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"}`}
          >
            Metrics
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      {/* Offline overlay */}
      {!machine.is_active && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/70 py-3 px-6 rounded-full text-rose-600 font-extrabold uppercase tracking-wider shadow-md">
            Offline
          </div>
        </div>
      )}
    </motion.div>
  );
}

function UserCard({ user, index, navigate }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row group hover:shadow-lg transition-all"
    >
      <div className="p-6 md:w-1/3 flex items-center gap-4 bg-gray-50/50">
        <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-100">
          <User className="h-8 w-8 text-[#4F6F52]" />
        </div>
        <div className="min-w-0">
          <h3 className="font-extrabold text-gray-900 truncate">
            {user.first_name} {user.last_name}
          </h3>
          <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
            <Mail className="h-3 w-3" /> {user.email}
          </p>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-center">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Activity className="w-3 h-3 text-emerald-500" />
          Active Units ({user.machines.length})
        </div>
        <div className="flex flex-wrap gap-2">
          {user.machines.map((m, idx) => (
            <button
              key={idx}
              onClick={() => navigate(`/machine/${m.machine_id}`)}
              className="flex items-center gap-2 px-4 py-2 bg-[#ECE3CE]/30 border border-[#ECE3CE] rounded-xl text-xs font-bold text-[#4F6F52] hover:bg-[#4F6F52] hover:text-white hover:border-[#4F6F52] transition-all group/btn"
            >
              <Cpu className="h-3 w-3" />
              {m.machine_id}
              <ExternalLink className="h-3 w-3 opacity-0 group-hover/btn:opacity-100" />
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function NoResults({ icon: Icon, text }) {
  return (
    <div className="flex flex-col items-center justify-center p-20 text-gray-400 font-medium bg-white rounded-2xl border border-dashed border-gray-200">
      <Icon className="h-16 w-16 mb-4 opacity-10" />
      <p className="text-lg">{text}</p>
      <p className="text-sm opacity-60">
        Try adjusting your filters or search terms.
      </p>
    </div>
  );
}

export default MachinesGrid;
