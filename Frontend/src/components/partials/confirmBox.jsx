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



function ConfirmBox({ mode, title, description, confirm, cancel }) {
	
	return (
		<div className="flex justify-center items-center w-screen h-screen  fixed z-10 backdrop-blur-md">
			<Card className="w-full max-w-lg">
				<CardHeader>
					<CardTitle>
						{title}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<CardDescription>
						{description}
					</CardDescription>
				</CardContent>
				<CardFooter className="flex-col gap-2 w-full">
					<Button type="button" onClick={() => confirm()} className="bg-secondary hover:bg-secondary-foreground w-full cursor-pointer">
						{mode ? mode : 'Confirm'}
					</Button>
					<Button type="button" onClick={() => cancel()} className="bg-gray-800 hover:bg-gray-600 w-full cursor-pointer">
						Cancel
					</Button>
				</CardFooter>
			</Card>
		</div>
	)
}

export default ConfirmBox
