import { en } from "./translations/en"
import { hi } from "./translations/hi"
import { bn } from "./translations/bn"

export type Language = "en" | "hi" | "bn"

export type TranslationKey = keyof typeof en
export type NestedTranslationKey<T extends TranslationKey> = keyof typeof en[T]

// All available translations
export const translations = {
  en,
  hi,
  bn,
}

// Helper function to get nested translation values
export function getTranslation<T extends TranslationKey>(
  lang: Language,
  section: T,
  key: NestedTranslationKey<T>,
): string {
  return translations[lang][section][key as keyof typeof translations[Language][T]] as string
}

// Helper to get full section translations
export function getTranslationSection<T extends TranslationKey>(
  lang: Language,
  section: T,
): typeof translations[Language][T] {
  return translations[lang][section]
}

// Get language name in its native script
export function getLanguageName(lang: Language): string {
  const names = {
    en: "English",
    hi: "हिंदी",
    bn: "বাংলা",
  }
  return names[lang]
}

// Browser language detection
export function detectBrowserLanguage(): Language {
  const lang = typeof window !== "undefined" 
    ? window.navigator.language.split("-")[0]
    : "en"
  
  return (["en", "hi", "bn"].includes(lang) ? lang : "en") as Language
}
