import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Lock,
  Shield,
  Users,
  Smartphone,
  Mail,
  HelpCircle,
  ChevronRight,
  BookOpen,
  Zap,
  AlertCircle,
} from "lucide-react";

export default function Guide() {
  const [activeCategory, setActiveCategory] = useState("getting-started");

  const categories = [
    { id: "getting-started", label: "Getting Started", icon: BookOpen },
    { id: "account", label: "Account & Login", icon: Lock },
    { id: "security", label: "Security & MFA", icon: Shield },
    { id: "troubleshooting", label: "Troubleshooting", icon: AlertCircle },
  ];

  const guides = {
    "getting-started": [
      {
        title: "First Steps",
        description: "Learn how to get started with NutriBin",
        content: [
          "Visit the NutriBin login page",
          "Sign in with your corporate email and password",
          "Complete multi-factor authentication if prompted",
          "Welcome to your dashboard!",
        ],
      },
      {
        title: "Dashboard Overview",
        description: "Understand the main dashboard features",
        content: [
          "Navigation menu on the left side",
          "Dashboard widgets showing key metrics",
          "Quick access buttons for common tasks",
          "Settings and profile in the top right",
        ],
      },
    ],
    account: [
      {
        title: "Account Access",
        description: "Sign in using your corporate credentials",
        content: [
          "Use your corporate email address",
          "Enter your assigned password",
          "Complete MFA verification if enabled",
          "Session expires after 30 minutes of inactivity",
        ],
      },
      {
        title: "Password Reset",
        description: "How to reset your forgotten password",
        content: [
          "Click 'Forgot Password' on the login page",
          "Enter your email address",
          "Check your email for reset instructions",
          "Follow the link and create a new password",
          "Log in with your new password",
        ],
      },
      {
        title: "Update Profile",
        description: "Manage your account information",
        content: [
          "Go to Settings > Account",
          "Update your contact information",
          "Add or change your profile photo",
          "Update your phone number and address",
          "Click Save to confirm changes",
        ],
      },
    ],
    security: [
      {
        title: "Multi-Factor Authentication (MFA)",
        description: "Secure your account with MFA",
        content: [
          "Navigate to Settings > Security",
          "Choose your preferred MFA method (SMS or Authenticator)",
          "Follow the setup instructions",
          "Save backup codes in a safe place",
          "Test your MFA setup before logging out",
        ],
      },
      {
        title: "Backup Codes",
        description: "Use backup codes when you lose access to your MFA device",
        content: [
          "Backup codes are generated when you enable MFA",
          "Store them in a secure location",
          "Each code can only be used once",
          "You can regenerate new codes in Settings",
          "Contact support if all codes are used",
        ],
      },
      {
        title: "Session Security",
        description: "Keep your sessions secure",
        content: [
          "Never share your password with anyone",
          "Log out when using shared computers",
          "Your session expires after 30 minutes of inactivity",
          "View active sessions in Settings > Security",
          "Terminate suspicious sessions immediately",
        ],
      },
    ],
    troubleshooting: [
      {
        title: "Cannot Log In",
        description: "Troubleshoot login issues",
        content: [
          "Verify your email address is correct",
          "Double-check your password (case-sensitive)",
          "Clear your browser cache and cookies",
          "Try a different browser",
          "Check if your account is active with your administrator",
        ],
      },
      {
        title: "Lost MFA Device",
        description: "Recover access if you lost your MFA device",
        content: [
          "Use your backup codes to log in",
          "Go to Settings > Security",
          "Disable and re-enable MFA",
          "Set up a new MFA method",
          "Contact support if you have no backup codes",
        ],
      },
      {
        title: "Technical Issues",
        description: "Resolve common technical problems",
        content: [
          "Try refreshing the page (F5)",
          "Clear browser cache and storage",
          "Disable browser extensions temporarily",
          "Update to the latest browser version",
          "Contact support with error messages",
        ],
      },
    ],
  };

  const quickTips = [
    {
      icon: Lock,
      title: "Strong Passwords",
      description: "Use passwords with 12+ characters, numbers, and symbols",
    },
    {
      icon: Shield,
      title: "Enable MFA",
      description: "Add an extra layer of security to your account",
    },
    {
      icon: Mail,
      title: "Check Email",
      description: "Important notifications are sent to your registered email",
    },
    {
      icon: Smartphone,
      title: "Keep Device Updated",
      description: "Update your browser and operating system regularly",
    },
  ];

  return (
    <div className="w-full bg-[#ECE3CE]/10 min-h-screen pb-10">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#4F6F52] to-[#3A4D39] text-white py-12 md:py-16">
        <div className="px-4 md:px-8 max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-8 w-8" />
            <h1 className="text-4xl md:text-5xl font-bold">Help Center</h1>
          </div>
          <p className="text-lg text-green-100 max-w-2xl">
            Find answers to common questions and learn how to get the most out
            of NutriBin
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 md:px-8 pt-12 pb-10 max-w-6xl mx-auto">
        {/* Quick Tips */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-[#3A4D39] mb-6">Quick Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickTips.map((tip, idx) => {
              const IconComponent = tip.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <IconComponent className="h-5 w-5 text-[#4F6F52]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#3A4D39] mb-1">
                        {tip.title}
                      </h3>
                      <p className="text-xs text-gray-600">{tip.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const IconComponent = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    activeCategory === cat.id
                      ? "bg-[#4F6F52] text-white"
                      : "bg-white text-[#4F6F52] border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {guides[activeCategory].map((guide, idx) => (
            <Card
              key={idx}
              className="rounded-xl hover:shadow-lg transition-shadow"
            >
              <CardHeader className="bg-gradient-to-r from-[#4F6F52]/5 to-transparent border-b border-gray-100">
                <CardTitle className="text-lg text-[#3A4D39]">
                  {guide.title}
                </CardTitle>
                <p className="text-sm text-gray-600 font-normal mt-1">
                  {guide.description}
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <ol className="space-y-3">
                  {guide.content.map((step, stepIdx) => (
                    <li
                      key={stepIdx}
                      className="flex gap-3 text-sm text-gray-700"
                    >
                      <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-[#4F6F52]/10 text-[#4F6F52] font-semibold text-xs">
                        {stepIdx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQs Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-[#3A4D39] mb-6">
            Frequently Asked Questions
          </h2>
          <Card className="rounded-xl">
            <CardContent className="p-0">
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger value="item-1">
                    How do I change my password?
                  </AccordionTrigger>
                  <AccordionContent value="item-1">
                    Go to Settings → Account → Password and follow the
                    verification steps. You'll need to enter your current
                    password before setting a new one.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger value="item-2">
                    What happens if I forget my password?
                  </AccordionTrigger>
                  <AccordionContent value="item-2">
                    Click "Forgot Password" on the login page and follow the
                    email instructions to reset your password. Make sure to
                    check your spam folder if you don't receive the email.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger value="item-3">
                    Is my account secure?
                  </AccordionTrigger>
                  <AccordionContent value="item-3">
                    We take security seriously. Enable MFA in your settings for
                    additional protection. Never share your password with
                    anyone, and always log out when using shared devices.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger value="item-4">
                    How do I enable two-factor authentication?
                  </AccordionTrigger>
                  <AccordionContent value="item-4">
                    Navigate to Settings → Security → Multi-Factor
                    Authentication and choose your preferred method (SMS or
                    Authenticator App). Follow the setup instructions and save
                    your backup codes.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger value="item-5">
                    What should I do if I lose access to my MFA device?
                  </AccordionTrigger>
                  <AccordionContent value="item-5">
                    Use one of your backup codes to log in. Once logged in, go
                    to Settings → Security and disable MFA. Then set up a new
                    MFA method. If you've used all backup codes, contact
                    support.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger value="item-6">
                    How can I contact support?
                  </AccordionTrigger>
                  <AccordionContent value="item-6">
                    You can reach our support team via email at
                    support@nutribin.com or use the contact form at the bottom
                    of this page. Please provide as much detail as possible
                    about your issue.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Contact Support Card */}
        <Card className="rounded-xl border-2 border-[#4F6F52] bg-gradient-to-r from-[#4F6F52]/5 to-transparent">
          <CardContent className="p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <HelpCircle className="h-6 w-6 text-[#4F6F52]" />
                <h2 className="text-2xl font-bold text-[#3A4D39]">
                  Can't Find an Answer?
                </h2>
              </div>
              <p className="text-gray-700 max-w-md">
                Our support team is here to help. Reach out with any questions
                or issues you're experiencing.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <a
                href="mailto:support@nutribin.com"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#4F6F52] hover:bg-[#3A4D39] text-white rounded-lg font-semibold transition-colors"
              >
                <Mail className="h-5 w-5" />
                Email Support
              </a>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
