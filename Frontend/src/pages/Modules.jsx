import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGear,
  faMicrochip,
  faTowerBroadcast,
  faFan,
  faCircleExclamation,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Requests from "@/utils/Requests";
import { toast } from "sonner";

const StatusBadge = ({ isOffline }) => (
  <div
    className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
      isOffline
        ? "bg-red-100 text-red-700 border-red-200 group-hover:bg-red-500 group-hover:text-white group-hover:border-red-500"
        : "bg-[#4F6F52]/10 text-[#4F6F52] border-[#4F6F52]/20 group-hover:bg-[#ECE3CE]/20 group-hover:text-[#ECE3CE] group-hover:border-[#ECE3CE]/20"
    } transition-colors duration-200 shrink-0 mt-auto`}
  >
    <FontAwesomeIcon icon={isOffline ? faCircleExclamation : faCheckCircle} />
    {isOffline ? "Offline" : "Active"}
  </div>
);

const ModuleGroup = ({ title, items, icon, columns = "grid-cols-1" }) => (
  <div className="flex flex-col bg-white rounded-2xl border border-[#ECE3CE] shadow-sm overflow-hidden h-full">
    {/* Card Header */}
    <div className="bg-[#ECE3CE]/30 px-5 py-4 border-b border-[#ECE3CE] flex items-center justify-between">
      <h2 className="font-bold text-sm uppercase tracking-widest text-[#3A4D39] flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#4F6F52] shadow-sm">
          <FontAwesomeIcon icon={icon} />
        </div>
        {title}
      </h2>
      <span className="text-[10px] font-bold text-[#739072] bg-[#739072]/10 px-3 py-1 rounded-full border border-[#739072]/20">
        {items.length} Units
      </span>
    </div>

    {/* card */}
    <div className={`grid ${columns} gap-4 p-5`}>
      {items.map((item, i) => (
        <Button
          key={i}
          variant="outline"
          className={`group relative flex justify-start items-start gap-3 p-3 border transition-all duration-300 shadow-sm overflow-hidden h-full min-h-[5rem]
            ${
              item.offline
                ? "bg-red-50/50 border-red-100 hover:border-red-500 hover:bg-red-500" // Offline
                : "bg-white border-[#ECE3CE] hover:border-[#4F6F52] hover:bg-[#4F6F52]" // Active
            }`}
        >
          {/* icon container */}
          <div
            className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg transition-colors mt-0.5 ${
              item.offline
                ? "bg-red-100 text-red-500 group-hover:bg-white/20 group-hover:text-white"
                : "bg-[#ECE3CE]/40 text-[#739072] group-hover:bg-[#ECE3CE]/20 group-hover:text-[#ECE3CE]"
            }`}
          >
            <FontAwesomeIcon icon={faGear} className="text-lg" />
          </div>

          {/* text content */}
          <div className="flex flex-col items-start text-left flex-grow h-full justify-between gap-2">
            {/* white space */}
            <span
              className={`text-sm font-bold leading-tight whitespace-normal break-words w-full transition-colors ${
                item.offline
                  ? "text-red-900 group-hover:text-white"
                  : "text-[#3A4D39] group-hover:text-white"
              }`}
            >
              {item.label}
            </span>
            <StatusBadge isOffline={item.offline} />
          </div>

          {/* side bar */}
          <div
            className={`absolute left-0 top-0 bottom-0 w-1 transition-colors ${
              item.offline 
                ? "bg-red-400 group-hover:bg-red-700" 
                : "bg-[#4F6F52] group-hover:bg-[#ECE3CE]" 
            }`}
          />
        </Button>
      ))}
    </div>
  </div>
);

