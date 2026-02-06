"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"

interface AnemiaScreeningFormProps {
  patientData: {
    name: string
    phone: string
    age: string
    gender: string
    address: string
  }
  onPatientUpdate: (data: Record<string, string>) => void
  onSubmit: (data: MedtechFormData) => void
  onBack: () => void
  isSubmitting?: boolean
}

export interface MedtechFormData {
  // Patient Info
  fullName: string
  phone: string
  age: string
  gender: string
  height: string
  weight: string
  address: string
  
  // Health and Dietary Habits
  fruitsVegetablesFrequency: string
  consumesIronRichFoods: string
  feelsTiredOrWeak: string
  feelsDizzyOrHeadaches: string
  
  // Menstrual Health
  hasStartedMenstruating: string
  
  // Medical History
  bleedingPast7Days: string
  diagnosedWithAnemia: string
  takingMedications: string
  
  // Lifestyle
  regularPhysicalActivity: string
  energyLevels: string
  
  // General Health
  unexplainedWeightLoss: string
  chronicHealthConditions: string
  
  // Device Input
  deviceImages: File[]
}

const initialMedtechData: MedtechFormData = {
  fullName: "",
  phone: "",
  age: "",
  gender: "",
  height: "",
  weight: "",
  address: "",
  fruitsVegetablesFrequency: "",
  consumesIronRichFoods: "",
  feelsTiredOrWeak: "",
  feelsDizzyOrHeadaches: "",
  hasStartedMenstruating: "",
  bleedingPast7Days: "",
  diagnosedWithAnemia: "",
  takingMedications: "",
  regularPhysicalActivity: "",
  energyLevels: "",
  unexplainedWeightLoss: "",
  chronicHealthConditions: "",
  deviceImages: []
}

// Yes/No Button Component
function YesNoButtons({ 
  value, 
  onChange 
}: { 
  value: string
  onChange: (val: string) => void 
}) {
  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant={value === "Yes" ? "default" : "outline"}
        size="sm"
        onClick={() => onChange("Yes")}
        className={value === "Yes" ? "bg-blue-600 hover:bg-blue-700" : ""}
      >
        Yes
      </Button>
      <Button
        type="button"
        variant={value === "No" ? "default" : "outline"}
        size="sm"
        onClick={() => onChange("No")}
        className={value === "No" ? "bg-blue-600 hover:bg-blue-700" : ""}
      >
        No
      </Button>
    </div>
  )
}

// Three Option Button Component
function ThreeOptionButtons({ 
  options, 
  value, 
  onChange 
}: { 
  options: string[]
  value: string
  onChange: (val: string) => void 
}) {
  return (
    <div className="flex gap-2">
      {options.map((option) => (
        <Button
          key={option}
          type="button"
          variant={value === option ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(option)}
          className={value === option ? "bg-blue-600 hover:bg-blue-700" : ""}
        >
          {option}
        </Button>
      ))}
    </div>
  )
}

// Question Card Component
function QuestionCard({ 
  question, 
  children 
}: { 
  question: string
  children: React.ReactNode 
}) {
  return (
    <div className="border rounded-lg p-4 bg-card">
      <p className="text-red-500 font-medium mb-3">{question}</p>
      {children}
    </div>
  )
}

