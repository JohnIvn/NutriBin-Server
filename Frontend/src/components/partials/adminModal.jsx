import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { useEffect, useState } from "react"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { adminAccount } from "@/schema/adminAccount"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "../ui/form"
import { Checkbox } from "../ui/checkbox"
import { Link } from "react-router-dom"



function AdminModal({ mode, cancel }) {
	const [showPass, setShowPass] = useState(false)
	const [user, setUser] = useState({})

	const form = useForm({
		resolver: zodResolver(adminAccount),
		defaultValues: {
			firstname: "",
			lastname: "",
			age: 0,
			contact: '',
			gender: ''
		}
	})

	const displayPassword = (state) => {
		setShowPass(state)
	}

	const setUserData = (data) => {
		setUser(data)
	}

	// Temporary
	useEffect(() => {
		if (mode === "edit") {
			setUserData({
				firstname: "Matthew",
				lastname: "Cania",
				age: 20,
				address: 'Kiko Camarin',
				contact: "+639672194525",
				gender: "male",
			})

			form.reset({
				firstname: "Matthew",
				lastname: "Cania",
				age: 20,
				address: "Kiko Camarin",
				contact: "+639672194525",
				gender: "male",
			})
		}
	}, [mode])

	return (
		<div className="flex justify-center items-center w-screen h-screen  fixed z-10 backdrop-blur-md">
			<Card className="w-full max-w-lg">
				<CardHeader>
					<CardTitle>
						{mode === 'edit' ? `Edit User ${user.firstname}` : 'Create new admin account'}
					</CardTitle>
					<CardDescription>
						{mode === 'edit' ? 'Edit the admin account information' : 'Create a new account for the admin management'}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form>
							<div className="flex flex-col gap-2">
								<div className="grid grid-cols-2 gap-2">
									<FormField
										control={form.control}
										name="firstname"
										render={({ field }) => (
											<FormItem>
												<FormLabel>First Name</FormLabel>
												<FormControl>
													<Input placeholder="John" className={'border border-secondary-foreground'} {...field} />
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
													<Input placeholder="Doe" className={'border border-secondary-foreground'} {...field} />
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
												<Input placeholder="Phase X Brgy XXX Place City" className={'border border-secondary-foreground'} {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<div className="grid grid-cols-2 gap-2">
									<FormField
										control={form.control}
										name="age"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Age</FormLabel>
												<FormControl>
													<Input placeholder="18+ years old" className={'border border-secondary-foreground'} {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="contact"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Contact Number</FormLabel>
												<FormControl>
													<Input placeholder="+639****" className={'border border-secondary-foreground'} {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								{mode !== 'edit' && (
									<>
										<div className="grid grid-cols-2 gap-2">
											<FormField
												control={form.control}
												name="password"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Password</FormLabel>
														<FormControl>
															<Input type={showPass ? 'text' : 'password'} placeholder="@John1234" className={'border border-secondary-foreground'} {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={form.control}
												name="confirm password"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Confirm Password</FormLabel>
														<FormControl>
															<Input type={showPass ? 'text' : 'password'} placeholder="" className={'border border-secondary-foreground'} {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
										<div className="flex justify-between w-full">
											<div className="flex h-full justify-start items-center w-full gap-2">
												<Checkbox
													id="showPassword"
													onCheckedChange={(checked) => displayPassword(checked)}
													className="border-secondary-foreground data-[state=checked]:bg-secondary data-[state=checked]:text-secondary-foreground data-[state=checked]:border-secondary"
												/>
												<Label htmlFor="showPassword">Show Password</Label>
											</div>
										</div>
									</>

								)}

							</div>
						</form>
					</Form >
				</CardContent>
				<CardFooter className="flex-col gap-2 w-full">
					<Button type="submit" className="bg-secondary hover:bg-secondary-foreground w-full cursor-pointer">
						{mode === 'edit' ? `Confirm` : 'Create'}
					</Button>
					<Button type="button" onClick={() => cancel()} className="bg-gray-800 hover:bg-gray-600 w-full cursor-pointer">
						Cancel
					</Button>

					{
						mode !== 'edit' &&
						(
							<>
								<div className="flex justify-between items-center w-full">
									<hr className="w-1/3 border border-secondary" />
									<h1 className="font-medium">Or</h1>
									<hr className="w-1/3 border border-secondary" />
								</div>
								<Button type='button' className="bg-secondary hover:bg-secondary-foreground w-full cursor-pointer">
									<svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
										<path
											fill="currentColor"
											d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
										/>
										<path
											fill="currentColor"
											d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
										/>
										<path
											fill="currentColor"
											d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
										/>
										<path
											fill="currentColor"
											d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
										/>
									</svg>
									Sign in with Google
								</Button>
							</>
						)}
				</CardFooter>
			</Card>
		</div>
	)
}

export default AdminModal
