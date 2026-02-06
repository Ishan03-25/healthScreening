interface QuestionResponse {
  questionId: string
  answer: string
  duration?: string
}

interface OroscanData {
  medicalResponses: QuestionResponse[]
  familyResponses: QuestionResponse[]
  featureResponses: QuestionResponse[]
}

interface MedtechData {
  healthData: Record<string, string>
  medicalData: Record<string, string>
}

export interface PatientFormData {
  name: string
  age: string
  gender: string
  phone: string
  healthAssistant: string
  address: string
  screeningType?: "oroscan" | "medtech"
  // Oroscan specific (nested structure)
  oroscan: OroscanData
  // Medtech specific (nested structure)
  medtech: MedtechData
  // Legacy fields for backward compatibility
  medicalAnswers: Record<string, string>
  medicalDurations: Record<string, string>
  familyAnswers: Record<string, string>
  featureAnswers: Record<string, string>
  uploadedImages: File[]
  healthData: Record<string, string>
  medtechMedicalData: Record<string, string>
}

export interface PatientFormResponse {
  success: boolean
  patientId: string
  screeningNumber: string
  diagnosis?: {
    result: string
    confidence: number
    metadata: Record<string, unknown>
  }
}

export const initialFormData: PatientFormData = {
  name: "",
  age: "",
  gender: "",
  phone: "",
  healthAssistant: "",
  address: "",
  screeningType: undefined,
  oroscan: {
    medicalResponses: [],
    familyResponses: [],
    featureResponses: [],
  },
  medtech: {
    healthData: {},
    medicalData: {},
  },
  medicalAnswers: {},
  medicalDurations: {},
  familyAnswers: {},
  featureAnswers: {},
  uploadedImages: [],
  healthData: {},
  medtechMedicalData: {},
}
