"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  FileText,
  ImageIcon,
  Loader2,
  Activity
} from "lucide-react"

interface PatientDetail {
  id: string
  screeningNumber: string
  name: string
  age: number
  gender: string
  phone: string
  healthAssistant: string | null
  address: string
  screeningType: "OROSCAN" | "MEDTECH"
  createdAt: string
  createdBy: {
    name: string | null
    email: string
  }
  oroscanResponses: Array<{
    id: string
    category: string
    question: string
    answer: string
    duration: string | null
  }>
  oroscanImages: Array<{
    id: string
    url: string
    type: string
    createdAt: string
  }>
  oroscanDiagnosis: {
    result: string
    confidence: number
    metadata: unknown
  } | null
  medtechResponses: Array<{
    id: string
    category: string
    question: string
    answer: string
  }>
  medtechImages: Array<{
    id: string
    url: string
    type: string
    createdAt: string
  }>
}

export default function PatientDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [patient, setPatient] = useState<PatientDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  const fetchPatientDetails = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/dashboard/patients/${params.id}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch patient details")
      }
      
      const data = await response.json()
      setPatient(data)
      setError(null)
    } catch (err) {
      console.error("Error fetching patient:", err)
      setError("Failed to load patient details")
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    if (session && params.id) {
      fetchPatientDetails()
    }
  }, [session, params.id, fetchPatientDetails])

  // Map question IDs to their corresponding image paths
  const getSelectedImageUrl = (question: string, answer: string): string | null => {
    if (answer === "none" || answer === "yes" || answer === "no") return null
    
    const questionLower = question.toLowerCase()
    
    if (questionLower.includes("asymmetry")) {
      return `/mouth/assymetry.png`
    }
    if (questionLower.includes("patch") || questionLower.includes("red") || questionLower.includes("white")) {
      return `/mouth/patch-${answer}.png`
    }
    if (questionLower.includes("lump") && questionLower.includes("mouth")) {
      return `/mouth/lumps-${answer}.png`
    }
    
    return null
  }

  // Group responses by category
  const groupResponsesByCategory = (responses: Array<{ category: string; question: string; answer: string; duration?: string | null }>) => {
    const grouped: Record<string, typeof responses> = {}
    responses.forEach(r => {
      if (!grouped[r.category]) {
        grouped[r.category] = []
      }
      grouped[r.category].push(r)
    })
    return grouped
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-slate-600 dark:text-slate-400">Loading patient details...</p>
        </div>
      </div>
    )
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || "Patient not found"}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  const isOroscan = patient.screeningType === "OROSCAN"
  const responses = isOroscan ? patient.oroscanResponses : patient.medtechResponses
  const images = isOroscan ? patient.oroscanImages : patient.medtechImages
  const groupedResponses = groupResponsesByCategory(responses)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Patient Details</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Screening Number ID: <span className="font-mono font-bold">{patient.screeningNumber}</span>
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              isOroscan 
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" 
                : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
            }`}>
              {isOroscan ? "Oral Cancer Screening" : "Anemia Screening"}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient Info Card */}
          <Card className="border-slate-200 dark:border-slate-700 shadow-md bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <User className="w-5 h-5 text-blue-600" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Full Name</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">{patient.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Age</p>
                  <p className="font-medium text-slate-900 dark:text-white">{patient.age} years</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Gender</p>
                  <p className="font-medium text-slate-900 dark:text-white capitalize">{patient.gender}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-slate-400 mt-1" />
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Phone</p>
                  <p className="font-medium text-slate-900 dark:text-white">{patient.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 mt-1" />
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Address</p>
                  <p className="font-medium text-slate-900 dark:text-white">{patient.address}</p>
                </div>
              </div>
              {patient.healthAssistant && (
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Health Assistant</p>
                  <p className="font-medium text-slate-900 dark:text-white">{patient.healthAssistant}</p>
                </div>
              )}
              <div className="flex items-start gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Calendar className="w-4 h-4 text-slate-400 mt-1" />
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Screening Date</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {new Date(patient.createdAt).toLocaleDateString()} at {new Date(patient.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Responses Section */}
          <Card className="lg:col-span-2 border-slate-200 dark:border-slate-700 shadow-md bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <FileText className="w-5 h-5 text-blue-600" />
                Screening Responses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(groupedResponses).length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 text-center py-8">No responses recorded</p>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedResponses).map(([category, categoryResponses]) => (
                    <div key={category}>
                      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        {category.replace(/_/g, " ")}
                      </h3>
                      <div className="space-y-3">
                        {categoryResponses.map((response, idx) => {
                          const selectedImageUrl = getSelectedImageUrl(response.question, response.answer)
                          
                          return (
                            <div 
                              key={idx} 
                              className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="text-sm text-slate-700 dark:text-slate-300">{response.question}</p>
                                  {response.duration && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Duration: {response.duration}</p>
                                  )}
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  response.answer.toLowerCase() === "yes" 
                                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                    : response.answer.toLowerCase() === "no"
                                      ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                                      : response.answer === "none"
                                        ? "bg-slate-100 text-slate-700 dark:bg-slate-600 dark:text-slate-300"
                                        : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                }`}>
                                  {response.answer === "none" ? "None of above" : response.answer}
                                </span>
                              </div>
                              
                              {/* Show selected image if applicable */}
                              {selectedImageUrl && (
                                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Selected Image:</p>
                                  <div 
                                    className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-blue-500 cursor-pointer hover:opacity-90 transition-opacity"
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
              )}
            </CardContent>
          </Card>

          {/* Images Section */}
          <Card className="lg:col-span-3 border-slate-200 dark:border-slate-700 shadow-md bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                Uploaded Images ({images.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {images.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 text-center py-8">No images uploaded</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {images.map((img) => (
                    <div 
                      key={img.id} 
                      className="relative aspect-square rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-700 cursor-pointer hover:border-blue-500 transition-colors"
                      onClick={() => setSelectedImage(img.url)}
                    >
                      {img.url.startsWith("data:") ? (
                        // Base64 image
                        <img 
                          src={img.url} 
                          alt={img.type}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Image 
                          src={img.url} 
                          alt={img.type}
                          fill
                          className="object-cover"
                        />
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                        <p className="text-xs text-white truncate">{img.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Diagnosis Section (for Oroscan) */}
          {isOroscan && patient.oroscanDiagnosis && (
            <Card className="lg:col-span-3 border-slate-200 dark:border-slate-700 shadow-md bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Diagnosis Result
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Result</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{patient.oroscanDiagnosis.result}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Confidence Score</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-200 dark:bg-slate-600 rounded-full h-3">
                        <div 
                          className="bg-blue-600 h-full rounded-full"
                          style={{ width: `${(patient.oroscanDiagnosis.confidence || 0) * 100}%` }}
                        />
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {((patient.oroscanDiagnosis.confidence || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-12 right-0 text-white hover:bg-white/20"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </Button>
            <img 
              src={selectedImage} 
              alt="Full size"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  )
}
