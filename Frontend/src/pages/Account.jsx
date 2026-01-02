import { Button } from '@/components/ui/button'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { adminAccount } from '@/schema/adminAccount'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

function Account() {
	const [editMode, setEditMode] = useState(false)

	const form = useForm({
		resolver: zodResolver(adminAccount),
		defaultValues: {
			firstname: "",
			lastname: "",
			address: "",
			age: 0,
			gender: "male",
			number: 0,
		},
	})
	
	const handleSubmission = () => {
		//TODO Edit User Account Details
		setEditMode(false)
	}


	return (
		<section className='flex flex-col min-h-full h-auto w-3/4 m-auto rounded-xl justify-start items-center p-4 gap-2'>
			<section className='flex w-full h-full py-2 gap-2'>
				<Form {...form}>
					<form className="w-full max-w-3xl space-y-6 text-black shadow shadow-gray-600 p-8">
						<h1 className='text-black text-4xl font-medium'>Account Settings</h1>

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="firstname"

								render={({ field }) => (
									<FormItem>
										<FormLabel>First Name</FormLabel>
										<FormControl>
											<Input {...field} disabled={!editMode} placeholder="First Name" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="lastname"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Last Name</FormLabel>
										<FormControl>
											<Input {...field} disabled={!editMode} placeholder="Last Name" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="address"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Address</FormLabel>
									<FormControl>
										<Input {...field} disabled={!editMode} placeholder="Complete Address" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="age"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Age</FormLabel>
										<FormControl>
											<Input type="number" {...field} disabled={!editMode} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="number"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Contact Number</FormLabel>
										<FormControl>
											<Input type="number" {...field} disabled={!editMode} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="gender"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Gender</FormLabel>
									<FormControl>
										<RadioGroup
											value={field.value}
											onValueChange={field.onChange}
											className="flex gap-6"
											disabled={!editMode}
										>
											<FormItem className="flex items-center gap-2">
												<FormControl>
													<RadioGroupItem value="male" className="border-secondary data-[state=checked]:bg-secondary data-[state=checked]:border-secondary data-[state=checked]:text-secondary-foreground" />
												</FormControl>
												<FormLabel className="font-normal">Male</FormLabel>
											</FormItem>

											<FormItem className="flex items-center gap-2">
												<FormControl>
													<RadioGroupItem value="female" className="border-secondary data-[state=checked]:bg-secondary data-[state=checked]:border-secondary data-[state=checked]:text-secondary-foreground" />
												</FormControl>
												<FormLabel className="font-normal">Female</FormLabel>
											</FormItem>

											<FormItem className="flex items-center gap-2">
												<FormControl>
													<RadioGroupItem value="others" className="  border-secondary data-[state=checked]:bg-secondary data-[state=checked]:border-secondary data-[state=checked]:text-secondary-foreground"
													/>
												</FormControl>
												<FormLabel className="font-normal">Others</FormLabel>
											</FormItem>
										</RadioGroup>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className='flex gap-4 my-4'>
							<Button type={'button'} className={`${editMode ? 'hidden' : 'flex' } min-w-48 w-auto h-12 p-2 bg-secondary hover:bg-secondary-foreground cursor-pointer`} onClick={() => setEditMode(true)}>
								Edit
							</Button>
							<Button type={'submit'} className={`${editMode ? 'flex' : 'hidden'} min-w-48 w-auto h-12 p-2 bg-gray-800 hover:bg-gray-600 cursor-pointer`}
							onClick={() => handleSubmission()}>
								Submit
							</Button>
							<Button type={'button'} className={`${editMode ? 'flex' : 'hidden'} min-w-48 w-auto h-12 p-2 bg-gray-800 hover:bg-gray-600 cursor-pointer`} onClick={() => setEditMode(false)}>
								Cancel
							</Button>
						</div>
					</form>

				</Form>

				<div className='flex flex-col justify-center items-start h-full w-1/3 gap-2'>
					<div className='flex flex-col justify-center items-center h-64 p-4 gap-4 shadow shadow-gray-600'>
						<h1 className='text-2xl font-medium text-black text-center w-full'>Reset Password</h1>
						<hr className='w-full shadow-2xl' />
						<p className='text-black text-start text-xl font-light w-full'>You can request to change your password by clicking the button below that will be sent through email.</p>
						<Button className={'flex w-full h-12 p-2 bg-sky-700 hover:bg-sky-400 cursor-pointer'}>
							Reset
						</Button>
					</div>
					<div className='flex flex-col justify-center items-center h-64 p-4 gap-4 shadow shadow-gray-600'>
						<h1 className='text-2xl font-medium text-black text-center w-full'>Close Account</h1>
						<hr className='w-full shadow-2xl' />
						<p className='text-black text-start text-xl font-light w-full'>You can request to change your password by clicking the button below that will be sent through email.</p>
						<Button className={'flex w-full h-12 p-2 bg-secondary hover:bg-secondary-foreground cursor-pointer'}>
							Reset
						</Button>
					</div>
				</div>
			</section>
		</section>
	)
}

export default Account