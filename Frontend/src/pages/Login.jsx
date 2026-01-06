import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminLogin } from "@/schema/adminAccount";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useUser } from "@/contexts/UserContext";

export function Login() {
  const [showPass, setShowPass] = useState(false);
  const [loginMessage, setLoginMessage] = useState(null);
  const [loginError, setLoginError] = useState(null);
  const { login } = useUser();
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(adminLogin),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values) {
    try {
      setLoginError(null);
      setLoginMessage(null);
      const formData = values;

      const response = await axios.post(
        "http://localhost:3000/staff/signin",
        formData
      );
      if (!response.data.ok) {
        setLoginError(response.data.error || "Login failed");
        return;
      }
      setLoginMessage("Login successful!");
      login(response.data.staff);
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      setLoginError(error.message || "An error occurred");
      console.error(error.message || error);
    }
  }

  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2">
      {/* left */}
      <div className="hidden lg:flex flex-col justify-center items-center relative h-full">
        <div className="absolute inset-0 bg-zinc-900" />
        <img src="/login-bg.jpg" className="absolute inset-0 h-full w-full object-cover" />
      </div>

      {/* right */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[380px]">
          
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              SIGN IN
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 ">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="name@example.com"
                          className="h-10 focus-visible:ring-1 focus-visible:ring-[#CD5C08] focus-visible:border-[#CD5C08]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type={showPass ? "text" : "password"}
                          placeholder="Enter your password"
                          className="h-10 focus-visible:ring-1 focus-visible:ring-[#CD5C08] focus-visible:border-[#CD5C08]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showPassword"
                  onCheckedChange={(checked) => setShowPass(checked)}
                  className="border-[#CD5C08] data-[state=checked]:bg-[#CD5C08] data-[state=checked]:text-white cursor-pointer"
                />
                <Label
                  htmlFor="showPassword"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Show Password
                </Label>
              </div>

                <Button
                  type="button"
                  variant="link"
                  asChild
                  className="px-0 font-normal text-sm text-[#CD5C08]"
                >
                  <Link to="/password-reset">Forgot password?</Link>
                </Button>
              </div>

              <Button type="submit" className="w-full font-semibold bg-[#CD5C08] text-white hover:bg-[#A34906] cursor-pointer">
                Sign In
              </Button>

              {/* error & success */}
              {loginError && (
                <div className="p-3 bg-destructive/15 border border-destructive/50 rounded-md text-destructive text-sm text-center">
                  {loginError}
                </div>
              )}
              {loginMessage && (
                <div className="p-3 bg-green-500/15 border border-green-500/50 rounded-md text-green-700 text-sm text-center">
                  {loginMessage}
                </div>
              )}

              {/* divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* google */}
              <Button variant="outline" type="button" className="w-full bg-[#FFF5E4] border-2 border-[#CD5C08] cursor-pointer hover:bg-[#CD5C08] hover:text-white">
                <svg
                  className="mr-2 h-4 w-4"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
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
                Google
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default Login;