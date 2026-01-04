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
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination"
import AdminModal from "@/components/partials/adminModal"
import DialogBox from "@/components/partials/confirmBox"
import ConfirmBox from "@/components/partials/confirmBox"

function Admins() {
	const [showModal, setShowModal] = useState(false)
	const [modalMode, setModalMode] = useState('')
	const [confirmType, setConfirmType] = useState('')
	const [showConfirm, setShowConfirm] = useState(false)
	const [confirmInformation, setConfirmInformation] = useState({
		title: "",
		description: ""
	})

	const onConfirm = () => {
		// TODO
		console.log("Confirmed")
	}
	
	const role = /* Get this from context */ 'admin'

	const filterForm = useForm({
		resolver: zodResolver(userFilter),
		defaultValues: {
			count: "10",
			term: "",
		},
	});

	const displayModal = (mode) => {
		setShowModal(true),
		setModalMode(mode)
	}

	const displayConfirm = (mode, title, description) => {
		setShowConfirm(true)
		setConfirmType(mode)
		setConfirmInformation({
			title: title,
			description: description
		})
	}

	const closeModal = () => {
		setShowModal(false)
	}

	const closeConfirm = () => {
		setShowConfirm(false)
	}

	const entriesCount = parseInt(filterForm.watch("count") || "10");

	function filterSubmit() {
		console.log("Filtration")
	}

	return (
		<>
			{showModal &&
				<AdminModal mode={modalMode} cancel={closeModal}/>
			}
			{showConfirm &&
				<ConfirmBox mode={confirmType} cancel={closeConfirm} confirm={onConfirm} description={confirmInformation.description} title={confirmInformation.title} />
			}
			<section className='relative flex flex-col h-auto my-auto pb-4'>
				<h1 className='text-3xl md:text-5xl font-medium my-4 text-center'>Admin Management</h1>
				<Table className={'flex flex-col h-auto w-auto xl:w-5xl border-2'}>
					<TableCaption className={'flex w-full justify-between px-2'}>
						<Form {...filterForm}>
							<form onSubmit={filterForm.handleSubmit(filterSubmit)} className="flex justify-between items-center gap-4">
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
							</form>
						</Form>
						<Button onClick={() => displayModal('default')} className={'bg-secondary hover:bg-secondary-foreground cursor-pointer'}>
							+
							<span className="hidden md:flex">
								Add User
							</span>
						</Button>
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
												{role === 'admin' &&
													<DropdownMenuItem onClick={() => displayModal('edit')}>Edit</DropdownMenuItem>
												}
												<DropdownMenuItem onClick={() => displayConfirm(
													'Disable',
													'Disabling Account',
													"Disabled account won't be able to access any admin privileges! Are you sure you want to disable this account?"

												)}>Disable</DropdownMenuItem>
												<DropdownMenuItem onClick={() => displayConfirm(
													"Delete",
													'Account Deletion',
													"This will permanently delete the account! Are you sure you want to delete this account?"

												)}>Delete</DropdownMenuItem>
											</DropdownMenuGroup>
										</DropdownMenuContent>
									</DropdownMenu>
									{/* TODO no dialog components/pop ups (Im not sure about the modals of ShadCn yet - Cania) */}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
					<Pagination>
						<PaginationContent>
							<PaginationItem>
								<PaginationPrevious href="#" />
							</PaginationItem>
							<PaginationItem>
								<PaginationLink href="#">1</PaginationLink>
							</PaginationItem>
							<PaginationItem>
								<PaginationLink href="#" isActive>
									2
								</PaginationLink>
							</PaginationItem>
							<PaginationItem>
								<PaginationLink href="#">3</PaginationLink>
							</PaginationItem>
							<PaginationItem>
								<PaginationEllipsis />
							</PaginationItem>
							<PaginationItem>
								<PaginationNext href="#" />
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				</Table>
			</section >
		</>
	)
}

export default Admins
