"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { PatientFormData, initialFormData } from "@/types/form"

// Patient Info Form
import { PatientInfoForm } from "@/components/patient-info-form"

// Screening Type Selection
import { ScreeningSelect } from "@/components/screening-select"

// Oroscan Steps
import { MedicalHistory } from "@/components/oroscan/medical-history"
import { FamilyHistory } from "@/components/oroscan/family-history"
import { Features } from "@/components/oroscan/features"
import { ImageUpload as OroscanImageUpload } from "@/components/oroscan/image-upload"

// Medtech Steps (multi-step like Oroscan)
import { DietaryHabits } from "@/components/medtech/dietary-habits"
import { MedicalHistoryStep } from "@/components/medtech/medical-history-step"
import { LifestyleHealth } from "@/components/medtech/lifestyle-health"
import { DeviceInput } from "@/components/medtech/device-input"

// Success Component
import { SuccessScreen } from "@/components/success-screen"

type ScreeningType = "OROSCAN" | "MEDTECH" | null

type Step = 
  | "patient-info"
  | "select-type"
  | "oroscan-medical"
  | "oroscan-family"
  | "oroscan-features"
  | "oroscan-images"
  | "medtech-dietary"
  | "medtech-medical"
  | "medtech-lifestyle"
  | "medtech-device"
  | "success"

const OROSCAN_STEPS: Step[] = ["patient-info", "select-type", "oroscan-medical", "oroscan-family", "oroscan-features", "oroscan-images", "success"]
const MEDTECH_STEPS: Step[] = ["patient-info", "select-type", "medtech-dietary", "medtech-medical", "medtech-lifestyle", "medtech-device", "success"]

// Compute initial state from sessionStorage
function getInitialState(): { 
  formData: PatientFormData
  step: Step
  screeningType: ScreeningType 
} {
  if (typeof window === "undefined") {
    return { formData: initialFormData, step: "patient-info", screeningType: null }
  }
  
  const savedProfile = sessionStorage.getItem("screeningProfile")
  const savedType = sessionStorage.getItem("screeningType")
  
  if (!savedProfile) {
    return { formData: initialFormData, step: "patient-info", screeningType: null }
  }
  
  try {
    const profile = JSON.parse(savedProfile)
    const formData: PatientFormData = {
      ...initialFormData,
      name: profile.name || "",
      age: profile.age || "",
      gender: profile.gender || "",
      phone: profile.phone || "",
      healthAssistant: profile.healthAssistant || "",
      address: profile.address || ""
    }
    
    // Determine initial step
    if (profile.name && profile.age && profile.gender && profile.phone) {
      if (savedType === "OROSCAN") {
        return { formData, step: "oroscan-medical", screeningType: "OROSCAN" }
      } else if (savedType === "MEDTECH") {
        return { formData, step: "medtech-dietary", screeningType: "MEDTECH" }
      } else {
        return { formData, step: "select-type", screeningType: null }
      }
    }
    
    return { formData, step: "patient-info", screeningType: null }
  } catch (e) {
    console.error("Error parsing profile data:", e)
    return { formData: initialFormData, step: "patient-info", screeningType: null }
  }
}

