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
import Header from "@/components/partials/header";

import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminLogin } from "@/schema/adminAccount";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useUser } from "@/contexts/UserContext";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

export function Login() {
  const [showPass, setShowPass] = useState(false);
  const [mfaMessage, setMfaMessage] = useState(null);
  const [loginError, setLoginError] = useState(null);
  const { login } = useUser();
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(adminLogin),
    mode: "onChange", // Enable real-time validation
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values) {
    try {
      setLoginError(null);
      setMfaMessage(null);
      const formData = values;

      const response = await axios.post(
        "http://localhost:3000/staff/signin",
        formData
      );
      if (!response.data.ok) {
        setLoginError(response.data.error || "Login failed");
        return;
      }

      // Check if MFA is required
      if (response.data.requiresMFA) {
        setMfaMessage("Go to your email to verify your login with MFA.");
        return;
      }

      login(response.data.staff);
      navigate("/dashboard");
    } catch (error) {
      setLoginError(error.message || "An error occurred");
      console.error(error.message || error);
    }
  }

  async function handleGoogleLogin(credentialResponse) {
    try {
      setLoginError(null);
      setMfaMessage(null);

      const response = await axios.post(
        "http://localhost:3000/staff/google-signin",
        { credential: credentialResponse.credential }
      );

      if (!response.data.ok) {
        setLoginError(response.data.error || "Google sign-in failed");
        return;
      }

      login(response.data.staff);
      navigate("/dashboard");
    } catch (error) {
      setLoginError(
        error.response?.data?.message || error.message || "An error occurred"
      );
      console.error(error);
    }
  }

  function handleGoogleError() {
    setLoginError("Google sign-in failed. Please try again.");
  }

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Header />
      {mfaMessage ? (
        // MFA Verification Message Screen
        <div className="w-full h-[calc(100vh-48px)] flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                Verify Your Login
              </h1>
              <p className="text-gray-600 mb-8 text-lg font-semibold">
                {mfaMessage}
              </p>
              <Button
                onClick={() => {
                  setMfaMessage(null);
                  setLoginError(null);
                }}
                className="w-full bg-[] text-white hover:bg-[#A34906] font-semibold"
              >
                Back to Login
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // Normal Login Screen
        <div className="w-full h-[calc(100vh-48px)] lg:grid lg:grid-cols-2">
          {/* left */}
          <div className="hidden lg:flex flex-col justify-center items-center relative h-full">
            <div className="absolute inset-0 bg-zinc-900" />
            <img
              src="/login-bg.jpg"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>

          {/* right */}
          <div className="flex items-center justify-center py-12 px-4 sm:px-8">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[380px]">
              <div className="flex flex-col space-y-2 text-center text-[#4F6F52]">
                <h1 className="text-3xl font-bold tracking-tight">SIGN IN</h1>
                <p className="text-sm text-muted-foreground">
                  Enter your email below to login to your account
                </p>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6 "
                >
                  <div className="space-y-4 text-[#4F6F52]">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="name@example.com"
                              className="h-10 focus-visible:ring-1 focus-visible:ring-[#4F6F52] focus-visible:border-[#4F6F52]"
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
                        <FormItem className="mb-1">
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPass ? "text" : "password"}
                                placeholder="Enter your password"
                                className="h-10 pr-10 focus-visible:ring-1 focus-visible:ring-[#4F6F52] focus-visible:border-[#4F6F52]"
                                {...field}
                              />

                              {/* eye */}
                              <button
                                type="button"
                                onClick={() => setShowPass((prev) => !prev)}
                                className="absolute inset-y-0 right-3 flex items-center text-[#4F6F52] hover:text-[#739072] cursor-pointer"
                                tabIndex={-1}
                              >
                                {showPass ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="-mt-7 flex justify-start">
                    <Button
                      type="button"
                      variant="link"
                      asChild
                      className="px-0 font-normal text-xs text-[#4F6F52]"
                    >
                      <Link to="/password-reset">Forgot password?</Link>
                    </Button>
                  </div>

                  <Button
                    type="submit"
                    className="w-full font-semibold bg-[#4F6F52] text-white hover:bg-[#739072] cursor-pointer"
                  >
                    Sign In
                  </Button>

                  {/* error */}
                  {loginError && (
                    <div className="p-3 bg-destructive/15 border border-destructive/50 rounded-md text-destructive text-sm text-center">
                      {loginError}
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
                  <div className="flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleLogin}
                      onError={handleGoogleError}
                      useOneTap
                      theme="outline"
                      size="large"
                      text="signin_with"
                      shape="rectangular"
                      width="100%"
                    />
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      )}
    </GoogleOAuthProvider>
  );
}

export default Login;
