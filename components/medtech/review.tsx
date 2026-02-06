"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import ProgressBar from "@/components/progress-bar"
import { ArrowLeft, Upload, CheckCircle } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"
import { PatientFormData } from "@/types/form"

interface ReviewProps {
  patientInfo: PatientFormData
  healthData: Record<string, string>
  medicalData: Record<string, string>
  onSuccess: (result: { patientId: string; screeningNumber: string }) => void
  onBack: () => void
}

// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

export function Review({ patientInfo, healthData, medicalData, onSuccess, onBack }: ReviewProps) {
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { t } = useTranslation("device")
  const { t: tc } = useTranslation("common")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      
      // Convert files to base64
      const filePromises = files.map(async (file) => ({
        name: file.name,
        type: file.type,
        data: await fileToBase64(file),
        category: "nail-eye-upload",
      }))

      const uploadedFiles = await Promise.all(filePromises)

      // Prepare form data
      const submitData = {
        screeningType: "MEDTECH",
        patientInfo: {
          name: patientInfo.name,
          age: patientInfo.age,
          gender: patientInfo.gender,
          phone: patientInfo.phone,
          healthAssistant: patientInfo.healthAssistant,
          address: patientInfo.address,
        },
        healthData,
        medicalData,
        images: uploadedFiles,
      }

      // Submit to API
      const response = await fetch("/api/screening/medtech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        throw new Error("Submission failed")
      }

      const result = await response.json()
      onSuccess({ patientId: result.patientId, screeningNumber: result.screeningNumber })
    } catch (error) {
      console.error("Error submitting data:", error)
      alert("There was an error submitting your data. Please try again.")
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-muted-foreground">Step 3 of 3</span>
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
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-card dark:bg-slate-800 rounded-2xl shadow-lg p-8 space-y-8 border border-border dark:border-slate-700 transition-colors duration-300"
        >
          <motion.h2 variants={itemVariants} className="text-2xl font-bold text-foreground dark:text-slate-100">
            Review & Submit
          </motion.h2>

          {/* Summary */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="font-semibold text-lg">Patient Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Name:</span> {patientInfo.name}</div>
              <div><span className="text-muted-foreground">Age:</span> {patientInfo.age}</div>
              <div><span className="text-muted-foreground">Gender:</span> {patientInfo.gender}</div>
              <div><span className="text-muted-foreground">Phone:</span> {patientInfo.phone}</div>
            </div>
          </motion.div>

          {/* Optional Image Upload */}
          <motion.div variants={itemVariants}>
            <h3 className="font-semibold text-lg mb-4">Upload Images (Optional)</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You can upload photos of nails or eyes for anemia screening analysis.
            </p>
            <div className="bg-blue-50 dark:bg-blue-950 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-6 transition-colors duration-300">
              <label className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-300">
                <div className="text-center">
                  <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">{t("chooseFiles")}</span>
                  <p className="text-sm text-muted-foreground dark:text-slate-400 mt-1">{t("dragDrop")}</p>
                </div>
                <input type="file" multiple onChange={handleFileChange} className="hidden" accept="image/*" />
              </label>
            </div>
          </motion.div>

          {files.length > 0 && (
            <motion.div
              variants={itemVariants}
              className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 transition-colors duration-300"
            >
              <p className="text-green-900 dark:text-green-200 font-semibold mb-3">
                {files.length} {t("filesSelected")}:
              </p>
              <ul className="space-y-2">
                {files.map((file, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {file.name}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex justify-between pt-6 border-t border-border dark:border-slate-700"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={onBack}
                disabled={isSubmitting}
                variant="outline"
                className="bg-transparent border-amber-500 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950 font-semibold px-8 py-3 rounded-lg flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> {tc("back")}
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold px-8 py-3 rounded-lg flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin">⏳</span> {t("processing")}
                  </>
                ) : (
                  <>
                    {t("submit")} <CheckCircle className="w-4 h-4" />
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
