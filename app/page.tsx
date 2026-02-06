"use client"

import { useSyncExternalStore, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  Activity, 
  Droplet, 
  ArrowRight, 
  Sun, 
  Moon, 
  Stethoscope,
  BarChart3,
  Shield,
  Zap
} from "lucide-react"
import { useTheme } from "next-themes"
import { useLanguage, Language } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

const useMounted = () => {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}

export default function LandingPage() {
  const { setTheme, resolvedTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const mounted = useMounted()
  const [showDashboardDialog, setShowDashboardDialog] = useState(false)

  const features = [
    {
      icon: Activity,
      title: "Oral Cancer Screening",
      description: "AI-powered detection for early oral cancer signs",
      color: "emerald"
    },
    {
      icon: Droplet,
      title: "Anemia Assessment",
      description: "Non-invasive anemia detection through image analysis",
      color: "red"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your health data is encrypted and protected",
      color: "blue"
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Get screening results within minutes",
      color: "yellow"
    }
  ]

  const stats = [
    { value: "2,140+", label: "Patients Screened" },
    { value: "5,570+", label: "Total Screenings" },
    { value: "98%", label: "Accuracy Rate" },
    { value: "3", label: "Languages Supported" }
  ]

  const router = useRouter()

  const handleDashboardSelect = (type: "oroscan" | "medtech") => {
    const url = type === "oroscan" ? "/dashboard/oroscan" : "/dashboard/anemia"
    router.push(url)
    setShowDashboardDialog(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {t("appName")}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Language Selector */}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="bn">বাংলা</option>
              </select>
              
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
              
              <Button asChild variant="outline" className="rounded-lg">
                <Link href="/auth/login">
                  {t("login")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
                Comprehensive Health
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Screening Platform</span>
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
                AI-powered screening for oral cancer and anemia detection. Get accurate results in minutes with our advanced diagnostic technology.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <Link href="/screening">
                    {t("startScreening")}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="px-8 py-6 text-lg rounded-xl"
                  onClick={() => setShowDashboardDialog(true)}
                >
                  {t("viewDashboard")}
                  <BarChart3 className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Screening Types Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Two Screenings, One Platform
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Complete your profile once and choose which screening to perform
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Oral Cancer Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Card className="group relative overflow-hidden border-2 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all duration-300 bg-white dark:bg-slate-800">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-700 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Activity className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                    {t("oroscan")}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    {t("oroscanDesc")}
                  </p>
                  <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Image-based oral cavity analysis
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Risk factor assessment
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Early detection recommendations
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Anemia Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Card className="group relative overflow-hidden border-2 border-red-200 dark:border-red-800 hover:border-red-400 dark:hover:border-red-600 transition-all duration-300 bg-white dark:bg-slate-800">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-700 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Droplet className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                    {t("medtech")}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    {t("medtechDesc")}
                  </p>
                  <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      Non-invasive conjunctiva analysis
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      Hemoglobin estimation
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      Nutritional guidance
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
            Platform Features
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center p-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-full">
                  <div className={`w-12 h-12 rounded-xl bg-${feature.color}-100 dark:bg-${feature.color}-900/30 flex items-center justify-center mx-auto mb-4`}>
                    <feature.icon className={`w-6 h-6 text-${feature.color}-600 dark:text-${feature.color}-400`} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Begin your health screening journey today. It only takes a few minutes.
          </p>
          <Button 
            asChild
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg rounded-xl"
          >
            <Link href="/screening">
              Start Free Screening
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto text-center text-slate-600 dark:text-slate-400">
          <p>© 2026 Health Screening Portal. All rights reserved.</p>
        </div>
      </footer>

      {/* Dashboard Selection Dialog */}
      <Dialog open={showDashboardDialog} onOpenChange={setShowDashboardDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Select Dashboard
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              Choose which dashboard you want to view
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
            {/* Oroscan Dashboard */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleDashboardSelect("oroscan")}
              className="group relative overflow-hidden rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 hover:border-emerald-500 p-6 text-left transition-all bg-white dark:bg-slate-800"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-700 opacity-0 group-hover:opacity-5 transition-opacity" />
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {t("oroscan")} Dashboard
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                View oral cancer screening records and analytics
              </p>
              <div className="mt-4 flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
                Open Dashboard
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>

            {/* Medtech Dashboard */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleDashboardSelect("medtech")}
              className="group relative overflow-hidden rounded-2xl border-2 border-red-200 dark:border-red-800 hover:border-red-500 p-6 text-left transition-all bg-white dark:bg-slate-800"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-700 opacity-0 group-hover:opacity-5 transition-opacity" />
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Droplet className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {t("medtech")} Dashboard
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                View anemia screening records and analytics
              </p>
              <div className="mt-4 flex items-center text-red-600 dark:text-red-400 font-medium">
                Open Dashboard
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
