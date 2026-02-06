"use client"

import { useState, useEffect, useSyncExternalStore } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  User, 
  Phone, 
  MapPin, 
  Users, 
  ArrowRight, 
  Activity, 
  Droplet,
  Stethoscope,
  Sun,
  Moon,
  LogOut,
  Languages,
  LayoutDashboard,
  Menu,
  Settings
} from "lucide-react"
import { useTheme } from "next-themes"
import { useLanguage, Language } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { signOut } from "next-auth/react"
import Link from "next/link"

const useMounted = () => {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}

interface ProfileFormData {
  name: string
  age: string
  gender: string
  phone: string
  healthAssistant: string
  address: string
}

export default function ScreeningPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { setTheme, resolvedTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const mounted = useMounted()
  const [showScreeningDialog, setShowScreeningDialog] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    age: "",
    gender: "",
    phone: "",
    healthAssistant: "",
    address: ""
  })

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/screening")
    }
  }, [status, router])

  const handleChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const isFormValid = () => {
    return formData.name && formData.age && formData.gender && formData.phone
  }

  const handleStartScreening = () => {
    if (isFormValid()) {
      setShowScreeningDialog(true)
    }
  }

  const handleSelectScreening = (type: "oroscan" | "medtech") => {
    // Store profile data in session storage for the flow page
    sessionStorage.setItem("screeningProfile", JSON.stringify(formData))
    sessionStorage.setItem("screeningType", type.toUpperCase())
    
    // Navigate to integrated screening flow
    router.push("/screening/flow")
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" })
  }

  const getInitials = (name: string | null | undefined, email: string | null | undefined) => {
    if (name) {
      const parts = name.trim().split(" ")
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      }
      return name.slice(0, 2).toUpperCase()
    }
    if (email) {
      return email.slice(0, 2).toUpperCase()
    }
    return "U"
  }

  // Show loading while checking auth
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Don't render if not authenticated
  if (status === "unauthenticated") {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background Side Shades */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -left-40 top-20 w-96 h-[600px] bg-gradient-to-br from-blue-400/20 via-indigo-300/15 to-transparent rounded-full blur-3xl" />
        <div className="absolute -right-40 top-40 w-96 h-[500px] bg-gradient-to-bl from-indigo-400/20 via-purple-300/15 to-transparent rounded-full blur-3xl" />
        <div className="absolute left-1/4 bottom-0 w-80 h-80 bg-gradient-to-t from-blue-300/10 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-16 left-0 z-40 h-[calc(100vh-64px)] w-[220px] bg-background border-r border-border shadow-xl"
      >
        <div className="flex flex-col h-full pt-4">
          {/* Sidebar Navigation */}
          <nav className="flex-1 px-3 space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-muted transition-colors"
            >
              <LayoutDashboard className="h-5 w-5 text-blue-600" />
              <span className="font-medium">All Dashboards</span>
            </Link>
            <Link
              href="/dashboard/oroscan"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-muted transition-colors"
            >
              <Activity className="h-5 w-5 text-emerald-600" />
              <span className="font-medium">Oroscan Dashboard</span>
            </Link>
            <Link
              href="/dashboard/anemia"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-muted transition-colors"
            >
              <Droplet className="h-5 w-5 text-red-600" />
              <span className="font-medium">Anemia Dashboard</span>
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-muted transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <Settings className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Settings</span>
            </Link>
          </nav>

          {/* Sidebar Footer */}
          <div className="px-3 pb-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors w-full"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50 h-16">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left side - Hamburger + Logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Toggle sidebar"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mr-1 inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-md">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{t("appName")}</h1>
                <p className="text-xs text-muted-foreground">Health Screening Portal</p>
              </div>
            </Link>
          </div>
          
          {/* Right side - Theme Toggle + Avatar */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="rounded-lg"
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            )}

            {/* Avatar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-2 py-1.5 bg-muted hover:bg-accent rounded-full transition-colors duration-200 cursor-pointer group outline-none">
                  <Avatar className="size-8 bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm">
                    <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                      {getInitials(session?.user?.name, session?.user?.email)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground group-hover:text-accent-foreground pr-1">
                    {session?.user?.name || session?.user?.email?.split("@")[0] || "User"}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem 
                  onClick={() => router.push("/dashboard/oroscan")}
                  className="px-3 py-2 text-sm cursor-pointer"
                >
                  <Activity className="mr-2.5 h-4 w-4 text-emerald-600" />
                  <span>Oroscan Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => router.push("/dashboard/anemia")}
                  className="px-3 py-2 text-sm cursor-pointer"
                >
                  <Droplet className="mr-2.5 h-4 w-4 text-red-600" />
                  <span>Anemia Dashboard</span>
                </DropdownMenuItem>
                
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="px-3 py-2 text-sm">
                    <Languages className="mr-2.5 h-4 w-4" />
                    <span>Language</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-32">
                    <DropdownMenuItem 
                      onClick={() => setLanguage("en")}
                      className="px-3 py-2 text-sm cursor-pointer"
                    >
                      <span className={language === "en" ? "font-semibold" : ""}>English</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setLanguage("hi")}
                      className="px-3 py-2 text-sm cursor-pointer"
                    >
                      <span className={language === "hi" ? "font-semibold" : ""}>हिन्दी</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setLanguage("bn")}
                      className="px-3 py-2 text-sm cursor-pointer"
                    >
                      <span className={language === "bn" ? "font-semibold" : ""}>বাংলা</span>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  variant="destructive"
                  className="px-3 py-2 text-sm cursor-pointer text-red-600 focus:text-red-50 focus:bg-red-600"
                >
                  <LogOut className="mr-2.5 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-card/95 backdrop-blur-sm border-border shadow-xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Patient Profile
              </CardTitle>
              <CardDescription className="text-muted-foreground text-base">
                Please fill in the patient information before starting the screening
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Name, Age, Gender Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-foreground flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter patient name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="border-0 rounded-xl px-4 py-3 bg-blue-50/80 dark:bg-slate-700/50 focus:bg-blue-100/80 dark:focus:bg-slate-600/50 focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-foreground">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.age}
                    onChange={(e) => handleChange("age", e.target.value)}
                    className="border-0 rounded-xl px-4 py-3 bg-blue-50/80 dark:bg-slate-700/50 focus:bg-blue-100/80 dark:focus:bg-slate-600/50 focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-foreground">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleChange("gender", e.target.value)}
                    className="w-full border-0 rounded-xl px-4 py-3 bg-blue-50/80 dark:bg-slate-700/50 focus:bg-blue-100/80 dark:focus:bg-slate-600/50 focus:ring-2 focus:ring-blue-500/50 text-foreground"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Phone and Health Assistant Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="border-0 rounded-xl px-4 py-3 bg-blue-50/80 dark:bg-slate-700/50 focus:bg-blue-100/80 dark:focus:bg-slate-600/50 focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-foreground flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    Health Assistant
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter health assistant name"
                    value={formData.healthAssistant}
                    onChange={(e) => handleChange("healthAssistant", e.target.value)}
                    className="border-0 rounded-xl px-4 py-3 bg-blue-50/80 dark:bg-slate-700/50 focus:bg-blue-100/80 dark:focus:bg-slate-600/50 focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Address
                </label>
                <Input
                  type="text"
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="border-0 rounded-xl px-4 py-3 bg-blue-50/80 dark:bg-slate-700/50 focus:bg-blue-100/80 dark:focus:bg-slate-600/50 focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button
                  onClick={handleStartScreening}
                  disabled={!isFormValid()}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("startScreening")}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Screening Type Selection Dialog */}
      <Dialog open={showScreeningDialog} onOpenChange={setShowScreeningDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Select Screening Type
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              Choose which health screening you want to perform. You will be redirected to the respective application.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
            {/* Oral Cancer Screening */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectScreening("oroscan")}
              className="group relative overflow-hidden rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 hover:border-emerald-500 p-6 text-left transition-all bg-white dark:bg-slate-800"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-700 opacity-0 group-hover:opacity-5 transition-opacity" />
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {t("oroscan")}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                {t("oroscanDesc")}
              </p>
              <div className="mt-4 flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
                Start Screening
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>

            {/* Anemia Screening */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectScreening("medtech")}
              className="group relative overflow-hidden rounded-2xl border-2 border-red-200 dark:border-red-800 hover:border-red-500 p-6 text-left transition-all bg-white dark:bg-slate-800"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-700 opacity-0 group-hover:opacity-5 transition-opacity" />
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Droplet className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {t("medtech")}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                {t("medtechDesc")}
              </p>
              <div className="mt-4 flex items-center text-red-600 dark:text-red-400 font-medium">
                Start Screening
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