export default function ScreeningFlowPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get screening type from URL query param
  const typeFromUrl = searchParams.get("type") as ScreeningType

  // Initialize all state - reset when coming from dashboard with type param
  const [initialState] = useState(() => {
    // If type is specified in URL, start fresh (coming from dashboard)
    if (typeof window !== "undefined" && searchParams.get("type")) {
      sessionStorage.removeItem("screeningProfile")
      sessionStorage.removeItem("screeningType")
      return { formData: initialFormData, step: "patient-info" as Step, screeningType: searchParams.get("type") as ScreeningType }
    }
    return getInitialState()
  })
  
  const [step, setStep] = useState<Step>(initialState.step)
  const [screeningType, setScreeningType] = useState<ScreeningType>(initialState.screeningType)
  const [formData, setFormData] = useState<PatientFormData>(initialState.formData)
  const [result, setResult] = useState<{ patientId: string; screeningNumber: string } | null>(null)
  
  // Medtech step data
  const [dietaryData, setDietaryData] = useState<Record<string, string>>({})
  const [medicalData, setMedicalData] = useState<Record<string, string>>({})
  const [lifestyleData, setLifestyleData] = useState<Record<string, string>>({})

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  // Define steps - skip select-type when type is pre-selected from URL
  const getSteps = () => {
    if (screeningType === "OROSCAN") {
      return typeFromUrl ? ["patient-info", "oroscan-medical", "oroscan-family", "oroscan-features", "oroscan-images", "success"] : OROSCAN_STEPS
    }
    if (screeningType === "MEDTECH") {
      return typeFromUrl ? ["patient-info", "medtech-dietary", "medtech-medical", "medtech-lifestyle", "medtech-device", "success"] : MEDTECH_STEPS
    }
    return ["patient-info", "select-type"]
  }

  const goNext = () => {
    const steps = getSteps()
    const currentIndex = steps.indexOf(step)
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1] as Step)
    }
  }

  const goBack = () => {
    const steps = getSteps()
    const currentIndex = steps.indexOf(step)
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1] as Step)
    }
  }

  const handleSelectScreeningType = (type: ScreeningType) => {
    setScreeningType(type)
    if (type === "OROSCAN") {
      setStep("oroscan-medical")
    } else if (type === "MEDTECH") {
      setStep("medtech-dietary")
    }
  }

  const handleSuccess = (data: { patientId: string; screeningNumber: string }) => {
    setResult(data)
    setStep("success")
  }

  const handleNewScreening = () => {
    setFormData(initialFormData)
    setScreeningType(null)
    setResult(null)
    setDietaryData({})
    setMedicalData({})
    setLifestyleData({})
    setStep("patient-info")
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {step === "patient-info" && (
            <PatientInfoForm 
              data={formData}
              onUpdate={(data) => setFormData(prev => ({ ...prev, ...data }))}
              onNext={goNext}
            />
          )}

          {step === "select-type" && (
            <ScreeningSelect 
              onSelect={handleSelectScreeningType}
              onBack={goBack}
            />
          )}

          {/* Oroscan Steps */}
          {step === "oroscan-medical" && (
            <MedicalHistory
              data={formData.oroscan.medicalResponses}
              onUpdate={(responses) => setFormData(prev => ({
                ...prev,
                oroscan: { ...prev.oroscan, medicalResponses: responses }
              }))}
              onNext={goNext}
              onBack={goBack}
            />
          )}

          {step === "oroscan-family" && (
            <FamilyHistory
              data={formData.oroscan.familyResponses}
              onUpdate={(responses) => setFormData(prev => ({
                ...prev,
                oroscan: { ...prev.oroscan, familyResponses: responses }
              }))}
              onNext={goNext}
              onBack={goBack}
            />
          )}

          {step === "oroscan-features" && (
            <Features
              data={formData.oroscan.featureResponses}
              onUpdate={(responses) => setFormData(prev => ({
                ...prev,
                oroscan: { ...prev.oroscan, featureResponses: responses }
              }))}
              onNext={goNext}
              onBack={goBack}
            />
          )}

          {step === "oroscan-images" && (
            <OroscanImageUpload
              patientInfo={formData}
              medicalResponses={formData.oroscan.medicalResponses}
              familyResponses={formData.oroscan.familyResponses}
              featureResponses={formData.oroscan.featureResponses}
              onSuccess={handleSuccess}
              onBack={goBack}
            />
          )}

          {/* Medtech Steps - Multi-step like Oroscan */}
          {step === "medtech-dietary" && (
            <DietaryHabits
              data={dietaryData}
              onUpdate={setDietaryData}
              onNext={goNext}
              onBack={goBack}
            />
          )}

          {step === "medtech-medical" && (
            <MedicalHistoryStep
              data={medicalData}
              onUpdate={setMedicalData}
              onNext={goNext}
              onBack={goBack}
            />
          )}

          {step === "medtech-lifestyle" && (
            <LifestyleHealth
              data={lifestyleData}
              onUpdate={setLifestyleData}
              onNext={goNext}
              onBack={goBack}
            />
          )}

          {step === "medtech-device" && (
            <DeviceInput
              patientInfo={{
                name: formData.name,
                phone: formData.phone,
                age: formData.age,
                gender: formData.gender,
                address: formData.address
              }}
              dietaryData={dietaryData}
              medicalData={medicalData}
              lifestyleData={lifestyleData}
              onSuccess={handleSuccess}
              onBack={goBack}
            />
          )}

          {/* Success */}
          {step === "success" && result && (
            <SuccessScreen
              screeningNumber={result.screeningNumber}
              screeningType={screeningType!}
              onNewScreening={handleNewScreening}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
