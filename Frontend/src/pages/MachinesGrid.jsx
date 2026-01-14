import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userFilter } from "@/schema/users";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Requests from "@/utils/Requests";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";

function MachinesGrid() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [machineDetails, setMachineDetails] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Redirect if not admin or staff
  useEffect(() => {
    if (user && user.role !== "admin" && user.role !== "staff") {
      toast.error("Access denied. Staff privileges required.");
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const filterForm = useForm({
    resolver: zodResolver(userFilter),
    defaultValues: { count: "10", term: "" },
  });

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

  const fetchMachineDetails = async (machineId) => {
    try {
      setDetailsLoading(true);
      const response = await Requests({
        url: `/management/machines/${machineId}`,
        method: "GET",
        credentials: true,
      });
      if (response.data.ok) {
        setMachineDetails(response.data.machine);
      }
    } catch {
      toast.error("Failed to load machine details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleMachineClick = (machine) => {
    setSelectedMachine(machine);
    setModalOpen(true);
    fetchMachineDetails(machine.machine_id);
  };

  // const handleCloseModal = () => {
  //   setModalOpen(false);
  //   setSelectedMachine(null);
  //   setMachineDetails(null);
  // };

  // Helpers for NPK computations (with mock fallback)
  const toNumber = (val) => {
    if (val === null || val === undefined) return NaN;
    const num = parseFloat(String(val).replace(/[^0-9.-]/g, ""));
    return Number.isFinite(num) ? num : NaN;
  };

  const term = filterForm.watch("term").toLowerCase();
  const filteredMachines = machines.filter((machine) => {
    return (
      machine.machine_id?.toLowerCase().includes(term) ||
      `${machine.first_name} ${machine.last_name}`.toLowerCase().includes(term)
    );
  });

  return (
    <div className="w-full bg-[#FDF8F1] min-h-screen pb-10">
      <section className="flex flex-col w-full px-4 md:px-8 pt-6 space-y-6 animate-in fade-in duration-500">
        {/* header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-[#CD5C08] pl-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
              Machines
            </h1>
            <p className="text-sm text-muted-foreground italic mt-1">
              Monitor and manage all NutriBin machines.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-xl p-5">
          <Form {...filterForm}>
            <div className="relative w-full md:w-[450px] group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors duration-200 group-focus-within:text-[#CD5C08] z-10" />
              <FormField
                control={filterForm.control}
                name="term"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Input
                        placeholder="Filter by machine ID or owner name..."
                        className="pl-10 border-gray-200 focus-visible:ring-1 focus-visible:ring-[#CD5C08] focus-visible:border-[#CD5C08] w-full h-11 transition-all duration-200"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </Form>
        </div>

        {/* Machines Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="w-10 h-10 border-4 border-[#CD5C08] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 font-medium">Loading Machines...</p>
          </div>
        ) : filteredMachines.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-400 font-medium bg-white rounded-xl border border-gray-100 shadow-xl">
            No machines found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredMachines.map((machine) => (
              <div
                key={machine.machine_id}
                onClick={() => handleMachineClick(machine)}
                className="bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group hover:border-[#CD5C08] p-6 flex flex-col items-center justify-center gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-[#CD5C08]/10 flex items-center justify-center group-hover:bg-[#CD5C08] transition-colors duration-300">
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                    ⊕
                  </span>
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-gray-900 text-lg group-hover:text-[#CD5C08] transition-colors">
                    {machine.machine_id}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {machine.first_name} {machine.last_name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Total count */}
        {!loading && filteredMachines.length > 0 && (
          <div className="text-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Total Machines: {filteredMachines.length}
            </span>
          </div>
        )}
      </section>

      {/* Machine Details Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="w-[95vw] h-[85vh] bg-[#FDF8F1] border-[#CD5C08]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#CD5C08]">
              Machine Details: {selectedMachine?.machine_id}
            </DialogTitle>
          </DialogHeader>

          {detailsLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <div className="w-10 h-10 border-4 border-[#CD5C08] border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400 font-medium">
                Loading Machine Diagnostics...
              </p>
            </div>
          ) : machineDetails ? (
            <div className="space-y-6">
              {/* Owner Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">
                  Owner Information
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <p className="font-semibold">
                      {machineDetails.first_name} {machineDetails.last_name}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <p className="font-semibold">{machineDetails.email}</p>
                  </div>
                </div>
              </div>

              {/* Error Rate */}
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <h3 className="font-bold text-red-900 mb-2">System Health</h3>
                <div className="flex items-center gap-2">
                  <span className="text-gray-700">Error Rate:</span>
                  <span className="font-bold text-2xl text-red-600">
                    {machineDetails.error_rate}%
                  </span>
                </div>
              </div>

              {/* NPK Output */}
              {machineDetails.fertilizer_analytics?.length > 0 && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h3 className="font-bold text-green-900 mb-3">
                    Latest NPK Output
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase">
                        Nitrogen
                      </p>
                      <p className="text-2xl font-bold text-green-700">
                        {machineDetails.fertilizer_analytics[0].nitrogen ||
                          "N/A"}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase">
                        Phosphorus
                      </p>
                      <p className="text-2xl font-bold text-green-700">
                        {machineDetails.fertilizer_analytics[0].phosphorus ||
                          "N/A"}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase">
                        Potassium
                      </p>
                      <p className="text-2xl font-bold text-green-700">
                        {machineDetails.fertilizer_analytics[0].potassium ||
                          "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* NPK Ratio Overview + Total Composition (mock-friendly) */}
              {(() => {
                const latest = machineDetails.fertilizer_analytics?.[0] || {};
                const nRaw = toNumber(latest.nitrogen);
                const pRaw = toNumber(latest.phosphorus);
                const kRaw = toNumber(latest.potassium);

                // Mock fallback if values are missing
                const n = Number.isFinite(nRaw) ? nRaw : 40;
                const p = Number.isFinite(pRaw) ? pRaw : 25;
                const k = Number.isFinite(kRaw) ? kRaw : 35;

                const total = Math.max(n + p + k, 1);
                const nPct = Math.round((n / total) * 100);
                const pPct = Math.round((p / total) * 100);
                const kPct = 100 - nPct - pPct; // ensure 100%

                const minVal = Math.max(Math.min(n, p, k), 1e-6);
                const rN = Math.max(1, Math.round(n / minVal));
                const rP = Math.max(1, Math.round(p / minVal));
                const rK = Math.max(1, Math.round(k / minVal));

                return (
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Ratio Overview */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h3 className="font-bold text-gray-900 mb-2">
                        NPK Ratio Overview
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Suggested Blend Ratio (approx.)
                      </p>
                      <div className="flex items-end gap-4 h-28">
                        <div className="flex-1 flex flex-col items-center">
                          <div
                            className="w-10 bg-green-500/80 rounded-t"
                            style={{
                              height: `${Math.max(10, (n / total) * 100)}%`,
                            }}
                          />
                          <span className="mt-2 text-xs font-semibold text-gray-700">
                            N
                          </span>
                          <span className="text-[11px] text-gray-500">
                            {nPct}%
                          </span>
                        </div>
                        <div className="flex-1 flex flex-col items-center">
                          <div
                            className="w-10 bg-yellow-500/80 rounded-t"
                            style={{
                              height: `${Math.max(10, (p / total) * 100)}%`,
                            }}
                          />
                          <span className="mt-2 text-xs font-semibold text-gray-700">
                            P
                          </span>
                          <span className="text-[11px] text-gray-500">
                            {pPct}%
                          </span>
                        </div>
                        <div className="flex-1 flex flex-col items-center">
                          <div
                            className="w-10 bg-blue-500/80 rounded-t"
                            style={{
                              height: `${Math.max(10, (k / total) * 100)}%`,
                            }}
                          />
                          <span className="mt-2 text-xs font-semibold text-gray-700">
                            K
                          </span>
                          <span className="text-[11px] text-gray-500">
                            {kPct}%
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 text-sm font-bold text-gray-800">
                        Ratio: {rN}:{rP}:{rK}
                      </div>
                    </div>

                    {/* Total Nutrient Composition */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h3 className="font-bold text-gray-900 mb-2">
                        Total Nutrient Composition
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Distribution of N, P, and K (sample if readings
                        unavailable)
                      </p>
                      <div className="w-full h-6 rounded overflow-hidden border border-gray-200 bg-gray-100 relative">
                        <div
                          className="h-full bg-green-500/80 inline-block"
                          style={{ width: `${nPct}%` }}
                          title={`Nitrogen ${nPct}%`}
                        />
                        <div
                          className="h-full bg-yellow-500/80 inline-block"
                          style={{ width: `${pPct}%` }}
                          title={`Phosphorus ${pPct}%`}
                        />
                        <div
                          className="h-full bg-blue-500/80 inline-block"
                          style={{ width: `${kPct}%` }}
                          title={`Potassium ${kPct}%`}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-gray-700">
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 bg-green-500/80 inline-block rounded-sm" />{" "}
                          N: {nPct}%
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 bg-yellow-500/80 inline-block rounded-sm" />{" "}
                          P: {pPct}%
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 bg-blue-500/80 inline-block rounded-sm" />{" "}
                          K: {kPct}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Environmental Readings */}
              {machineDetails.fertilizer_analytics?.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="font-bold text-blue-900 mb-3">
                    Environmental Readings
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Temperature:</span>
                      <p className="font-semibold">
                        {machineDetails.fertilizer_analytics[0].temperature ||
                          "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Humidity:</span>
                      <p className="font-semibold">
                        {machineDetails.fertilizer_analytics[0].humidity ||
                          "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">pH:</span>
                      <p className="font-semibold">
                        {machineDetails.fertilizer_analytics[0].ph || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Moisture:</span>
                      <p className="font-semibold">
                        {machineDetails.fertilizer_analytics[0].moisture ||
                          "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Module Status */}
              {machineDetails.module_analytics?.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-3">
                    Module Status
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    {Object.entries(machineDetails.module_analytics[0])
                      .filter(([key]) => key !== "date_created")
                      .map(([key, value]) => (
                        <div
                          key={key}
                          className={`p-2 rounded flex items-center gap-2 ${
                            value
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              value ? "bg-green-500" : "bg-red-500"
                            }`}
                          />
                          <span className="font-medium capitalize">
                            {key.replace(/_/g, " ")}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No details available
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default MachinesGrid;
