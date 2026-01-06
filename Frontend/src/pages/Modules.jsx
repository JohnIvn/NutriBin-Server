import { Button } from '@/components/ui/button'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear, faMicrochip, faTowerBroadcast, faFan } from "@fortawesome/free-solid-svg-icons";
import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from "lucide-react"

const ModuleGroup = ({ title, items, icon, columns = "grid-cols-1" }) => (
  <div className="flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden h-full">
    <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
      <h2 className="font-bold text-[11px] uppercase tracking-widest text-gray-500 flex items-center gap-2">
        <FontAwesomeIcon icon={icon} className="text-[#CD5C08]" />
        {title}
      </h2>
      <span className="text-[10px] font-mono bg-gray-200 px-2 py-0.5 rounded text-gray-600">
        {items.length} Units
      </span>
    </div>
    
    <div className={`grid ${columns} gap-3 p-4`}>
      {items.map((item, i) => (
        <Button
          key={i}
          variant="outline"
          className="group flex justify-start items-center gap-3 h-20 border-gray-100 hover:border-[#CD5C08] hover:bg-[#CD5C08] transition-all duration-200 shadow-sm overflow-hidden"
        >
          <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-gray-50 group-hover:bg-white/20 group-hover:text-white transition-colors">
            <FontAwesomeIcon icon={faGear} className="text-lg opacity-70" />
          </div>
          <div className="flex flex-col items-start overflow-hidden text-left">
            <span className="text-sm font-bold text-gray-700 truncate w-full group-hover:text-white">
              {item}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse group-hover:bg-white" />
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter group-hover:text-white/80">Active</span>
            </div>
          </div>
        </Button>
      ))}
    </div>
  </div>
);

function Modules() {
  const params = useParams()
  const navigate = useNavigate()
  const id = params.user_id
  
  const microcontrollers = ["Arduino-Q", "ESP32-Filter", "ESP32-Chute", "ESP32-Grinder", "ESP32-Exaust"]
  const sensors = ["Camera_A", "Camera_B", "Humidity", "Temperature", "Gas (Methane)", "Gas (Nitrogen)", "Water Level", "NPK Sensor", "Moisture"]
  const motors = ["Servo_Lid_A", "Servo_Diverter", "Servo_Lid_B", "Motor_Grinder", "Motor_Mixer", "Exhaust Fan In", "Exhaust Fan Out"]

  return (
    <div className="flex flex-grow min-h-screen w-full bg-[#FDF8F1]">
      
      <section className="flex-grow flex flex-col w-full max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500 pb-12">
        
        {/* header */}
        <div className="flex items-center gap-4 border-l-4 border-[#CD5C08] pl-4">
           <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)} 
            className="rounded-full hover:bg-gray-200 hover:bg-[#CD5C08] border-[#CD5C08] cursor-pointer hover:text-white"
          >
            <ArrowLeft className="w-5 h-5 " />
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
              Machine Diagnostics <span className="text-gray-400 font-light">|</span> <span className="text-[#CD5C08]">User #{id}</span>
            </h1>
            <p className="text-sm text-muted-foreground italic">Hardware component status and configuration mapping.</p>
          </div>
        </div>

        {/* grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-3">
            <ModuleGroup title="Microcontrollers" items={microcontrollers} icon={faMicrochip} />
          </div>

          <div className="lg:col-span-5">
            <ModuleGroup title="Sensors" items={sensors} icon={faTowerBroadcast} columns="grid-cols-1 sm:grid-cols-2" />
          </div>

          <div className="lg:col-span-4">
            <ModuleGroup title="Motors & Fans" items={motors} icon={faFan} columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2" />
          </div>
        </div>
      </section>
    </div>
  )
}

export default Modules