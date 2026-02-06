"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
} from "@/components/ui/dropdown-menu"
import { 
  Activity, 
  Search, 
  Eye,
  Calendar,
  RefreshCw,
  Scan,
  Droplet,
  Filter,
  Image,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Screening {
  id: string
  screeningNumber: string
  patientName: string
  patientAge: number
  patientGender: string
  screeningType: "OROSCAN" | "MEDTECH"
  status: "pending" | "completed" | "reviewed"
  riskLevel: "low" | "medium" | "high" | null
  createdAt: string
  createdBy: string
  imagesCount: number
  responsesCount: number
}

export default function ScreeningsPage() {
  const [screenings, setScreenings] = useState<Screening[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "OROSCAN" | "MEDTECH">("all")
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "completed" | "reviewed">("all")
  const [selectedScreening, setSelectedScreening] = useState<Screening | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  useEffect(() => {
    fetchScreenings()
  }, [])

  const fetchScreenings = async () => {
    try {
      const response = await fetch("/api/admin/screenings")
      if (response.ok) {
        const data = await response.json()
        setScreenings(data)
      }
    } catch (error) {
      console.error("Failed to fetch screenings:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredScreenings = screenings.filter(screening => {
    const matchesSearch = 
      screening.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      screening.screeningNumber.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === "all" || screening.screeningType === filterType
    const matchesStatus = filterStatus === "all" || screening.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        )
      case "reviewed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400">
            <CheckCircle className="w-3 h-3" />
            Reviewed
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        )
    }
  }

  const getRiskBadge = (risk: string | null) => {
    if (!risk) return null
    switch (risk) {
      case "high":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400">
            <AlertTriangle className="w-3 h-3" />
            High Risk
          </span>
        )
      case "medium":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400">
            Medium Risk
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400">
            Low Risk
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Screenings</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          View all screening records
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by patient name or screening number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  {filterType === "all" ? "All Types" : filterType === "OROSCAN" ? "Oroscan" : "Anemia"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterType("all")}>
                  All Types
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType("OROSCAN")}>
                  <Scan className="w-4 h-4 mr-2 text-emerald-600" />
                  Oroscan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType("MEDTECH")}>
                  <Droplet className="w-4 h-4 mr-2 text-red-600" />
                  Anemia
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Clock className="w-4 h-4" />
                  {filterStatus === "all" ? "All Status" : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("pending")}>
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("completed")}>
                  Completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("reviewed")}>
                  Reviewed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" onClick={fetchScreenings} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Screenings Table */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            All Screenings ({filteredScreenings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Screening #</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Patient</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Risk</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Data</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Date</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredScreenings.map((screening) => (
                  <tr 
                    key={screening.id} 
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400">
                        {screening.screeningNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {screening.patientName}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {screening.patientAge} yrs, {screening.patientGender}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                        screening.screeningType === "OROSCAN" 
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400"
                      )}>
                        {screening.screeningType === "OROSCAN" ? (
                          <Scan className="w-3 h-3" />
                        ) : (
                          <Droplet className="w-3 h-3" />
                        )}
                        {screening.screeningType === "OROSCAN" ? "Oroscan" : "Anemia"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(screening.status)}
                    </td>
                    <td className="py-3 px-4">
                      {getRiskBadge(screening.riskLevel)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                        {screening.imagesCount > 0 && (
                          <span className="flex items-center gap-1">
                            <Image className="w-3 h-3" />
                            {screening.imagesCount}
                          </span>
                        )}
                        {screening.responsesCount > 0 && (
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {screening.responsesCount}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-3 h-3" />
                        {new Date(screening.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedScreening(screening)
                          setShowDetailsDialog(true)
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredScreenings.length === 0 && (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                No screenings found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Screening Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Screening Details</DialogTitle>
            <DialogDescription>
              #{selectedScreening?.screeningNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedScreening && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Patient Name</p>
                  <p className="font-medium text-slate-900 dark:text-white">{selectedScreening.patientName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Age / Gender</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {selectedScreening.patientAge} yrs, {selectedScreening.patientGender}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Screening Type</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {selectedScreening.screeningType === "OROSCAN" ? "Oral Cancer (Oroscan)" : "Anemia (Medtech)"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedScreening.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Risk Level</p>
                  <div className="mt-1">{getRiskBadge(selectedScreening.riskLevel) || "Not assessed"}</div>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Created By</p>
                  <p className="font-medium text-slate-900 dark:text-white">{selectedScreening.createdBy}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Data Collected</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="flex items-center gap-1 text-sm text-slate-700 dark:text-slate-300">
                    <Image className="w-4 h-4" />
                    {selectedScreening.imagesCount} images
                  </span>
                  <span className="flex items-center gap-1 text-sm text-slate-700 dark:text-slate-300">
                    <FileText className="w-4 h-4" />
                    {selectedScreening.responsesCount} responses
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Created At</p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {new Date(selectedScreening.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
