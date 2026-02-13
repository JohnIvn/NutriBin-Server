import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { adminAccount } from "@/schema/adminAccount";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useUser } from "@/contexts/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function Account() {
  const [editMode, setEditMode] = useState(false);
  const { user } = useUser();

  const getInitials = (first, last) =>
    `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase();

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
  });

  const handleSubmission = () => {
    //TODO Edit User Account Details
    setEditMode(false);
  };

  return (
    <section className="flex flex-col min-h-full h-auto w-full max-w-7xl m-auto justify-start items-center p-4 sm:p-6 gap-6">
      <section className="flex flex-col lg:flex-row w-full h-full gap-6 items-start">
        <Form {...form}>
          <form className="w-full lg:flex-1 space-y-6 bg-white border border-gray-100 shadow-lg shadow-gray-200 rounded-lg p-6 sm:p-8">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">
                Account Settings
              </h1>
              <p className="text-sm text-gray-500">
                Manage your personal information and contact details.
              </p>
            </div>

            <div className="flex items-center gap-4 pt-3">
              <Avatar className="size-16 border border-gray-200">
                <AvatarImage
                  src={
                    user?.avatar ||
                    user?.profile_photo ||
                    user?.profile_image ||
                    user?.photo ||
                    ""
                  }
                  alt={user?.first_name}
                />
                <AvatarFallback className="bg-[#4F6F52]/10 text-[#4F6F52] font-bold text-xl">
                  {getInitials(user?.first_name, user?.last_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-bold text-[#3A4D39]">
                  {user?.first_name} {user?.last_name}
                </div>
                <div className="text-[12px] text-gray-500">{user?.email}</div>
              </div>
            </div>

            <hr className="border-gray-100" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={!editMode}
                        placeholder="First Name"
                        className="h-11 focus-visible:ring-1 focus-visible:ring-[#4F6F52] focus-visible:border-[#4F6F52]"
                      />
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
                      <Input
                        {...field}
                        disabled={!editMode}
                        placeholder="Last Name"
                        className="h-11 focus-visible:ring-1 focus-visible:ring-[#4F6F52] focus-visible:border-[#4F6F52]"
                      />
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
                    <Input
                      {...field}
                      disabled={!editMode}
                      placeholder="Complete Address"
                      className="h-11 focus-visible:ring-1 focus-visible:ring-[#4F6F52] focus-visible:border-[#4F6F52]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        disabled={!editMode}
                        className="h-11 focus-visible:ring-1 focus-visible:ring-[#4F6F52] focus-visible:border-[#4F6F52]"
                      />
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
                      <Input
                        type="number"
                        {...field}
                        disabled={!editMode}
                        className="h-11 focus-visible:ring-1 focus-visible:ring-[#4F6F52] focus-visible:border-[#4F6F52]"
                      />
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
                <FormItem className="space-y-3">
                  <FormLabel>Gender</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="flex gap-6"
                      disabled={!editMode}
                    >
                      {/* radio buttons */}
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem
                            value="male"
                            className="border-gray-300 data-[state=checked]:border-[#4F6F52] data-[state=checked]:text-[#4F6F52] cursor-pointer"
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          Male
                        </FormLabel>
                      </FormItem>

                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem
                            value="female"
                            className="border-gray-300 data-[state=checked]:border-[#4F6F52] data-[state=checked]:text-[#4F6F52] cursor-pointer"
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          Female
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex flex-wrap gap-4 pt-4">
              <Button
                type="button"
                className={`${editMode ? "hidden" : "inline-flex"} min-w-[140px] h-11 bg-[#4F6F52] hover:bg-[#3A4335] text-white cursor-pointer`}
                onClick={() => setEditMode(true)}
              >
                Edit Profile
              </Button>
              <Button
                type="submit"
                className={`${editMode ? "inline-flex" : "hidden"} min-w-[140px] h-11 bg-[#1CE01C] hover:bg-[#13B013] text-white cursor-pointer`}
                onClick={() => handleSubmission()}
              >
                Save Changes
              </Button>
              <Button
                type="button"
                variant="outline"
                className={`${editMode ? "inline-flex" : "hidden"} min-w-[140px] h-11 bg-[#D73E18] text-white hover:bg-[#B62E0B] cursor-pointer hover:text-white`}
                onClick={() => setEditMode(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>

        {/* right side cards */}
        <div className="flex flex-col w-full lg:w-80 gap-6">
          <div className="flex flex-col justify-center items-center h-auto p-6 gap-4 bg-white border border-gray-100 shadow-lg shadow-gray-200 rounded-lg">
            <h1 className="text-lg font-bold tracking-tight text-black text-center w-full">
              Reset Password
            </h1>
            <hr className="w-full border-gray-100" />
            <p className="text-gray-500 text-center text-sm leading-relaxed w-full">
              Request a password change link sent to your registered email
              address.
            </p>
            <Button className="w-full h-10 bg-sky-700 hover:bg-sky-800 cursor-pointer">
              Reset
            </Button>
          </div>

          <div className="flex flex-col justify-center items-center h-auto p-6 gap-4 bg-white border border-gray-100 shadow-lg shadow-gray-200 rounded-lg">
            <h1 className="text-lg font-bold tracking-tight text-black text-center w-full">
              Close Account
            </h1>
            <hr className="w-full border-gray-100" />
            <p className="text-gray-500 text-center text-sm leading-relaxed w-full">
              Permanently delete your account. This action cannot be undone.
            </p>
            <Button
              variant="destructive"
              className="w-full h-10 cursor-pointer"
            >
              Close
            </Button>
          </div>
        </div>
      </section>
    </section>
  );
}

export default Account;
