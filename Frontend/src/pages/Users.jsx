import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { userFilter } from "@/schema/users"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { MoreHorizontalIcon } from "lucide-react"

function UserManagement() {

	const filterForm = useForm({
		resolver: zodResolver(userFilter),
		defaultValues: {
			count: "10",
			term: "",
		},
	});
	const entriesCount = parseInt(filterForm.watch("count") || "10");

	function filterSubmit() {
		console.log("Filtration")
	}

	return (
		<section className='flex flex-col min-h-screen h-auto mb-4'>
			<h1 className='text-3xl md:text-5xl font-medium my-4 text-center'>User Management</h1>
			<Table className={'flex flex-col h-auto w-auto xl:w-5xl border-2'}>
				<TableCaption>
					<Form {...filterForm}>
						<form onSubmit={filterForm.handleSubmit(filterSubmit)} className="flex justify-between items-center gap-4 px-2">
							<div className="flex items-center justify-center gap-2">
								<p className="font-medium text-xs md:text-sm">Show</p>

								<FormField
									control={filterForm.control}
									name="count"
									render={({ field }) => (
										<FormItem>
											<Select onValueChange={field.onChange} defaultValue={field.value.toString()} >
												<FormControl>
													<SelectTrigger className="w-auto text-xs md:text-sm">
														<SelectValue placeholder="Select count" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectGroup>
														<SelectLabel>Entries</SelectLabel>
														<SelectItem value="10">10</SelectItem>
														<SelectItem value="15">15</SelectItem>
														<SelectItem value="20">20</SelectItem>
														<SelectItem value="25">25</SelectItem>
														<SelectItem value="30">30</SelectItem>
													</SelectGroup>
												</SelectContent>
											</Select>
										</FormItem>
									)}
								/>

								<p className="font-medium text-xs md:text-sm">Entries</p>
								<FormField
									control={filterForm.control}
									name="term"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Input placeholder="Search" className={'border border-secondary-foreground w-auto md:w-lg'} {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<Button className={'bg-secondary hover:bg-secondary-foreground cursor-pointer'}>
								+ 
								<span className="hidden md:flex">
									Add User
								</span>
							</Button>
						</form>
					</Form>
				</TableCaption>
				<TableHeader>
					<TableRow className={'flex items-center'}>
						<TableHead className="flex flex-1 h-10 items-center text-xs md:text-sm">Employee ID</TableHead>
						<TableHead className="flex flex-1 h-10 items-center text-xs md:text-sm">First Name</TableHead>
						<TableHead className="flex flex-1 h-10 items-center text-xs md:text-sm">Last Name</TableHead>
						<TableHead className="flex flex-1 h-10 items-center text-xs md:text-sm">Created At</TableHead>
						<TableHead className="flex flex-1 h-10 items-center text-xs md:text-sm">Status</TableHead>
						<TableHead className="flex flex-1 h-10 items-center text-xs md:text-sm">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{Array.from({ length: entriesCount }).map(() => (
						<TableRow className={'flex items-center'}>
							<TableCell className="flex flex-1 h-10 items-center text-xs md:text-sm" >EM3211</TableCell>
							<TableCell className="flex flex-1 h-10 items-center text-xs md:text-sm" >John</TableCell>
							<TableCell className="flex flex-1 h-10 items-center text-xs md:text-sm" >Joseph</TableCell>
							<TableCell className="flex flex-1 h-10 items-center text-xs md:text-sm" >12-12-2023</TableCell>
							<TableCell className="flex flex-1 h-10 items-center text-xs md:text-sm" ><p className="bg-green-100 px-3 py-1 text-green-800 rounded-sm">Active</p></TableCell>
							<TableCell className="flex flex-1 h-10 items-center text-xs md:text-sm" >
								<DropdownMenu modal={false}>
									<DropdownMenuTrigger asChild>
										<Button className={'text-white'} variant="outline" aria-label="Open menu" size="icon-sm">
											<MoreHorizontalIcon />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent className="w-40" align="end">
										<DropdownMenuLabel>Actions</DropdownMenuLabel>
										<DropdownMenuGroup>
											<DropdownMenuItem>Update</DropdownMenuItem>
											<DropdownMenuItem>Delete</DropdownMenuItem>
											<DropdownMenuItem>Edit</DropdownMenuItem>
											<DropdownMenuItem>Disable</DropdownMenuItem>
										</DropdownMenuGroup>
									</DropdownMenuContent>
								</DropdownMenu>
								{/* TODO no dialog components/pop ups (Im not sure about the modals of ShadCn yet - Cania) */}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</section >
	)
}

export default UserManagement
