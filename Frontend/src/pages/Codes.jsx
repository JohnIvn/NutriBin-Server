import { useState, useEffect } from "react";
import Requests from "@/utils/Requests";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Search, Key, Mail, Clock, ShieldCheck, CheckCircle2, XCircle, AlertCircle, RefreshCw, Filter } from "lucide-react";
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
    if (item.used) return { label: "Used", variant: "ghost", icon: CheckCircle2, color: "text-green-600" };
    if (new Date(item.expires_at) < new Date()) return { label: "Expired", variant: "destructive", icon: XCircle, color: "text-red-500" };
    return { label: "Active", variant: "default", icon: ShieldCheck, color: "text-green-600" };
  };

  return (
    <div className="flex flex-col gap-8 p-8 max-w-[1600px] mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#4F6F52] rounded-xl shadow-lg shadow-[#4F6F52]/20 text-white">
            <Key className="h-8 w-8" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-4xl font-extrabold tracking-tight text-[#4F6F52]">Verification Codes</h1>
            <p className="text-muted-foreground text-lg">
              Monitor and auditing security verification codes across the platform.
            </p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          onClick={fetchCodes} 
          disabled={loading}
          className="border-[#4F6F52]/20 hover:bg-[#4F6F52]/5 text-[#4F6F52]"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Registry
        </Button>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by code, purpose, or user email..."
            className="pl-11 h-12 bg-transparent border-none focus-visible:ring-0 text-lg placeholder:text-muted-foreground/60"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="h-8 w-[1px] bg-gray-100 hidden md:block" />
        <div className="flex items-center gap-2 px-2 text-sm font-medium text-muted-foreground">
          <Filter className="h-4 w-4" />
          Showing {filteredCodes.length} entries
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-[200px] rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filteredCodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
          <AlertCircle className="h-16 w-16 text-gray-200" />
          <div className="max-w-[300px]">
            <h3 className="text-xl font-bold text-[#4F6F52]">No codes found</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your search filters if looking for something specific.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCodes.map((item) => {
            const status = getStatus(item);
            const StatusIcon = status.icon;
            
            return (
              <Card key={item.code_id} className="group overflow-hidden border-gray-100 hover:border-[#4F6F52]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#4F6F52]/5 rounded-2xl bg-white">
                <CardHeader className="p-5 pb-3">
                  <div className="flex justify-between items-start">
                    <Badge variant={status.variant} className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.color}`}>
                      {status.label}
                    </Badge>
                    <div className="text-[10px] font-medium text-muted-foreground italic">
                      ID: #{item.code_id}
                    </div>
                  </div>
                  <CardTitle className="pt-4 flex flex-col gap-2">
                    <span className="text-3xl font-mono font-bold tracking-[0.2em] text-[#4F6F52] transition-transform group-hover:scale-105 origin-left">
                      {item.code}
                    </span>
                    <span className="text-sm font-medium capitalize text-slate-600">
                      {item.purpose.replace(/_/g, " ")}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-0 space-y-4">
                  <div className="space-y-2 pt-2 border-t border-slate-50">
                    <div className="flex items-center gap-2.5 text-sm text-slate-500">
                      <div className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-[#4F6F52]/10 transition-colors">
                        <Mail className="h-3.5 w-3.5" />
                      </div>
                      <span className="truncate flex-1 font-medium">{item.email || "System Level"}</span>
                    </div>
                    
                    <div className="flex items-center gap-2.5 text-sm text-slate-500">
                      <div className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-[#4F6F52]/10 transition-colors">
                        <Clock className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] text-muted-foreground leading-none mb-1">Created At</span>
                        <span className="font-medium whitespace-nowrap leading-none">
                          {format(new Date(item.created_at), "MMM d, HH:mm")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={`mt-4 p-3 rounded-xl flex items-center justify-between overflow-hidden relative ${item.used ? 'bg-transparent' : 'bg-green-50/50'}`}>
                    <div className="flex flex-col relative z-10">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tighter">Expiry Date</span>
                      <span className="text-xs font-bold text-slate-700">{format(new Date(item.expires_at), "MMM d, HH:mm")}</span>
                    </div>
                    <StatusIcon className={`h-8 w-8 absolute -right-2 top-1/2 -translate-y-1/2 opacity-10 ${status.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Codes;
