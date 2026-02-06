"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  UserCheck, 
  Activity, 
  Scan,
  Droplet,
  TrendingUp,
  Calendar,
  RefreshCw
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts"

interface DashboardStats {
  totalUsers: number
  totalPatients: number
  totalOroscanScreenings: number
  totalMedtechScreenings: number
  todayScreenings: number
  pendingReviews: number
  recentActivity: {
    date: string
    oroscan: number
    medtech: number
  }[]
  screeningDistribution: {
    name: string
    value: number
    color: string
  }[]
  userGrowth: {
    month: string
    users: number
  }[]
  recentPatientsDetail: {
    id: string
    name: string
    screeningNumber: string
    screeningType: string
    createdAt: string
    createdBy: string
  }[]
  topHealthAssistants: {
    name: string
    count: number
  }[]
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    
    try {
      const response = await fetch("/api/admin/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "blue",
      description: "Registered users"
    },
    {
      title: "Total Patients",
      value: stats?.totalPatients || 0,
      icon: UserCheck,
      color: "green",
      description: "Screened patients"
    },
    {
      title: "Oroscan Screenings",
      value: stats?.totalOroscanScreenings || 0,
      icon: Scan,
      color: "emerald",
      description: "Oral cancer screenings"
    },
    {
      title: "Anemia Screenings",
      value: stats?.totalMedtechScreenings || 0,
      icon: Droplet,
      color: "red",
      description: "Anemia screenings"
    },
    {
      title: "Today's Screenings",
      value: stats?.todayScreenings || 0,
      icon: Calendar,
      color: "purple",
      description: "Screenings today"
    },
    // {
    //   title: "Pending Reviews",
    //   value: stats?.pendingReviews || 0,
    //   icon: AlertCircle,
    //   color: "yellow",
    //   description: "Awaiting review"
    // },
  ]

  const colorMap: Record<string, string> = {
    blue: "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400",
    green: "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400",
    emerald: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400",
    red: "bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400",
    purple: "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400",
    yellow: "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400",
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Overview of your screening platform
            {lastUpdated && (
              <span className="ml-2 text-xs">
                • Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => fetchStats(true)}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-slate-200 dark:border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {stat.value.toLocaleString()}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${colorMap[stat.color]}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Screening Activity Chart */}
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Screening Activity
            </CardTitle>
            <CardDescription>Daily screenings over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.recentActivity || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "var(--background)", 
                      border: "1px solid var(--border)",
                      borderRadius: "8px"
                    }}
                  />
                  <Legend />
                  <Bar dataKey="oroscan" name="Oroscan" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="medtech" name="Anemia" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Screening Distribution */}
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Screening Distribution
            </CardTitle>
            <CardDescription>Breakdown by screening type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.screeningDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => 
                      `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                  >
                    {(stats?.screeningDistribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "var(--background)", 
                      border: "1px solid var(--border)",
                      borderRadius: "8px"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Growth Chart */}
      {/* <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            User Growth
          </CardTitle>
          <CardDescription>Monthly user registrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.userGrowth || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "var(--background)", 
                    border: "1px solid var(--border)",
                    borderRadius: "8px"
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card> */}

      {/* Recent Patients & Top Health Assistants */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Patients */}
        {/* <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600" />
              Recent Patients
            </CardTitle>
            <CardDescription>Latest screening records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recentPatientsDetail && stats.recentPatientsDetail.length > 0 ? (
                stats.recentPatientsDetail.map((patient) => (
                  <div 
                    key={patient.id} 
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        patient.screeningType === "OROSCAN" 
                          ? "bg-emerald-100 dark:bg-emerald-900/50" 
                          : "bg-red-100 dark:bg-red-900/50"
                      }`}>
                        {patient.screeningType === "OROSCAN" ? (
                          <Scan className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Droplet className="w-4 h-4 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white text-sm">
                          {patient.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          #{patient.screeningNumber} • by {patient.createdBy}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        patient.screeningType === "OROSCAN"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400"
                      }`}>
                        {patient.screeningType === "OROSCAN" ? "Oral Cancer" : "Anaemia"}
                      </span>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(patient.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500 py-8">No patients yet</p>
              )}
            </div>
          </CardContent>
        </Card>  */}

        {/* Top Health Assistants */}
        {/* <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Top Health Assistants
            </CardTitle>
            <CardDescription>By number of screenings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.topHealthAssistants && stats.topHealthAssistants.length > 0 ? (
                stats.topHealthAssistants.map((ha, index) => (
                  <div 
                    key={ha.name} 
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400" :
                        index === 1 ? "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300" :
                        index === 2 ? "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400" :
                        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}>
                        {index + 1}
                      </div>
                      <p className="font-medium text-slate-900 dark:text-white text-sm">
                        {ha.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {ha.count}
                      </span>
                      <span className="text-xs text-slate-500">screenings</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500 py-8">No health assistants yet</p>
              )}
            </div>
          </CardContent>
        </Card> */}
      {/* </div> */}
    </div>
  )
}
