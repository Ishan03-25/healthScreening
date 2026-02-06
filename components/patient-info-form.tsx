"use client"

import { User, Phone, MapPin, Users, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PatientFormData } from "@/types/form"
import { useTranslation } from "@/hooks/use-translation"

interface PatientInfoFormProps {
  data: PatientFormData
  onUpdate: (data: Partial<PatientFormData>) => void
  onNext: () => void
}

export function PatientInfoForm({ data, onUpdate, onNext }: PatientInfoFormProps) {
  const { t } = useTranslation("profile")

  const handleChange = (field: string, value: string) => {
    onUpdate({ [field]: value })
  }

  const isValid = () => {
    return data.name && data.age && data.gender && data.phone
  }

  const handleSubmit = () => {
    if (isValid()) {
      onNext()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-xl">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {t("title")}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400 text-base">
            {t("subtitle")}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Name, Age, Gender Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                {t("name")} <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder={t("namePlaceholder")}
                value={data.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="border-0 rounded-xl px-4 py-3 bg-blue-50/80 dark:bg-slate-700/50 focus:bg-blue-100/80 dark:focus:bg-slate-600/50 focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                {t("age")} <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                placeholder="0"
                value={data.age}
                onChange={(e) => handleChange("age", e.target.value)}
                className="border-0 rounded-xl px-4 py-3 bg-blue-50/80 dark:bg-slate-700/50 focus:bg-blue-100/80 dark:focus:bg-slate-600/50 focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                {t("gender")} <span className="text-red-500">*</span>
              </label>
              <select
                value={data.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
                className="w-full border-0 rounded-xl px-4 py-3 bg-blue-50/80 dark:bg-slate-700/50 focus:bg-blue-100/80 dark:focus:bg-slate-600/50 focus:ring-2 focus:ring-blue-500/50 text-gray-900 dark:text-white"
              >
                <option value="">{t("selectGender")}</option>
                <option value="male">{t("male")}</option>
                <option value="female">{t("female")}</option>
                <option value="other">{t("other")}</option>
              </select>
            </div>
          </div>

          {/* Phone and Health Assistant Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600" />
                {t("phone")} <span className="text-red-500">*</span>
              </label>
              <Input
                type="tel"
                placeholder={t("phonePlaceholder")}
                value={data.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="border-0 rounded-xl px-4 py-3 bg-blue-50/80 dark:bg-slate-700/50 focus:bg-blue-100/80 dark:focus:bg-slate-600/50 focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                {t("healthAssistant")}
              </label>
              <Input
                type="text"
                placeholder={t("healthAssistantPlaceholder")}
                value={data.healthAssistant}
                onChange={(e) => handleChange("healthAssistant", e.target.value)}
                className="border-0 rounded-xl px-4 py-3 bg-blue-50/80 dark:bg-slate-700/50 focus:bg-blue-100/80 dark:focus:bg-slate-600/50 focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              {t("address")}
            </label>
            <Input
              type="text"
              placeholder={t("addressPlaceholder")}
              value={data.address}
              onChange={(e) => handleChange("address", e.target.value)}
              className="border-0 rounded-xl px-4 py-3 bg-blue-50/80 dark:bg-slate-700/50 focus:bg-blue-100/80 dark:focus:bg-slate-600/50 focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <Button
              onClick={handleSubmit}
              disabled={!isValid()}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("continue")}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
