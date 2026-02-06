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
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  UserCheck, 
  Search, 
  MoreVertical, 
  Eye,
  Edit,
  Trash2,
  Phone,
  Calendar,
  RefreshCw,
  Scan,
  Droplet,
  Filter,
  FileText,
  ImageIcon,
  Activity,
  Loader2,
  X,
  Download
} from "lucide-react"
import { cn } from "@/lib/utils"
import * as XLSX from "xlsx"

interface Patient {
  id: string
  screeningNumber: string
  name: string
  age: number
  gender: string
  phone: string
  address: string
  healthAssistant: string | null
  screeningType: "OROSCAN" | "MEDTECH"
  createdAt: string
  createdBy: {
    name: string | null
    email: string
  }
}

interface PatientDetail extends Patient {
  oroscanResponses: Array<{
    id: string
    answer: string
    duration: string | null
    question: {
      text: string
      category: string
      type: string
    }
  }>
  oroscanImages: Array<{
    id: string
    url: string
    type: string
    createdAt: string
  }>
  medtechResponses: Array<{
    id: string
    answer: string
    question: {
      text: string
      category: string
      type: string
    }
  }>
  medtechImages: Array<{
    id: string
    url: string
    type: string
    createdAt: string
  }>
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "OROSCAN" | "MEDTECH">("all")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [patientDetails, setPatientDetails] = useState<PatientDetail | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    address: "",
    healthAssistant: ""
  })
  const [editResponses, setEditResponses] = useState<Record<string, { answer: string; duration?: string }>>({})  
  const [editPatientDetails, setEditPatientDetails] = useState<PatientDetail | null>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([])
  const [exportLoading, setExportLoading] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [exportType, setExportType] = useState<"OROSCAN" | "MEDTECH">("OROSCAN")
  const [exportFormat, setExportFormat] = useState<"csv" | "excel">("excel")

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const response = await fetch("/api/admin/patients")
      if (response.ok) {
        const data = await response.json()
        setPatients(data)
      }
    } catch (error) {
      console.error("Failed to fetch patients:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPatientDetails = async (patientId: string) => {
    setDetailsLoading(true)
    try {
      const response = await fetch(`/api/admin/patients/${patientId}`)
      if (response.ok) {
        const data = await response.json()
        setPatientDetails(data)
      }
    } catch (error) {
      console.error("Failed to fetch patient details:", error)
    } finally {
      setDetailsLoading(false)
    }
  }

  // Map question IDs to their corresponding image paths
  // questionId is stored directly in the response, not in question.text
  const getSelectedImageUrl = (questionId: string, answer: string): string | null => {
    if (!questionId || !answer) return null
    if (answer === "none" || answer === "yes" || answer === "no") return null
    
    const qId = questionId.toLowerCase()
    
    // Asymmetry question - single image
    if (qId === "asymmetry" || qId.includes("asymmetry")) {
      return `/mouth/assymetry.png`
    }
    
    // Patches/Red/White patches question - images 1-13
    if (qId === "patches_image" || qId.includes("patch") || qId.includes("red") || qId.includes("white")) {
      return `/mouth/patch-${answer}.png`
    }
    
    // Lumps in mouth question - images 1-4
    if (qId === "lumps_mouth" || (qId.includes("lump") && qId.includes("mouth"))) {
      return `/mouth/lumps-${answer}.png`
    }
    
    return null
  }

  // Group responses by category
  const groupResponsesByCategory = (responses: Array<{ answer: string; duration?: string | null; question: { text: string; category: string; type: string } }>) => {
    const grouped: Record<string, typeof responses> = {}
    responses.forEach(r => {
      const category = r.question?.category || "other"
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(r)
    })
    return grouped
  }

  const handleDeletePatient = async () => {
    if (!selectedPatient) return
    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/patients/${selectedPatient.id}`, {
        method: "DELETE"
      })
      if (response.ok) {
        setPatients(patients.filter(p => p.id !== selectedPatient.id))
        setShowDeleteDialog(false)
        setSelectedPatient(null)
      }
    } catch (error) {
      console.error("Failed to delete patient:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditPatient = async () => {
    if (!selectedPatient) return
    setActionLoading(true)
    try {
      // Update patient info
      const response = await fetch(`/api/admin/patients/${selectedPatient.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          age: parseInt(editForm.age),
          gender: editForm.gender,
          phone: editForm.phone,
          address: editForm.address,
          healthAssistant: editForm.healthAssistant || null,
          // Include responses to update
          responses: Object.entries(editResponses).map(([id, data]) => ({
            id,
            answer: data.answer,
            duration: data.duration
          })),
          // Include images to delete
          deleteImageIds: deletedImageIds
        })
      })
      if (response.ok) {
        const updatedPatient = await response.json()
        setPatients(patients.map(p => p.id === selectedPatient.id ? { ...p, ...updatedPatient } : p))
        setShowEditDialog(false)
        setSelectedPatient(null)
        setEditPatientDetails(null)
        setEditResponses({})
        setDeletedImageIds([])
      }
    } catch (error) {
      console.error("Failed to update patient:", error)
    } finally {
      setActionLoading(false)
    }
  }

  // Get the image URL for image-selection questions in edit mode
  const getImageOptionsForQuestion = (questionText: string): Array<{ id: string; label: string; url: string }> => {
    const qText = questionText.toLowerCase()
    if (qText === "asymmetry") {
      return [{ id: "1", label: "Asymmetry", url: "/mouth/assymetry.png" }]
    }
    if (qText === "patches_image") {
      return Array.from({ length: 13 }, (_, i) => ({
        id: String(i + 1),
        label: `Patch ${i + 1}`,
        url: `/mouth/patch-${i + 1}.png`
      }))
    }
    if (qText === "lumps_mouth") {
      return Array.from({ length: 4 }, (_, i) => ({
        id: String(i + 1),
        label: `Lump ${i + 1}`,
        url: `/mouth/lumps-${i + 1}.png`
      }))
    }
    return []
  }

  // Fetch all patients with responses for export (filtered by screening type)
  const fetchAllPatientsForExport = async (screeningType: "OROSCAN" | "MEDTECH"): Promise<PatientDetail[]> => {
    const allPatientDetails: PatientDetail[] = []
    const filteredPatientsList = patients.filter(p => p.screeningType === screeningType)
    
    for (const patient of filteredPatientsList) {
      try {
        const response = await fetch(`/api/admin/patients/${patient.id}`)
        if (response.ok) {
          const data = await response.json()
          allPatientDetails.push(data)
        }
      } catch (error) {
        console.error(`Failed to fetch patient ${patient.id}:`, error)
      }
    }
    return allPatientDetails
  }

  // Get all unique questions from patients for column headers
  const getUniqueQuestions = (allPatients: PatientDetail[], screeningType: "OROSCAN" | "MEDTECH"): string[] => {
    const questionsSet = new Set<string>()
    const questionsOrder: string[] = []
    
    allPatients.forEach(patient => {
      const responses = screeningType === "OROSCAN" 
        ? patient.oroscanResponses 
        : patient.medtechResponses
      
      responses.forEach(response => {
        const questionText = response.question?.text || "Unknown"
        if (!questionsSet.has(questionText)) {
          questionsSet.add(questionText)
          questionsOrder.push(questionText)
        }
      })
    })
    
    return questionsOrder
  }

  // Export data with proper format
  const exportData = async () => {
    setExportLoading(true)
    setShowExportDialog(false)
    
    try {
      const allPatients = await fetchAllPatientsForExport(exportType)
      
      if (allPatients.length === 0) {
        alert(`No ${exportType === "OROSCAN" ? "Oral Cancer" : "Anaemia"} patients found to export.`)
        setExportLoading(false)
        return
      }
      
      // Get all unique questions as column headers
      const questions = getUniqueQuestions(allPatients, exportType)
      
      // Prepare data rows - one row per patient
      const exportRows = allPatients.map(patient => {
        const responses = exportType === "OROSCAN" 
          ? patient.oroscanResponses 
          : patient.medtechResponses
        
        // Create a map of question -> answer for this patient
        const responseMap: Record<string, string> = {}
        responses.forEach(r => {
          const questionText = r.question?.text || "Unknown"
          let answer = r.answer
          // Add duration if present
          if ((r as { duration?: string | null }).duration) {
            answer += ` (Duration: ${(r as { duration?: string | null }).duration})`
          }
          responseMap[questionText] = answer
        })
        
        // Build row data
        const row: Record<string, string | number> = {
          "Screening Number": patient.screeningNumber,
          "Name": patient.name,
          "Age": patient.age,
          "Gender": patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1),
          "Phone": patient.phone,
          "Address": patient.address,
          "Health Assistant": patient.healthAssistant || "N/A",
          "Created At": new Date(patient.createdAt).toLocaleString(),
          "Created By": patient.createdBy?.name || patient.createdBy?.email || "N/A"
        }
        
        // Add each question's response
        questions.forEach(q => {
          row[q] = responseMap[q] || "-"
        })
        
        // Add image URLs if any
        const images = exportType === "OROSCAN" ? patient.oroscanImages : patient.medtechImages
        if (images && images.length > 0) {
          row["Image URLs"] = images.map(img => img.url).join(" | ")
        } else {
          row["Image URLs"] = "-"
        }
        
        return row
      })
      
      if (exportFormat === "excel") {
        // Create Excel workbook
        const worksheet = XLSX.utils.json_to_sheet(exportRows)
        const workbook = XLSX.utils.book_new()
        const sheetName = exportType === "OROSCAN" ? "Oral Cancer Screening" : "Anaemia Screening"
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
        
        // Set column widths
        const colWidths = [
          { wch: 18 }, // Screening Number
          { wch: 20 }, // Name
          { wch: 8 },  // Age
          { wch: 10 }, // Gender
          { wch: 15 }, // Phone
          { wch: 30 }, // Address
          { wch: 18 }, // Health Assistant
          { wch: 20 }, // Created At
          { wch: 20 }, // Created By
          ...questions.map(() => ({ wch: 25 })), // Question columns
          { wch: 50 }  // Image URLs
        ]
        worksheet["!cols"] = colWidths
        
        const filename = `${exportType === "OROSCAN" ? "oral_cancer" : "anaemia"}_patients_${new Date().toISOString().split('T')[0]}.xlsx`
        XLSX.writeFile(workbook, filename)
      } else {
        // CSV export
        const headers = [
          "Screening Number", "Name", "Age", "Gender", "Phone", "Address", 
          "Health Assistant", "Created At", "Created By",
          ...questions,
          "Image URLs"
        ]
        
        const csvRows = exportRows.map(row => 
          headers.map(header => `"${String(row[header] || "-").replace(/"/g, '""')}"`)
        )
        
        const csvContent = [
          headers.map(h => `"${h}"`).join(","),
          ...csvRows.map(row => row.join(","))
        ].join("\n")
        
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `${exportType === "OROSCAN" ? "oral_cancer" : "anaemia"}_patients_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("Export failed:", error)
      alert("Export failed. Please try again.")
    } finally {
      setExportLoading(false)
    }
  }

  // Download individual patient report
  const downloadPatientReport = async (patient: Patient) => {
    try {
      const response = await fetch(`/api/admin/patients/${patient.id}`)
      if (!response.ok) throw new Error("Failed to fetch patient")
      
      const data: PatientDetail = await response.json()
      const responses = data.screeningType === "OROSCAN" 
        ? data.oroscanResponses 
        : data.medtechResponses
      const images = data.screeningType === "OROSCAN"
        ? data.oroscanImages
        : data.medtechImages

      // Create report data
      const reportData = {
        patientInfo: {
          screeningNumber: data.screeningNumber,
          name: data.name,
          age: data.age,
          gender: data.gender,
          phone: data.phone,
          address: data.address,
          healthAssistant: data.healthAssistant,
          screeningType: data.screeningType,
          createdAt: new Date(data.createdAt).toLocaleString(),
          createdBy: data.createdBy?.name || data.createdBy?.email
        },
        responses: responses.map(r => ({
          category: r.question?.category,
          question: r.question?.text,
          answer: r.answer,
          duration: (r as { duration?: string | null }).duration
        })),
        imagesCount: images.length
      }

      // Create Excel workbook for single patient
      const workbook = XLSX.utils.book_new()
      
      // Patient info sheet
      const infoSheet = XLSX.utils.json_to_sheet([reportData.patientInfo])
      XLSX.utils.book_append_sheet(workbook, infoSheet, "Patient Info")
      
      // Responses sheet
      if (reportData.responses.length > 0) {
        const responsesSheet = XLSX.utils.json_to_sheet(reportData.responses)
        XLSX.utils.book_append_sheet(workbook, responsesSheet, "Responses")
      }

      XLSX.writeFile(workbook, `patient_${data.screeningNumber}_report.xlsx`)
    } catch (error) {
      console.error("Failed to download report:", error)
    }
  }

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.screeningNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone.includes(searchQuery)
    const matchesType = filterType === "all" || patient.screeningType === filterType
    return matchesSearch && matchesType
  })

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Patients</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            View and manage patient records
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => setShowExportDialog(true)}
          disabled={exportLoading}
        >
          <Download className="w-4 h-4" />
          {exportLoading ? "Exporting..." : "Export Data"}
        </Button>
      </div>

      {/* Search and Filter */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by name, screening number, or phone..."
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
            <Button variant="outline" onClick={fetchPatients} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Patients Table */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-600" />
            All Patients ({filteredPatients.length})
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
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Phone</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Created By</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Date</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr 
                    key={patient.id} 
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400">
                        {patient.screeningNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {patient.name}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {patient.age} yrs, {patient.gender}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                        patient.screeningType === "OROSCAN" 
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400"
                      )}>
                        {patient.screeningType === "OROSCAN" ? (
                          <Scan className="w-3 h-3" />
                        ) : (
                          <Droplet className="w-3 h-3" />
                        )}
                        {patient.screeningType === "OROSCAN" ? "Oroscan" : "Anemia"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="w-3 h-3" />
                        {patient.phone}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                      {patient.createdBy?.name || patient.createdBy?.email || "Unknown"}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-3 h-3" />
                        {new Date(patient.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedPatient(patient)
                              setPatientDetails(null)
                              fetchPatientDetails(patient.id)
                              setShowDetailsDialog(true)
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={async () => {
                              setSelectedPatient(patient)
                              setEditForm({
                                name: patient.name,
                                age: String(patient.age),
                                gender: patient.gender,
                                phone: patient.phone,
                                address: patient.address,
                                healthAssistant: patient.healthAssistant || ""
                              })
                              setEditPatientDetails(null)
                              setEditResponses({})
                              setDeletedImageIds([])
                              setEditLoading(true)
                              setShowEditDialog(true)
                              // Fetch full patient details for editing
                              try {
                                const response = await fetch(`/api/admin/patients/${patient.id}`)
                                if (response.ok) {
                                  const data = await response.json()
                                  setEditPatientDetails(data)
                                  // Initialize responses for editing
                                  const responses: Record<string, { answer: string; duration?: string }> = {}
                                  const allResponses = data.screeningType === "OROSCAN" 
                                    ? data.oroscanResponses 
                                    : data.medtechResponses
                                  allResponses.forEach((r: { id: string; answer: string; duration?: string; question: { text: string } }) => {
                                    responses[r.id] = { answer: r.answer, duration: r.duration || undefined }
                                  })
                                  setEditResponses(responses)
                                }
                              } catch (error) {
                                console.error("Failed to fetch patient details:", error)
                              } finally {
                                setEditLoading(false)
                              }
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => downloadPatientReport(patient)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Report
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => {
                              setSelectedPatient(patient)
                              setShowDeleteDialog(true)
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPatients.length === 0 && (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                No patients found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Patient Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={(open) => {
        setShowDetailsDialog(open)
        if (!open) setSelectedImage(null)
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
            <DialogDescription>
              Screening #{selectedPatient?.screeningNumber} • {selectedPatient?.screeningType === "OROSCAN" ? "Oral Cancer Screening" : "Anemia Screening"}
            </DialogDescription>
          </DialogHeader>
          
          {detailsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : selectedPatient && (
            <div className="space-y-6 py-4">
              {/* Patient Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Name</p>
                  <p className="font-medium text-slate-900 dark:text-white">{selectedPatient.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Age</p>
                  <p className="font-medium text-slate-900 dark:text-white">{selectedPatient.age} years</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Gender</p>
                  <p className="font-medium text-slate-900 dark:text-white capitalize">{selectedPatient.gender}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Phone</p>
                  <p className="font-medium text-slate-900 dark:text-white">{selectedPatient.phone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Address</p>
                  <p className="font-medium text-slate-900 dark:text-white">{selectedPatient.address}</p>
                </div>
                {selectedPatient.healthAssistant && (
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Health Assistant</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedPatient.healthAssistant}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Created</p>
                  <p className="font-medium text-slate-900 dark:text-white text-sm">
                    {new Date(selectedPatient.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Responses Section */}
              {patientDetails && (
                <>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
                      <FileText className="w-4 h-4 text-blue-600" />
                      Screening Responses
                    </h3>
                    {(() => {
                      const responses = patientDetails.screeningType === "OROSCAN" 
                        ? patientDetails.oroscanResponses 
                        : patientDetails.medtechResponses
                      const groupedResponses = groupResponsesByCategory(responses)
                      
                      if (Object.keys(groupedResponses).length === 0) {
                        return <p className="text-slate-500 dark:text-slate-400 text-center py-4">No responses recorded</p>
                      }
                      
                      return (
                        <div className="space-y-4">
                          {Object.entries(groupedResponses).map(([category, categoryResponses]) => (
                            <div key={category} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                              <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                                <Activity className="w-3 h-3" />
                                {category.replace(/_/g, " ")}
                              </h4>
                              <div className="space-y-2">
                                {categoryResponses.map((response, idx) => {
                                  const questionText = response.question?.text || ""
                                  // Check if this is an image-selection question based on questionId
                                  const isImageQuestion = ["asymmetry", "patches_image", "lumps_mouth"].includes(questionText.toLowerCase())
                                  const selectedImageUrl = isImageQuestion 
                                    ? getSelectedImageUrl(questionText, response.answer)
                                    : null
                                  
                                  return (
                                    <div key={idx} className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
                                      <div className="flex justify-between items-start gap-2">
                                        <p className="text-sm text-slate-700 dark:text-slate-300 flex-1">{questionText}</p>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                                          response.answer.toLowerCase() === "yes" 
                                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                            : response.answer.toLowerCase() === "no"
                                              ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                                              : response.answer === "none"
                                                ? "bg-slate-100 text-slate-700 dark:bg-slate-600 dark:text-slate-300"
                                                : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                        }`}>
                                          {response.answer === "none" ? "None" : response.answer}
                                        </span>
                                      </div>
                                      {response.duration && (
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Duration: {response.duration}</p>
                                      )}
                                      
                                      {/* Show selected image if applicable */}
                                      {selectedImageUrl && (
                                        <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Selected Image:</p>
                                          <div 
                                            className="relative w-24 h-24 rounded overflow-hidden border-2 border-blue-500 cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => setSelectedImage(selectedImageUrl)}
                                          >
                                            <img 
                                              src={selectedImageUrl} 
                                              alt="Selected condition"
                                              className="w-full h-full object-cover"
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    })()}
                  </div>

                  {/* Uploaded Images Section */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
                      <ImageIcon className="w-4 h-4 text-blue-600" />
                      Uploaded Images ({patientDetails.screeningType === "OROSCAN" 
                        ? patientDetails.oroscanImages.length 
                        : patientDetails.medtechImages.length})
                    </h3>
                    {(() => {
                      const images = patientDetails.screeningType === "OROSCAN" 
                        ? patientDetails.oroscanImages 
                        : patientDetails.medtechImages
                      
                      if (images.length === 0) {
                        return <p className="text-slate-500 dark:text-slate-400 text-center py-4">No images uploaded</p>
                      }
                      
                      return (
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                          {images.map((img) => (
                            <div 
                              key={img.id} 
                              className="relative aspect-square rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-700 cursor-pointer hover:border-blue-500 transition-colors"
                              onClick={() => setSelectedImage(img.url)}
                            >
                              <img 
                                src={img.url} 
                                alt={img.type}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5">
                                <p className="text-xs text-white truncate">{img.type}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    })()}
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-6 h-6" />
          </Button>
          <img 
            src={selectedImage} 
            alt="Preview"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Export Patient Data</DialogTitle>
            <DialogDescription>
              Select the screening type and format to export
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Screening Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Screening Type
              </label>
              <div className="flex gap-3">
                <button
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    exportType === "OROSCAN" 
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400" 
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                  onClick={() => setExportType("OROSCAN")}
                >
                  <Scan className="w-5 h-5" />
                  <span className="font-medium">Oral Cancer</span>
                </button>
                <button
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    exportType === "MEDTECH" 
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400" 
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                  onClick={() => setExportType("MEDTECH")}
                >
                  <Droplet className="w-5 h-5" />
                  <span className="font-medium">Anaemia</span>
                </button>
              </div>
              <p className="text-xs text-slate-500">
                {exportType === "OROSCAN" 
                  ? `${patients.filter(p => p.screeningType === "OROSCAN").length} patients available`
                  : `${patients.filter(p => p.screeningType === "MEDTECH").length} patients available`
                }
              </p>
            </div>

            {/* Export Format Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Export Format
              </label>
              <div className="flex gap-3">
                <button
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    exportFormat === "excel" 
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" 
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                  onClick={() => setExportFormat("excel")}
                >
                  <span className="font-medium">Excel (.xlsx)</span>
                </button>
                <button
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    exportFormat === "csv" 
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" 
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                  onClick={() => setExportFormat("csv")}
                >
                  <span className="font-medium">CSV</span>
                </button>
              </div>
            </div>

            {/* Format Info */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong>Export includes:</strong> Patient info (Name, Age, Gender, Phone, Address) + 
                all screening questions as columns with patient responses in rows
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={exportData}
              disabled={exportLoading}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              {exportLoading ? "Exporting..." : "Export"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Patient Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Patient</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete patient {selectedPatient?.name} (#{selectedPatient?.screeningNumber})? 
              This will also delete all associated screening data and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeletePatient}
              disabled={actionLoading}
            >
              {actionLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Patient Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
            <DialogDescription>
              Update information for #{selectedPatient?.screeningNumber} • {selectedPatient?.screeningType === "OROSCAN" ? "Oral Cancer Screening" : "Anemia Screening"}
            </DialogDescription>
          </DialogHeader>
          
          {editLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="space-y-6 py-4">
              {/* Patient Info Section */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  Patient Information
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 dark:text-slate-400">Name</label>
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="Patient name"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 dark:text-slate-400">Age</label>
                    <Input
                      type="number"
                      value={editForm.age}
                      onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                      placeholder="Age"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 dark:text-slate-400">Gender</label>
                    <select
                      value={editForm.gender}
                      onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                      className="w-full h-9 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 dark:text-slate-400">Phone</label>
                    <Input
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="Phone number"
                    />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-xs text-slate-500 dark:text-slate-400">Address</label>
                    <Input
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      placeholder="Address"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 dark:text-slate-400">Health Assistant</label>
                    <Input
                      value={editForm.healthAssistant}
                      onChange={(e) => setEditForm({ ...editForm, healthAssistant: e.target.value })}
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>

              {/* Responses Section */}
              {editPatientDetails && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Screening Responses
                  </h3>
                  {(() => {
                    const responses = editPatientDetails.screeningType === "OROSCAN" 
                      ? editPatientDetails.oroscanResponses 
                      : editPatientDetails.medtechResponses
                    const groupedResponses: Record<string, typeof responses> = {}
                    responses.forEach(r => {
                      const category = r.question?.category || "other"
                      if (!groupedResponses[category]) {
                        groupedResponses[category] = []
                      }
                      groupedResponses[category].push(r)
                    })
                    
                    if (Object.keys(groupedResponses).length === 0) {
                      return <p className="text-slate-500 dark:text-slate-400 text-center py-4">No responses to edit</p>
                    }
                    
                    return (
                      <div className="space-y-4">
                        {Object.entries(groupedResponses).map(([category, categoryResponses]) => (
                          <div key={category} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                            <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              {category.replace(/_/g, " ")}
                            </h4>
                            <div className="space-y-2">
                              {categoryResponses.map((response) => {
                                const questionText = response.question?.text || ""
                                const isImageQuestion = ["asymmetry", "patches_image", "lumps_mouth"].includes(questionText.toLowerCase())
                                const imageOptions = isImageQuestion ? getImageOptionsForQuestion(questionText) : []
                                const currentAnswer = editResponses[response.id]?.answer || response.answer
                                
                                return (
                                  <div key={response.id} className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
                                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">{questionText}</p>
                                    
                                    {isImageQuestion ? (
                                      <div className="grid grid-cols-5 md:grid-cols-7 gap-2">
                                        {imageOptions.map((img) => (
                                          <div 
                                            key={img.id}
                                            onClick={() => setEditResponses({
                                              ...editResponses,
                                              [response.id]: { ...editResponses[response.id], answer: img.id }
                                            })}
                                            className={cn(
                                              "relative aspect-square rounded overflow-hidden border-2 cursor-pointer transition-all",
                                              currentAnswer === img.id
                                                ? "border-blue-500 ring-2 ring-blue-500"
                                                : "border-slate-200 dark:border-slate-700 hover:border-blue-300"
                                            )}
                                          >
                                            <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                                            {currentAnswer === img.id && (
                                              <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                        <div 
                                          onClick={() => setEditResponses({
                                            ...editResponses,
                                            [response.id]: { ...editResponses[response.id], answer: "none" }
                                          })}
                                          className={cn(
                                            "aspect-square rounded border-2 cursor-pointer transition-all flex items-center justify-center text-xs",
                                            currentAnswer === "none"
                                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-600"
                                              : "border-slate-200 dark:border-slate-700 hover:border-blue-300 text-slate-500"
                                          )}
                                        >
                                          None
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex gap-2">
                                        <button
                                          type="button"
                                          onClick={() => setEditResponses({
                                            ...editResponses,
                                            [response.id]: { ...editResponses[response.id], answer: "yes" }
                                          })}
                                          className={cn(
                                            "px-3 py-1 rounded text-sm font-medium transition-colors",
                                            currentAnswer === "yes"
                                              ? "bg-green-600 text-white"
                                              : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-green-100"
                                          )}
                                        >
                                          Yes
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setEditResponses({
                                            ...editResponses,
                                            [response.id]: { ...editResponses[response.id], answer: "no" }
                                          })}
                                          className={cn(
                                            "px-3 py-1 rounded text-sm font-medium transition-colors",
                                            currentAnswer === "no"
                                              ? "bg-red-600 text-white"
                                              : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-red-100"
                                          )}
                                        >
                                          No
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                </div>
              )}

              {/* Images Section */}
              {editPatientDetails && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    Uploaded Images
                    <span className="text-xs font-normal text-slate-500">(click X to delete)</span>
                  </h3>
                  {(() => {
                    const images = editPatientDetails.screeningType === "OROSCAN" 
                      ? editPatientDetails.oroscanImages 
                      : editPatientDetails.medtechImages
                    const visibleImages = images.filter(img => !deletedImageIds.includes(img.id))
                    
                    if (visibleImages.length === 0 && deletedImageIds.length === 0) {
                      return <p className="text-slate-500 dark:text-slate-400 text-center py-4">No images uploaded</p>
                    }
                    
                    return (
                      <>
                        <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                          {visibleImages.map((img) => (
                            <div key={img.id} className="relative group">
                              <div className="aspect-square rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                                <img src={img.url} alt={img.type} className="w-full h-full object-cover" />
                              </div>
                              <button
                                type="button"
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                onClick={() => setDeletedImageIds([...deletedImageIds, img.id])}
                              >
                                <X className="w-3 h-3" />
                              </button>
                              <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-1 truncate">{img.type}</p>
                            </div>
                          ))}
                        </div>
                        
                        {deletedImageIds.length > 0 && (
                          <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-between">
                            <p className="text-sm text-red-600 dark:text-red-400">
                              {deletedImageIds.length} image(s) will be deleted
                            </p>
                            <button
                              type="button"
                              className="text-sm text-red-600 dark:text-red-400 underline hover:no-underline"
                              onClick={() => setDeletedImageIds([])}
                            >
                              Undo
                            </button>
                          </div>
                        )}
                      </>
                    )
                  })()}
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEditPatient}
              disabled={actionLoading || editLoading}
            >
              {actionLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
