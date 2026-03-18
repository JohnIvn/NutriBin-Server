import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Search,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  FileText,
  Video,
} from "lucide-react";

export default function Guide() {
  const [activeCategory, setActiveCategory] = useState("getting-started");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      id: "getting-started",
      label: "Getting Started",
      icon: BookOpen,
      description:
        "Fundamental concepts and initial setup of your NutriBin account.",
    },
    {
      id: "account",
      label: "Account & Login",
      icon: Lock,
      description:
        "Manage your credentials, profile information, and login sessions.",
    },
    {
      id: "security",
      label: "Security & MFA",
      icon: Shield,
      description:
        "Enhance your account safety with multi-factor authentication.",
    },
    {
      id: "troubleshooting",
      label: "Troubleshooting",
      icon: AlertCircle,
      description: "Solutions for common technical issues and access problems.",
    },
  ];

  const guides = {
    "getting-started": [
      {
        title: "First Steps",
        description: "Learn how to get started with NutriBin",
        icon: Zap,
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
        icon: FileText,
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
        icon: Users,
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
        icon: Lock,
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
        icon: Users,
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
        icon: Shield,
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
        icon: Shield,
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
        icon: Lock,
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
        icon: AlertCircle,
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
        icon: HelpCircle,
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
        icon: AlertCircle,
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
    <div className="w-full bg-[#ECE3CE]/20 min-h-screen pb-20 font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#3A4D39] text-white py-20 px-6">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-[#4F6F52] rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-[#4F6F52] rounded-full blur-3xl opacity-20"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4F6F52]/30 text-[#ECE3CE] border border-[#4F6F52] mb-6 shadow-sm backdrop-blur-sm">
              <BookOpen className="h-4 w-4" />
              <span className="text-sm font-medium">
                NutriBin Documentation
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
              Help <span className="text-[#A9B388]">Center</span>
            </h1>
            <p className="text-xl text-[#ECE3CE]/80 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              Find answers, troubleshoot issues, and learn how to manage your
              composting ecosystem effectively.
            </p>

            <div className="max-w-2xl mx-auto relative group">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#4F6F52] transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search for guides, troubleshooting, or keywords..."
                className="w-full bg-white text-[#3A4D39] pl-14 pr-6 py-4 rounded-2xl border-none shadow-xl focus:ring-4 focus:ring-[#4F6F52]/20 transition-all text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-6 -mt-10 max-w-6xl mx-auto relative z-20">
        {/* Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex flex-col text-left p-6 rounded-3xl transition-all duration-300 ${
                  isActive
                    ? "bg-white shadow-2xl scale-105 border-b-4 border-[#4F6F52]"
                    : "bg-white/80 hover:bg-white shadow-lg hover:shadow-xl border-b-4 border-transparent"
                }`}
              >
                <div
                  className={`p-3 rounded-2xl mb-4 w-fit ${isActive ? "bg-[#4F6F52] text-white" : "bg-[#ECE3CE]/50 text-[#4F6F52]"}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3
                  className={`font-bold text-xl mb-2 ${isActive ? "text-[#3A4D39]" : "text-[#4F6F52]"}`}
                >
                  {cat.label}
                </h3>
                <p className="text-sm text-gray-500 leading-snug">
                  {cat.description}
                </p>
              </motion.button>
            );
          })}
        </div>

        {/* Dynamic Content Area */}
        <div className="flex flex-col lg:flex-row gap-10 mb-20">
          {/* Sidebar Tips */}
          <div className="lg:w-1/3">
            <div className="sticky top-10">
              <h2 className="text-2xl font-black text-[#3A4D39] mb-6 flex items-center gap-2">
                <Zap className="h-6 w-6 text-[#A9B388]" />
                Pro Tips
              </h2>
              <div className="space-y-4">
                {quickTips.map((tip, idx) => {
                  const Icon = tip.icon;
                  return (
                    <motion.div
                      key={idx}
                      whileHover={{ x: 5 }}
                      className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-start"
                    >
                      <div className="p-2 bg-[#ECE3CE]/30 rounded-lg text-[#4F6F52]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#3A4D39] mb-1">
                          {tip.title}
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {tip.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Learning Card */}
              <div className="mt-10 p-6 rounded-3xl bg-[#4F6F52] text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-24 h-24 bg-[#3A4D39] rounded-full opacity-50 transition-transform group-hover:scale-150 duration-500"></div>
                <h3 className="text-xl font-bold mb-3 relative z-10">
                  Video Tutorials
                </h3>
                <p className="text-sm text-[#ECE3CE] mb-6 relative z-10">
                  Prefer watching over reading? Check our YouTube channel for
                  visual guides.
                </p>
                <Button className="w-full bg-[#ECE3CE] text-[#3A4D39] hover:bg-white rounded-xl font-bold gap-2">
                  <Video className="h-4 w-4" />
                  Watch Channel
                </Button>
              </div>
            </div>
          </div>

          {/* Guides Content */}
          <div className="lg:w-2/3">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-[#3A4D39]">
                {categories.find((c) => c.id === activeCategory)?.label}
              </h2>
              <span className="text-sm font-bold text-[#4F6F52] bg-[#4F6F52]/10 px-3 py-1 rounded-full">
                {guides[activeCategory].length} Articles
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {guides[activeCategory].map((guide, idx) => {
                    const GuideIcon = guide.icon || FileText;
                    return (
                      <Card
                        key={idx}
                        className="group rounded-3xl border-none shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white"
                      >
                        <CardHeader className="bg-gradient-to-br from-gray-50 to-white pb-2 flex flex-row items-center gap-4">
                          <div className="p-3 bg-[#4F6F52]/5 rounded-2xl text-[#4F6F52] group-hover:bg-[#4F6F52] group-hover:text-white transition-colors">
                            <GuideIcon className="h-6 w-6" />
                          </div>
                          <div>
                            <CardTitle className="text-xl font-black text-[#3A4D39] mb-1">
                              {guide.title}
                            </CardTitle>
                            <p className="text-sm font-medium text-gray-400">
                              {guide.description}
                            </p>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                          <ul className="space-y-4">
                            {guide.content.map((step, stepIdx) => (
                              <li
                                key={stepIdx}
                                className="flex gap-4 items-start group/item"
                              >
                                <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-xl bg-[#ECE3CE]/40 text-[#4F6F52] font-black group-hover/item:bg-[#4F6F52] group-hover/item:text-white transition-all text-sm">
                                  {stepIdx + 1}
                                </div>
                                <span className="text-[15px] font-medium text-gray-700 leading-relaxed pt-1">
                                  {step}
                                </span>
                              </li>
                            ))}
                          </ul>

                          <div className="mt-8 pt-6 border-t border-gray-50 flex justify-end">
                            <button className="text-[#4F6F52] font-bold text-sm flex items-center gap-1 group/btn">
                              Was this helpful?
                              <span className="ml-2 px-3 py-1 bg-gray-50 rounded-lg hover:bg-[#4F6F52]/10 transition-colors">
                                Yes
                              </span>
                              <span className="px-3 py-1 bg-gray-50 rounded-lg hover:bg-red-50 transition-colors">
                                No
                              </span>
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Enhanced FAQ Section */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-[#3A4D39] mb-4">
              Common Questions
            </h2>
            <p className="text-gray-500 font-medium">
              Everything else you might need to know.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                q: "How do I change my password?",
                a: "Go to Settings → Account → Password and follow the verification steps. You'll need to enter your current password before setting a new one.",
              },
              {
                q: "What happens if I forget my password?",
                a: "Click 'Forgot Password' on the login page and follow the email instructions to reset your password.",
              },
              {
                q: "How do I enable MFA?",
                a: "Navigate to Settings → Security → Multi-Factor Authentication and choose your preferred method (SMS or Authenticator App).",
              },
              {
                q: "Lost MFA access?",
                a: "Use one of your backup codes to log in, then reset your MFA settings in the Security panel.",
              },
            ].map((faq, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-3xl shadow-lg border border-[#ECE3CE]/50"
              >
                <h3 className="font-black text-[#3A4D39] text-lg mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#A9B388]"></div>
                  {faq.q}
                </h3>
                <p className="text-[#739072] font-medium text-sm leading-relaxed">
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Modern Support CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-[40px] bg-[#3A4D39] p-1 md:p-12 relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#4F6F52] rounded-full blur-[100px] -mr-32 -mt-32 opacity-30"></div>

          <div className="relative z-10 bg-[#3A4D39] rounded-[36px] p-8 md:p-12 border border-[#4F6F52]/50 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="text-center md:text-left">
              <div className="flex justify-center md:justify-start items-center gap-3 mb-4">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white">
                  Need more help?
                </h2>
              </div>
              <p className="text-[#ECE3CE]/80 text-lg font-medium max-w-xl mb-0">
                Our support experts are usually available 24/7. Whether it's a
                bug, account issue, or just a question, we've got your back.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <Button
                asChild
                className="bg-[#4F6F52] hover:bg-[#A9B388] text-white px-8 py-7 rounded-2xl font-black text-lg transition-all shadow-xl hover:scale-105"
              >
                <a
                  href="mailto:support@nutribin.com"
                  className="flex items-center gap-2"
                >
                  <Mail className="h-6 w-6" />
                  Email Support
                </a>
              </Button>
              <Button
                variant="outline"
                className="border-2 border-white/20 hover:border-white text-white bg-transparent px-8 py-7 rounded-2xl font-black text-lg backdrop-blur-md"
              >
                <span className="flex items-center gap-2">Live Chat</span>
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer link back */}
      <div className="mt-20 text-center">
        <p className="text-[#739072] font-bold flex items-center justify-center gap-2">
          NutriBin Cloud Services <ArrowRight className="h-4 w-4" />
          <span className="text-[#3A4D39]">Help Center v2.4</span>
        </p>
      </div>
    </div>
  );
}
