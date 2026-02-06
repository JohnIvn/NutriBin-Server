import { useState, useEffect } from "react";
import { User, Mail, Cpu, Grid3x3, Users, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Requests from "@/utils/Requests";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";

function MachinesGrid() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("machines");

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
  const groupMachinesByMachineId = () => {
    const grouped = {};
    machines.forEach((record) => {
      if (!grouped[record.machine_id]) {
        grouped[record.machine_id] = {
          machine_id: record.machine_id,
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
    return Object.values(grouped);
  };

  // Group machines by user
  const groupMachinesByUser = () => {
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
    return Object.values(grouped);
  };

  const machinesByMachineId = groupMachinesByMachineId();
  const machinesByUser = groupMachinesByUser();

  return (
    <div className="w-full bg-[#ECE3CE]/10 min-h-screen pb-10">
      <section className="flex flex-col w-full px-4 md:px-8 pt-6 space-y-6 animate-in fade-in duration-500">
        {/* header*/}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-[#4F6F52] pl-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[black]">
              Machines Directory
            </h1>
            <p className="text-sm text-muted-foreground italic mt-1">
              Monitor and manage all NutriBin units.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("machines")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === "machines"
                  ? "bg-[#4F6F52] text-white shadow-md"
                  : "bg-white text-[#4F6F52] border border-gray-200 hover:border-[#4F6F52]"
              }`}
            >
              <Grid3x3 className="h-4 w-4" />
              Machines
            </button>
            <button
              onClick={() => setViewMode("users")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === "users"
                  ? "bg-[#4F6F52] text-white shadow-md"
                  : "bg-white text-[#4F6F52] border border-gray-200 hover:border-[#4F6F52]"
              }`}
            >
              <Users className="h-4 w-4" />
              Users
            </button>
          </div>
        </div>

        {/* machines grid*/}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="w-10 h-10 border-4 border-[#4F6F52] border-t-transparent rounded-full animate-spin" />
            <p className="text-[#4F6F52] font-medium">Loading Machines...</p>
          </div>
        ) : viewMode === "machines" ? (
          // MACHINES VIEW - Group by machine, show users under each
          <>
            {machinesByMachineId.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400 font-medium bg-white rounded-xl border border-gray-100 shadow-sm">
                <Search className="h-10 w-10 mb-2 opacity-20" />
                No machines found.
              </div>
            ) : (
              <div className="space-y-4">
                {machinesByMachineId.map((machineGroup) => (
                  <div
                    key={machineGroup.machine_id}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    <div
                      onClick={() =>
                        navigate(`/machine/${machineGroup.machine_id}`)
                      }
                      className="p-6 cursor-pointer hover:bg-gray-50 transition-colors group border-b border-gray-100"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#ECE3CE] flex items-center justify-center group-hover:bg-[#4F6F52] transition-colors">
                          <Cpu className="h-6 w-6 text-[#4F6F52] group-hover:text-white transition-colors" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-[black] group-hover:text-[#4F6F52] transition-colors">
                            Machine
                          </h3>
                          <p className="text-sm text-gray-500">
                            {machineGroup.machine_id}
                          </p>
                        </div>
                        <div className="ml-auto text-xs font-semibold bg-[#4F6F52]/10 text-[#4F6F52] px-3 py-1 rounded-full">
                          {machineGroup.users.length}{" "}
                          {machineGroup.users.length === 1 ? "User" : "Users"}
                        </div>
                      </div>
                    </div>
                    {machineGroup.users.length > 0 && (
                      <div className="divide-y divide-gray-100">
                        {machineGroup.users.map((userRecord, idx) => (
                          <div
                            key={idx}
                            className="p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <User className="h-5 w-5 text-gray-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-[black]">
                                    {userRecord.first_name}{" "}
                                    {userRecord.last_name}
                                  </p>
                                  <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <Mail className="h-3 w-3" />{" "}
                                    {userRecord.email}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {machinesByMachineId.length > 0 && (
              <div className="text-center pb-8">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-white px-4 py-1 rounded-full border border-gray-100">
                  Total Machines: {machinesByMachineId.length}
                </span>
              </div>
            )}
          </>
        ) : (
          // USERS VIEW - Group by user, show machines under each
          <>
            {machinesByUser.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400 font-medium bg-white rounded-xl border border-gray-100 shadow-sm">
                <Search className="h-10 w-10 mb-2 opacity-20" />
                No users found.
              </div>
            ) : (
              <div className="space-y-4">
                {machinesByUser.map((userGroup) => (
                  <div
                    key={userGroup.user_id}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    <div className="p-6 border-b border-gray-100 bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#ECE3CE] flex items-center justify-center">
                          <User className="h-6 w-6 text-[#4F6F52]" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-[black]">
                            {userGroup.first_name} {userGroup.last_name}
                          </h3>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {userGroup.email}
                          </p>
                        </div>
                        <div className="ml-auto text-xs font-semibold bg-[#4F6F52]/10 text-[#4F6F52] px-3 py-1 rounded-full">
                          {userGroup.machines.length}{" "}
                          {userGroup.machines.length === 1
                            ? "Machine"
                            : "Machines"}
                        </div>
                      </div>
                    </div>
                    {userGroup.machines.length > 0 && (
                      <div className="divide-y divide-gray-100">
                        {userGroup.machines.map((machineRecord, idx) => (
                          <div
                            key={idx}
                            onClick={() =>
                              navigate(`/machine/${machineRecord.machine_id}`)
                            }
                            className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#ECE3CE] flex items-center justify-center group-hover:bg-[#4F6F52] transition-colors">
                                  <Cpu className="h-5 w-5 text-[#4F6F52] group-hover:text-white transition-colors" />
                                </div>
                                <div>
                                  <p className="font-medium text-[black] group-hover:text-[#4F6F52] transition-colors">
                                    Machine
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {machineRecord.machine_id}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {machinesByUser.length > 0 && (
              <div className="text-center pb-8">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-white px-4 py-1 rounded-full border border-gray-100">
                  Total Users: {machinesByUser.length}
                </span>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

// sub-components for cleaner code

// Machine and User cards are rendered within the main component for flexibility
export default MachinesGrid;
