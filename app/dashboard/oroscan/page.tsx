"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Activity, TrendingUp, AlertCircle, Plus, Eye, Loader2, ArrowLeft, ImageIcon } from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  total: number
  todayScreenings: number
  completed: number
  pending: number
  avgConfidence: number
  lowRisk: number
  mediumRisk: number
  highRisk: number
}

interface RecentPatient {
  id: string
  screeningNumber: string
  name: string
  age: number
  gender: string
  phone: string
  status: string
  diagnosis: string
  confidence: number
  imagesCount: number
  createdAt: string
}

interface TrendData {
  month: string
  completed: number
  pending: number
}

interface RiskData {
  name: string
  value: number
  color: string
}

export default function OroscanDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentPatients, setRecentPatients] = useState<RecentPatient[]>([])
  const [trends, setTrends] = useState<TrendData[]>([])
  const [riskDistribution, setRiskDistribution] = useState<RiskData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchDashboardData()
    }
  }, [session])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/dashboard/oroscan")
      
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data")
      }
      
      const data = await response.json()
      setStats(data.stats)
      setRecentPatients(data.recentPatients)
      setTrends(data.trends)
      setRiskDistribution(data.riskDistribution)
      setError(null)
    } catch (err) {
      console.error("Error fetching dashboard:", err)
      setError("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-slate-600 dark:text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={fetchDashboardData}>Retry</Button>
        </div>
      </div>
    )
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
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Oroscan Dashboard</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">Oral Cancer Screening Analytics</p>
              </div>
            </div>
            <Link href="/screening/flow?type=OROSCAN">
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                New Screening
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Screenings */}
          <Card className="border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Total Screenings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats?.total || 0}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">All time screenings</p>
            </CardContent>
          </Card>

          {/* Completed */}
          <Card className="border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-600" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats?.completed || 0}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {stats?.total ? Math.round((stats.completed / stats.total) * 100) : 0}% completion rate
              </p>
            </CardContent>
          </Card>

          {/* Pending */}
          <Card className="border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats?.pending || 0}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Awaiting diagnosis</p>
            </CardContent>
          </Card>

          {/* Today's Screenings */}
          <Card className="border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-purple-600" />
                Today&apos;s Screenings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats?.todayScreenings || 0}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Screenings today</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Screening Trends */}
          <Card className="lg:col-span-2 border-slate-200 dark:border-slate-700 shadow-md bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100">Screening Trends</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">Monthly completed and pending screenings</CardDescription>
            </CardHeader>
            <CardContent>
              {trends.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: "#fff", 
                        border: "1px solid #e2e8f0", 
                        borderRadius: "8px"
                      }}
                    />
                    <Legend />
                    <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pending" fill="#f59e0b" name="Pending" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-500">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Risk Distribution */}
          <Card className="border-slate-200 dark:border-slate-700 shadow-md bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100">Risk Distribution</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">Patient risk levels</CardDescription>
            </CardHeader>
            <CardContent>
              {riskDistribution.some(r => r.value > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => value > 0 ? `${name}: ${value}` : ""}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-500">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Screenings Table */}
        <Card className="border-slate-200 dark:border-slate-700 shadow-md bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-100">Recent Screenings</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">Latest Oroscan screening records</CardDescription>
          </CardHeader>
          <CardContent>
            {recentPatients.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Screening #</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Patient Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Age/Gender</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Diagnosis</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Images</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPatients.map((patient) => (
                      <tr key={patient.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono text-xs">
                          {patient.screeningNumber}
                        </td>
                        <td className="py-3 px-4 text-slate-900 dark:text-slate-100 font-medium">{patient.name}</td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{patient.age} / {patient.gender}</td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          {new Date(patient.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              patient.status === "Completed"
                                ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                : "bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200"
                            }`}
                          >
                            {patient.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              patient.diagnosis === "Pending"
                                ? "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                                : patient.diagnosis.toLowerCase().includes("negative") || patient.diagnosis.toLowerCase().includes("low")
                                  ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                  : patient.diagnosis.toLowerCase().includes("medium")
                                    ? "bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200"
                                    : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                            }`}
                          >
                            {patient.diagnosis}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400">
                            <ImageIcon className="w-4 h-4" />
                            {patient.imagesCount}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Link href={`/dashboard/patient/${patient.id}`}>
                            <Button variant="outline" size="sm" className="gap-1 text-xs">
                              <Eye className="w-3 h-3" />
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-500 dark:text-slate-400 mb-4">No screenings found</p>
                <Link href="/screening/flow?type=OROSCAN">
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Start New Screening
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
