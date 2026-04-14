//Used Codes Page
import { useState, useEffect } from "react";
import Requests from "@/utils/Requests";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Search,
  Key,
  Mail,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function Codes() {
  const [codeList, setCodeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    try {
      setLoading(true);
      const response = await Requests({
        url: "/management/codes",
        method: "GET",
        credentials: true,
      });
      if (response.data.ok) {
        setCodeList(response.data.codes || []);
      }
    } catch (error) {
      console.error("Failed to load codes:", error);
      toast.error("Failed to load codes data");
    } finally {
      setLoading(false);
    }
  };

  const filteredCodes = codeList.filter((item) => {
    const search = searchTerm.toLowerCase();
    return (
      item.code.toLowerCase().includes(search) ||
      item.purpose.toLowerCase().includes(search) ||
      (item.email && item.email.toLowerCase().includes(search))
    );
  });

  const getStatus = (item) => {
    if (item.used)
      return {
        label: "Used",
        variant: "ghost",
        icon: CheckCircle2,
        color: "text-green-600",
      };
    if (new Date(item.expires_at) < new Date())
      return {
        label: "Expired",
        variant: "destructive",
        icon: XCircle,
        color: "text-red-500",
      };
    return {
      label: "Active",
      variant: "default",
      icon: ShieldCheck,
      color: "text-green-600",
    };
  };

  return (
    <div className="w-full bg-[#F6F7F4] min-h-screen pb-10">
      <section className="flex flex-col w-full px-4 md:px-8 pt-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4F6F52]/10 text-[#4F6F52] text-xs font-bold uppercase tracking-wider">
              <Key className="h-3.5 w-3.5" />
              Security Registry
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#3A4D39]">
              Verification <span className="text-[#4F6F52]">Codes</span>
            </h1>
            <p className="text-gray-500 max-w-2xl font-medium text-lg">
              Audit the lifecycle of security artifacts. Monitor generation,
              usage, and expiration for all platform-wide authentication
              challenges.
            </p>
          </div>
          <Button
            onClick={fetchCodes}
            disabled={loading}
            className="bg-[#4F6F52] hover:bg-[#3A4D39] text-white shadow-xl shadow-[#4F6F52]/20 cursor-pointer transition-all active:scale-95 px-8 h-14 rounded-2xl font-bold text-lg"
          >
            <RefreshCw
              className={`mr-2 h-5 w-5 stroke-[2.5] ${loading ? "animate-spin" : ""}`}
            />
            Refresh Registry
          </Button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-[2rem] border-none shadow-2xl shadow-gray-200/50 p-4 transition-all hover:shadow-gray-300/50 group">
          <div className="relative flex items-center w-full">
            <Search className="absolute left-6 h-6 w-6 text-gray-400 transition-colors duration-200 group-focus-within:text-[#4F6F52] z-10" />
            <Input
              type="search"
              placeholder="Search by code, purpose, or system identifier..."
              className="pl-16 bg-gray-50 shadow-inner border-transparent focus:bg-white focus-visible:ring-2 focus-visible:ring-[#4F6F52]/20 text-[#3A4D39] focus-visible:border-[#4F6F52] w-full h-16 rounded-[1.5rem] transition-all duration-300 font-bold text-xl placeholder:text-gray-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute right-6 flex items-center gap-3 bg-[#4F6F52]/5 px-4 py-2 rounded-xl">
              <Filter className="h-4 w-4 text-[#4F6F52]" />
              <span className="text-sm font-black text-[#4F6F52] uppercase tracking-tighter">
                {filteredCodes.length} Registered
              </span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="h-[280px] rounded-[2.5rem] bg-white shadow-sm animate-pulse flex flex-col p-8 space-y-4"
              >
                <div className="h-6 w-20 bg-gray-100 rounded-full" />
                <div className="h-12 w-full bg-gray-100 rounded-2xl" />
                <div className="space-y-2 pt-4">
                  <div className="h-4 w-3/4 bg-gray-50 rounded" />
                  <div className="h-4 w-1/2 bg-gray-50 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6 text-center bg-white rounded-[3rem] border-none shadow-xl">
            <div className="p-8 bg-gray-50 rounded-full">
              <AlertCircle className="h-20 w-20 text-gray-200" />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-[#3A4D39]">
                Registry Empty
              </h3>
              <p className="text-gray-400 font-medium max-w-sm text-lg">
                No security codes match your current search criteria.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setSearchTerm("")}
              className="rounded-xl font-bold text-[#4F6F52]"
            >
              Clear Search Results
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCodes.map((item) => {
              const status = getStatus(item);
              const StatusIcon = status.icon;

              return (
                <Card
                  key={item.code_id}
                  className="group overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] bg-white relative"
                >
                  <CardHeader className="p-8 pb-4">
                    <div className="flex justify-between items-start mb-6">
                      <span
                        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border shadow-sm ${
                          status.label === "Active"
                            ? "bg-green-50 text-green-700 border-green-100"
                            : status.label === "Expired"
                              ? "bg-red-50 text-red-700 border-red-100"
                              : "bg-gray-50 text-gray-500 border-gray-100"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            status.label === "Active"
                              ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] animate-pulse"
                              : status.label === "Expired"
                                ? "bg-red-500"
                                : "bg-gray-400"
                          }`}
                        />
                        {status.label}
                      </span>
                      <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">
                        ID:{item.code_id}
                      </div>
                    </div>
                    <CardTitle className="flex flex-col gap-3">
                      <span className="text-4xl font-mono font-black tracking-[0.2em] text-[#3A4D39] transition-all group-hover:tracking-[0.25em] duration-500 drop-shadow-sm">
                        {item.code}
                      </span>
                      <span className="text-[11px] font-black uppercase tracking-[0.15em] text-[#4F6F52]/60 flex items-center gap-2">
                        <ShieldCheck className="h-3 w-3" />
                        {item.purpose.replace(/_/g, " ")}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 pt-0 space-y-6">
                    <div className="space-y-3 pt-6 border-t border-gray-50">
                      <div className="flex items-center gap-4 text-sm font-bold text-gray-500 group-hover:text-[#4F6F52] transition-colors">
                        <div className="p-2.5 bg-gray-50 rounded-2xl group-hover:bg-[#4F6F52]/10 transition-colors">
                          <Mail className="h-4 w-4" />
                        </div>
                        <span className="truncate flex-1">
                          {item.email || "System/Internal"}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm font-bold text-gray-500">
                        <div className="p-2.5 bg-gray-50 rounded-2xl">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-tighter text-gray-300 leading-none mb-1.5">
                            Established At
                          </span>
                          <span className="text-[#3A4D39] font-black">
                            {format(new Date(item.created_at), "MMM d, HH:mm")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`mt-4 p-5 rounded-[1.5rem] flex items-center justify-between overflow-hidden relative ${item.used ? "bg-gray-50/50 opacity-60" : "bg-[#4F6F52]/5"}`}
                    >
                      <div className="flex flex-col relative z-10">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">
                          Automated Expiry
                        </span>
                        <span className="text-sm font-black text-[#3A4D39]">
                          {format(new Date(item.expires_at), "MMM d, HH:mm")}
                        </span>
                      </div>
                      <StatusIcon
                        className={`h-12 w-12 absolute -right-3 top-1/2 -translate-y-1/2 opacity-10 ${status.color}`}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Codes;
