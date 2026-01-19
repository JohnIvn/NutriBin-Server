import { useState, useEffect } from "react";
import {
  Search,
  User,
  Mail,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Thermometer,
  Droplets,
  Wind,
  Activity,
  Sprout,
  Cpu,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userFilter } from "@/schema/users";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import Requests from "@/utils/Requests";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";

function MachinesGrid() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMachine, setSelectedMachine] = useState(null);

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

  const handleMachineClick = (machine) => {
    // navigate to machine details page
    navigate(`/machine/${machine.machine_id}`);
  };

  // Helpers for NPK computations
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
        </div>

        {/* search bar */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <Form {...filterForm}>
            <div className="relative w-full md:w-[450px] group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors duration-200 group-focus-within:text-[#4F6F52] z-10" />
              <FormField
                control={filterForm.control}
                name="term"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Input
                        placeholder="Search by Machine ID or Owner..."
                        className="pl-10 border-gray-200 focus-visible:ring-1 focus-visible:ring-[#4F6F52] focus-visible:border-[#4F6F52] text-[#4F6F52] w-full h-11 transition-all duration-200"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </Form>
        </div>

        {/* machines grid*/}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="w-10 h-10 border-4 border-[#4F6F52] border-t-transparent rounded-full animate-spin" />
            <p className="text-[#4F6F52] font-medium">Loading Machines...</p>
          </div>
        ) : filteredMachines.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 font-medium bg-white rounded-xl border border-gray-100 shadow-sm">
            <Search className="h-10 w-10 mb-2 opacity-20" />
            No machines found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredMachines.map((machine) => (
              <div
                key={machine.machine_id}
                onClick={() => handleMachineClick(machine)}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group hover:border-[#4F6F52]/50 p-6 flex flex-col items-center justify-center gap-3 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-[#ECE3CE] group-hover:bg-[#4F6F52] transition-colors" />
                <div className="w-12 h-12 rounded-full bg-[#ECE3CE] flex items-center justify-center group-hover:bg-[#4F6F52] transition-colors duration-300">
                  <Cpu className="h-6 w-6 text-[#4F6F52] group-hover:text-white transition-colors" />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-[black] text-lg group-hover:text-[#4F6F52] transition-colors">
                    {machine.machine_id}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
                    <User className="h-3 w-3" /> {machine.first_name}{" "}
                    {machine.last_name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Total count */}
        {!loading && filteredMachines.length > 0 && (
          <div className="text-center pb-8">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-white px-4 py-1 rounded-full border border-gray-100">
              Total Machines: {filteredMachines.length}
            </span>
          </div>
        )}
      </section>

      {/* Removed modal — clicking a machine now navigates to the machine page */}
    </div>
  );
}

// sub-components for cleaner code

// EnvCard and NutrientBar moved to MachineDetails page
export default MachinesGrid;
