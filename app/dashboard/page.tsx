"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Scan, Droplet, ArrowRight, BarChart3, ArrowLeft } from "lucide-react"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/screening">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                  Dashboard
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">Select a screening dashboard to view analytics</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Oroscan Dashboard Card */}
          <Link href="/dashboard/oroscan">
            <Card className="h-full border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer bg-white dark:bg-slate-800 group">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                  <Scan className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl text-slate-900 dark:text-white">Oroscan Dashboard</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Oral Cancer Screening Analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  View statistics, trends, and recent screenings for oral cancer detection.
                </p>
                <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-1 transition-transform">
                  View Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Anemia Dashboard Card */}
          <Link href="/dashboard/anemia">
            <Card className="h-full border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer bg-white dark:bg-slate-800 group">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mb-4 group-hover:bg-red-200 dark:group-hover:bg-red-800 transition-colors">
                  <Droplet className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-xl text-slate-900 dark:text-white">Anemia Dashboard</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Anemia Screening Analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  View statistics, trends, and recent screenings for anemia detection.
                </p>
                <div className="flex items-center text-red-600 dark:text-red-400 font-medium group-hover:translate-x-1 transition-transform">
                  View Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 text-center">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="flex justify-center gap-4">
            <Link href="/screening/flow">
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Scan className="w-4 h-4" />
                New Oroscan
              </Button>
            </Link>
            <Link href="/screening/flow">
              <Button className="gap-2 bg-red-600 hover:bg-red-700">
                <Droplet className="w-4 h-4" />
                New Anemia Screening
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
