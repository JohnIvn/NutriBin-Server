import { Button } from '@/components/ui/button'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons";

import React from 'react'
import { useParams } from 'react-router-dom'


function Modules() {
	const params = useParams()

	const id = params.user_id
	
	//Arbitrary
	const microcontrollers = ["Arduino-Q", "ESP32-Filter", "ESP32-Chute", "ESP32-Grinder", "ESP32-Exaust"]
	const sensors = ["Camera_A", "Camera_B", "Humidity", "Temperature", "Gas (Methane)", "Gas (Nitrogen)", "Water Level", "NPK Sensor", "Moisture"]
	const motors = ["Servo_Lid_A", "Servo_Diverter", "Servo_Lid_B", "Motor_Grinder", "Motor_Mixer", "Exhaust Fan In", "Exhaust Fan Out"]

	return (
		<section className='flex flex-col h-auto w-3/4 rounded-xl justify-start items-center p-4 my-auto  gap-2 bg-secondary'>
			<h1 className='text-4xl font-medium text-accent'>User#{id} Machine Modules</h1>
			<section className='flex justify-between h-auto w-full items-center gap-4'>
				<h1 className='flex w-1/4 justify-center text-white text-2xl font-medium'>Microcontroller</h1>
				<h1 className='flex w-1/2 justify-center text-white text-2xl font-medium'>Sensors</h1>
				<h1 className='flex w-1/2 justify-center text-white text-2xl font-medium'>Motors</h1>
			</section>
			<section className='flex justify-between h-full w-full items-start gap-4'>
				<div className='grid grid-rows-5 grid-cols-1 gap-2 h-full w-1/4 bg-primary p-2'>
					{microcontrollers.map((e, i) => (
						<Button
							key={i}
							className='flex justify-start bg-sky-600 h-24 text-lg text-primary hover:bg-sky-400 cursor-pointer'
						>
							<FontAwesomeIcon size='2x' icon={faGear} />

							{e}
						</Button>
					))}
				</div>

				<div className='grid grid-rows-5 grid-cols-2 gap-2 h-full w-1/2 bg-primary p-2'>
					{sensors.map((e, i) => (
						<Button
							key={i}
							className='flex justify-start bg-sky-600 h-24 text-lg text-primary hover:bg-sky-400 cursor-pointer'
						>
							<FontAwesomeIcon size='2x' icon={faGear} />
							{e}
						</Button>
					))}
				</div>

				<div className='grid grid-rows-4 grid-cols-2 gap-2 h-full w-1/2 bg-primary p-2'>
					{motors.map((e, i) => (
						<Button
							key={i}
							className='flex justify-start bg-sky-600 h-24 text-lg text-primary hover:bg-sky-400 cursor-pointer'
						>
							<FontAwesomeIcon size='2x' icon={faGear} />
							{e}
						</Button>
					))}
				</div>
			</section>
		</section>

	)
}

export default Modules
