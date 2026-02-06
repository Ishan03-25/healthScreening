"use client"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Upload, Camera, CheckCircle } from "lucide-react"
import ProgressBar from "@/components/progress-bar"
import { useTranslation } from "@/hooks/use-translation"

interface DeviceInputProps {
  patientInfo: {
    name: string
    phone: string
    age: string
    gender: string
    address: string
  }
  dietaryData: Record<string, string>
  medicalData: Record<string, string>
  lifestyleData: Record<string, string>
  onSuccess: (data: { patientId: string; screeningNumber: string }) => void
  onBack: () => void
}

export function DeviceInput({ 
  patientInfo, 
  dietaryData, 
  medicalData, 
  lifestyleData, 
  onSuccess, 
  onBack 
}: DeviceInputProps) {
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { t } = useTranslation("anemiaDevice")
  const { t: tc } = useTranslation("common")

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles) {
      setFiles(Array.from(selectedFiles))
    }
  }, [])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Combine all health data
      const healthData = {
        ...dietaryData,
        ...medicalData,
        ...lifestyleData,
      }

      const response = await fetch("/api/screening/medtech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientInfo,
          healthData,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit screening")
      }

      const result = await response.json()
      onSuccess({ patientId: result.patientId, screeningNumber: result.screeningNumber })
    } catch (err) {
      console.error("Error submitting screening:", err)
      setError("Failed to submit screening. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-muted-foreground">Step 4 of 4</span>
          <div className="flex-1">
            <ProgressBar progress={100} />
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={itemVariants} className="flex items-center gap-3">
            <Camera className="w-8 h-8 text-purple-600" />
            <div>
              <h2 className="text-2xl font-bold text-foreground">Device Input</h2>
              <p className="text-muted-foreground">Upload images from the screening device</p>
            </div>
          </motion.div>

          <Card>
            <CardContent className="pt-6">
              <motion.div variants={itemVariants}>
                <div className="border rounded-lg p-4 bg-card">
                  <p className="text-red-500 font-medium mb-3">Input from the device</p>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="device-input"
                    />
                    <label htmlFor="device-input" className="cursor-pointer">
                      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-lg font-medium text-gray-600 mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-gray-500">
                        PNG, JPG up to 10MB
                      </p>
                    </label>
                  </div>

                  {files.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-green-600 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        {files.length} file(s) selected
                      </p>
                      <ul className="mt-2 space-y-1">
                        {files.map((file, index) => (
                          <li key={index} className="text-sm text-gray-600">
                            {file.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>

              {error && (
                <motion.div variants={itemVariants} className="mt-4">
                  <p className="text-red-500 text-sm">{error}</p>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <motion.div variants={itemVariants} className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack} className="gap-2" disabled={isSubmitting}>
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-sm text-muted-foreground">
          © Copyright <span className="text-red-500 font-medium">Anemia Screening</span>. All Rights Reserved
        </div>
      </div>
    </div>
  )
}