export function AnemiaScreeningForm({ 
  patientData, 
  onPatientUpdate,
  onSubmit, 
  onBack,
  isSubmitting = false 
}: AnemiaScreeningFormProps) {
  const [formData, setFormData] = useState<MedtechFormData>({
    ...initialMedtechData,
    fullName: patientData.name || "",
    phone: patientData.phone || "",
    age: patientData.age || "",
    gender: patientData.gender || "",
    address: patientData.address || ""
  })
  const { t } = useTranslation("common")

  const handleChange = useCallback((field: keyof MedtechFormData, value: string | File[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      setFormData(prev => ({ ...prev, deviceImages: Array.from(files) }))
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <form onSubmit={handleSubmit}>
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
            
            {/* Patient Information */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name<span className="text-red-500">*</span>:</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      placeholder=""
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone<span className="text-red-500">*</span>:</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder=""
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="age">Age<span className="text-red-500">*</span>:</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleChange("age", e.target.value)}
                      placeholder=""
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <Label htmlFor="gender">Gender<span className="text-red-500">*</span>:</Label>
                    <Select value={formData.gender} onValueChange={(val) => handleChange("gender", val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="height">Height<span className="text-red-500">*</span>:</Label>
                    <div className="flex">
                      <Input
                        id="height"
                        type="number"
                        value={formData.height}
                        onChange={(e) => handleChange("height", e.target.value)}
                        placeholder=""
                        className="rounded-r-none"
                        required
                      />
                      <span className="inline-flex items-center px-3 border border-l-0 border-input bg-muted text-muted-foreground rounded-r-md">
                        cm
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="weight">Weight<span className="text-red-500">*</span>:</Label>
                    <div className="flex">
                      <Input
                        id="weight"
                        type="number"
                        value={formData.weight}
                        onChange={(e) => handleChange("weight", e.target.value)}
                        placeholder=""
                        className="rounded-r-none"
                        required
                      />
                      <span className="inline-flex items-center px-3 border border-l-0 border-input bg-muted text-muted-foreground rounded-r-md">
                        Kg
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Label htmlFor="address">Address<span className="text-red-500">*</span>:</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    placeholder=""
                    rows={3}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Health and Dietary Habits */}
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-semibold mb-4">Health and Dietary Habits:</h3>
              <div className="space-y-4">
                <QuestionCard question="How often do you eat fruits and vegetables?">
                  <ThreeOptionButtons
                    options={["Daily", "Occasionally", "Rarely"]}
                    value={formData.fruitsVegetablesFrequency}
                    onChange={(val) => handleChange("fruitsVegetablesFrequency", val)}
                  />
                </QuestionCard>
                
                <QuestionCard question="Do you consume iron-rich foods like green leafy vegetables, red meat, or beans?">
                  <YesNoButtons
                    value={formData.consumesIronRichFoods}
                    onChange={(val) => handleChange("consumesIronRichFoods", val)}
                  />
                </QuestionCard>
                
                <QuestionCard question="Have you had any recent episodes of feeling unusually tired or weak?">
                  <YesNoButtons
                    value={formData.feelsTiredOrWeak}
                    onChange={(val) => handleChange("feelsTiredOrWeak", val)}
                  />
                </QuestionCard>
                
                <QuestionCard question="Do you often feel dizzy or have headaches?">
                  <YesNoButtons
                    value={formData.feelsDizzyOrHeadaches}
                    onChange={(val) => handleChange("feelsDizzyOrHeadaches", val)}
                  />
                </QuestionCard>
              </div>
            </motion.div>

            {/* Menstrual Health */}
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-semibold mb-4">Menstrual Health (if applicable):</h3>
              <div className="space-y-4">
                <QuestionCard question="Have you started menstruating?">
                  <YesNoButtons
                    value={formData.hasStartedMenstruating}
                    onChange={(val) => handleChange("hasStartedMenstruating", val)}
                  />
                </QuestionCard>
              </div>
            </motion.div>

            {/* Medical History */}
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-semibold mb-4">Medical History:</h3>
              <div className="space-y-4">
                <QuestionCard question="Have you experienced any bleeding in the past 7 days?">
                  <YesNoButtons
                    value={formData.bleedingPast7Days}
                    onChange={(val) => handleChange("bleedingPast7Days", val)}
                  />
                </QuestionCard>
                
                <QuestionCard question="Have you ever been diagnosed with Anemia before?">
                  <YesNoButtons
                    value={formData.diagnosedWithAnemia}
                    onChange={(val) => handleChange("diagnosedWithAnemia", val)}
                  />
                </QuestionCard>
                
                <QuestionCard question="Are you currently taking any medications?">
                  <YesNoButtons
                    value={formData.takingMedications}
                    onChange={(val) => handleChange("takingMedications", val)}
                  />
                </QuestionCard>
              </div>
            </motion.div>

            {/* Lifestyle */}
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-semibold mb-4">Lifestyle:</h3>
              <div className="space-y-4">
                <QuestionCard question="Do you participate in regular physical activity or sports?">
                  <YesNoButtons
                    value={formData.regularPhysicalActivity}
                    onChange={(val) => handleChange("regularPhysicalActivity", val)}
                  />
                </QuestionCard>
                
                <QuestionCard question="How would you rate your overall energy levels on most days?">
                  <ThreeOptionButtons
                    options={["Low", "Moderate", "High"]}
                    value={formData.energyLevels}
                    onChange={(val) => handleChange("energyLevels", val)}
                  />
                </QuestionCard>
              </div>
            </motion.div>

            {/* General Health */}
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-semibold mb-4">General Health:</h3>
              <div className="space-y-4">
                <QuestionCard question="Have you experienced any recent unexplained weight loss?">
                  <YesNoButtons
                    value={formData.unexplainedWeightLoss}
                    onChange={(val) => handleChange("unexplainedWeightLoss", val)}
                  />
                </QuestionCard>
                
                <QuestionCard question="Do you have any chronic health conditions?">
                  <YesNoButtons
                    value={formData.chronicHealthConditions}
                    onChange={(val) => handleChange("chronicHealthConditions", val)}
                  />
                </QuestionCard>
              </div>
            </motion.div>

            {/* Input from device */}
            <motion.div variants={itemVariants}>
              <QuestionCard question="Input from the device">
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button type="button" variant="outline" size="sm" asChild>
                      <span>Choose Files</span>
                    </Button>
                  </label>
                  <span className="text-muted-foreground text-sm">
                    {formData.deviceImages.length > 0 
                      ? `${formData.deviceImages.length} file(s) selected` 
                      : "No file chosen"}
                  </span>
                </div>
              </QuestionCard>
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={itemVariants} className="flex justify-center pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </motion.div>

          </motion.div>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          © Copyright <span className="text-red-500 font-medium">Anemia Screening</span>. All Rights Reserved
        </div>
      </motion.div>
    </div>
  )
}