function Modules() {
  const params = useParams();
  const navigate = useNavigate();
  const repairId = params.user_id;

  const componentCodes = [
    "c1",
    "c2",
    "c3",
    "c4",
    "c5",
    "s1",
    "s2",
    "s3",
    "s4",
    "s5",
    "s6",
    "s7",
    "s8",
    "s9",
    "m1",
    "m2",
    "m3",
    "m4",
    "m5",
    "m6",
    "m7",
  ];

  const baseFlags = componentCodes.reduce((acc, code) => {
    acc[code] = false;
    return acc;
  }, {});

  const [componentFlags, setComponentFlags] = useState(baseFlags);

  const microcontrollers = [
    { code: "c1", label: "Arduino-Q" },
    { code: "c2", label: "ESP32-Filter" },
    { code: "c3", label: "ESP32-Chute" },
    { code: "c4", label: "ESP32-Grinder" },
    { code: "c5", label: "ESP32-Exhaust" },
  ];

  const sensors = [
    { code: "s1", label: "Camera_A" },
    { code: "s2", label: "Camera_B" },
    { code: "s3", label: "Humidity" },
    { code: "s4", label: "Temperature" },
    { code: "s5", label: "Gas (Methane)" },
    { code: "s6", label: "Gas (Nitrogen)" },
    { code: "s7", label: "Water Level" },
    { code: "s8", label: "NPK Sensor" },
    { code: "s9", label: "Moisture" },
  ];

  const motors = [
    { code: "m1", label: "Servo_Lid_A" },
    { code: "m2", label: "Servo_Lid_B" },
    { code: "m3", label: "Servo_Diverter" },
    { code: "m4", label: "Motor_Grinder" },
    { code: "m5", label: "Motor_Mixer" },
    { code: "m6", label: "Exhaust Fan In" },
    { code: "m7", label: "Exhaust Fan Out" },
  ];

  const mapStatuses = (items) =>
    items.map((item) => ({
      ...item,
      offline: !!componentFlags[item.code],
    }));

  const fetchDiagnostics = async () => {
    try {
      const response = await Requests({
        url: `/management/repair/${repairId}`,
        method: "GET",
        credentials: true,
      });

      if (response.data?.repair) {
        const nextFlags = { ...baseFlags };
        componentCodes.forEach((code) => {
          nextFlags[code] = Boolean(response.data.repair[code]);
        });
        setComponentFlags(nextFlags);
      }
    } catch {
      toast.error("Failed to load diagnostics");
    }
  };

  useEffect(() => {
    fetchDiagnostics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repairId]);

  return (
    <div className="flex flex-grow min-h-screen w-full bg-[#ECE3CE]/20 font-sans">
      <section className="flex-grow flex flex-col w-full max-w-[1600px] mx-auto p-6 md:p-10 space-y-10 animate-in fade-in duration-500 pb-20">
        
        {/* header section */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 border-l-4 border-[#3A4D39] pl-6 py-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full bg-white border border-[#ECE3CE] text-[#739072] cursor-pointer hover:bg-[#3A4D39] hover:text-white hover:border-[#3A4D39] transition-all duration-200 shadow-sm h-10 w-10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[black]">
              Machine Diagnostics
            </h1>
            <div className="flex items-center gap-2 text-sm text-[#739072] font-medium">
              <span>Hardware Mapping</span>
              <span className="w-1 h-1 rounded-full bg-[#739072]" />
              <span className="text-[#4F6F52] bg-[#4F6F52]/10 px-2 py-0.5 rounded text-xs uppercase tracking-wide">
                Ticket #{repairId}
              </span>
            </div>
          </div>
        </div>

        {/* content grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 items-start">
          
          {/* microcontrollers */}
          <div className="lg:col-span-3 h-full">
            <ModuleGroup
              title="Microcontrollers"
              items={mapStatuses(microcontrollers)}
              icon={faMicrochip}
            />
          </div>

          {/* sensors */}
          <div className="lg:col-span-5 h-full">
            <ModuleGroup
              title="Sensors"
              items={mapStatuses(sensors)}
              icon={faTowerBroadcast}
              columns="grid-cols-1 sm:grid-cols-2"
            />
          </div>

          {/* motors & fans */}
          <div className="lg:col-span-4 h-full">
            <ModuleGroup
              title="Motors & Fans"
              items={mapStatuses(motors)}
              icon={faFan}
              columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default Modules;