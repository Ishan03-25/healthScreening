"use client"

import { useLanguage } from "@/components/language-provider"
import { 
  TranslationKey, 
  NestedTranslationKey, 
  getTranslation,
  getTranslationSection,
} from "@/lib/i18n"

export function useTranslation<T extends TranslationKey>(section: T) {
  const { language } = useLanguage()

  const t = (key: NestedTranslationKey<T>) => {
    return getTranslation(language, section, key)
  }

  const all = () => {
    return getTranslationSection(language, section)
  }

  return { t, all }
}
