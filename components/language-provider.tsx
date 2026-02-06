"use client"

import React, { createContext, useContext, useState } from "react"

export type Language = "en" | "hi" | "bn"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Common
    appName: "Health Screening Portal",
    selectScreeningType: "Select Screening Type",
    oroscan: "Oral Cancer Screening",
    medtech: "Anemia Screening",
    dashboard: "Dashboard",
    newScreening: "New Screening",
    patients: "Patients",
    reports: "Reports",
    settings: "Settings",
    logout: "Logout",
    login: "Login",
    
    // Screening selection
    chooseScreening: "Choose Your Screening Type",
    oroscanDesc: "Comprehensive oral cancer detection and assessment",
    medtechDesc: "Anemia detection through non-invasive analysis",
    startScreening: "Start Screening",
    viewDashboard: "View Dashboard",
    
    // Patient Info (Common)
    patientInfo: "Patient Information",
    fullName: "Full Name",
    age: "Age",
    gender: "Gender",
    male: "Male",
    female: "Female",
    other: "Other",
    phone: "Phone Number",
    address: "Address",
    
    // Common Medical History
    medicalHistory: "Medical History",
    historyOfHabits: "History of Habits",
    smoking: "Do you smoke?",
    alcohol: "Do you consume alcohol?",
    tobacco: "Do you use tobacco products?",
    
    // Navigation
    next: "Next",
    back: "Back",
    submit: "Submit",
    save: "Save",
    cancel: "Cancel",
    
    // Responses
    yes: "Yes",
    no: "No",
    unknown: "Unknown",
    
    // Steps
    step: "Step",
    of: "of",
    progress: "Progress",
    
    // Oroscan specific
    familyHistory: "Family History",
    oralFeatures: "Oral Features",
    imageCapture: "Image Capture",
    oralCancerHistory: "Family history of oral cancer?",
    mouthUlcers: "Do you have mouth ulcers?",
    difficultySwallowing: "Difficulty in swallowing?",
    
    // Medtech specific
    anemiaHistory: "Anemia History",
    dietaryHabits: "Dietary Habits",
    familyAnemiaHistory: "Family history of anemia?",
    fatigue: "Do you experience fatigue?",
    paleness: "Have you noticed skin paleness?",
    vegetarian: "Are you vegetarian?",
    ironSupplements: "Do you take iron supplements?",

    // External URLs
    redirectingTo: "Redirecting to",
    oroscanApp: "Oral Cancer Screening Application",
    medtechApp: "Anemia Screening Application",
  },
  hi: {
    // Common
    appName: "स्वास्थ्य जांच पोर्टल",
    selectScreeningType: "स्क्रीनिंग प्रकार चुनें",
    oroscan: "मुख कैंसर जांच",
    medtech: "एनीमिया जांच",
    dashboard: "डैशबोर्ड",
    newScreening: "नई जांच",
    patients: "मरीज़",
    reports: "रिपोर्ट",
    settings: "सेटिंग्स",
    logout: "लॉगआउट",
    login: "लॉगिन",
    
    // Screening selection
    chooseScreening: "अपनी जांच का प्रकार चुनें",
    oroscanDesc: "व्यापक मुख कैंसर पता लगाने और मूल्यांकन",
    medtechDesc: "गैर-आक्रामक विश्लेषण के माध्यम से एनीमिया का पता लगाना",
    startScreening: "जांच शुरू करें",
    viewDashboard: "डैशबोर्ड देखें",
    
    // Patient Info (Common)
    patientInfo: "मरीज़ की जानकारी",
    fullName: "पूरा नाम",
    age: "आयु",
    gender: "लिंग",
    male: "पुरुष",
    female: "महिला",
    other: "अन्य",
    phone: "फोन नंबर",
    address: "पता",
    
    // Common Medical History
    medicalHistory: "चिकित्सा इतिहास",
    historyOfHabits: "आदतों का इतिहास",
    smoking: "क्या आप धूम्रपान करते हैं?",
    alcohol: "क्या आप शराब पीते हैं?",
    tobacco: "क्या आप तंबाकू उत्पादों का उपयोग करते हैं?",
    
    // Navigation
    next: "अगला",
    back: "पीछे",
    submit: "जमा करें",
    save: "सहेजें",
    cancel: "रद्द करें",
    
    // Responses
    yes: "हां",
    no: "नहीं",
    unknown: "अज्ञात",
    
    // Steps
    step: "चरण",
    of: "का",
    progress: "प्रगति",
    
    // Oroscan specific
    familyHistory: "पारिवारिक इतिहास",
    oralFeatures: "मौखिक विशेषताएं",
    imageCapture: "छवि कैप्चर",
    oralCancerHistory: "मुख कैंसर का पारिवारिक इतिहास?",
    mouthUlcers: "क्या आपको मुंह में छाले हैं?",
    difficultySwallowing: "निगलने में कठिनाई?",
    
    // Medtech specific
    anemiaHistory: "एनीमिया इतिहास",
    dietaryHabits: "आहार संबंधी आदतें",
    familyAnemiaHistory: "एनीमिया का पारिवारिक इतिहास?",
    fatigue: "क्या आप थकान महसूस करते हैं?",
    paleness: "क्या आपने त्वचा का पीलापन देखा है?",
    vegetarian: "क्या आप शाकाहारी हैं?",
    ironSupplements: "क्या आप आयरन सप्लीमेंट लेते हैं?",

    // External URLs
    redirectingTo: "पर पुनर्निर्देशित किया जा रहा है",
    oroscanApp: "मुख कैंसर जांच एप्लीकेशन",
    medtechApp: "एनीमिया जांच एप्लीकेशन",
  },
  bn: {
    // Common
    appName: "স্বাস্থ্য পরীক্ষা পোর্টাল",
    selectScreeningType: "পরীক্ষার ধরন নির্বাচন করুন",
    oroscan: "মুখের ক্যান্সার পরীক্ষা",
    medtech: "রক্তস্বল্পতা পরীক্ষা",
    dashboard: "ড্যাশবোর্ড",
    newScreening: "নতুন পরীক্ষা",
    patients: "রোগী",
    reports: "রিপোর্ট",
    settings: "সেটিংস",
    logout: "লগআউট",
    login: "লগইন",
    
    // Screening selection
    chooseScreening: "আপনার পরীক্ষার ধরন বেছে নিন",
    oroscanDesc: "ব্যাপক মুখের ক্যান্সার সনাক্তকরণ এবং মূল্যায়ন",
    medtechDesc: "অ-আক্রমণাত্মক বিশ্লেষণের মাধ্যমে রক্তস্বল্পতা সনাক্তকরণ",
    startScreening: "পরীক্ষা শুরু করুন",
    viewDashboard: "ড্যাশবোর্ড দেখুন",
    
    // Patient Info (Common)
    patientInfo: "রোগীর তথ্য",
    fullName: "পুরো নাম",
    age: "বয়স",
    gender: "লিঙ্গ",
    male: "পুরুষ",
    female: "মহিলা",
    other: "অন্যান্য",
    phone: "ফোন নম্বর",
    address: "ঠিকানা",
    
    // Common Medical History
    medicalHistory: "চিকিৎসা ইতিহাস",
    historyOfHabits: "অভ্যাসের ইতিহাস",
    smoking: "আপনি কি ধূমপান করেন?",
    alcohol: "আপনি কি মদ্যপান করেন?",
    tobacco: "আপনি কি তামাক পণ্য ব্যবহার করেন?",
    
    // Navigation
    next: "পরবর্তী",
    back: "পিছনে",
    submit: "জমা দিন",
    save: "সংরক্ষণ",
    cancel: "বাতিল",
    
    // Responses
    yes: "হ্যাঁ",
    no: "না",
    unknown: "অজানা",
    
    // Steps
    step: "ধাপ",
    of: "এর",
    progress: "অগ্রগতি",
    
    // Oroscan specific
    familyHistory: "পারিবারিক ইতিহাস",
    oralFeatures: "মৌখিক বৈশিষ্ট্য",
    imageCapture: "ছবি ক্যাপচার",
    oralCancerHistory: "মুখের ক্যান্সারের পারিবারিক ইতিহাস?",
    mouthUlcers: "আপনার কি মুখে ঘা আছে?",
    difficultySwallowing: "গিলতে অসুবিধা?",
    
    // Medtech specific
    anemiaHistory: "রক্তস্বল্পতার ইতিহাস",
    dietaryHabits: "খাদ্যাভ্যাস",
    familyAnemiaHistory: "রক্তস্বল্পতার পারিবারিক ইতিহাস?",
    fatigue: "আপনি কি ক্লান্তি অনুভব করেন?",
    paleness: "আপনি কি ত্বকের ফ্যাকাশে ভাব লক্ষ্য করেছেন?",
    vegetarian: "আপনি কি নিরামিষাশী?",
    ironSupplements: "আপনি কি আয়রন সাপ্লিমেন্ট নেন?",

    // External URLs
    redirectingTo: "এ পুনঃনির্দেশিত হচ্ছে",
    oroscanApp: "মুখের ক্যান্সার পরীক্ষা অ্যাপ্লিকেশন",
    medtechApp: "রক্তস্বল্পতা পরীক্ষা অ্যাপ্লিকেশন",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

function getStoredLanguage(): Language {
  if (typeof window === "undefined") return "en"
  const stored = localStorage.getItem("screening-language") as Language
  return (stored && translations[stored]) ? stored : "en"
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(getStoredLanguage)

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("screening-language", lang)
  }

  const t = (key: string): string => {
    return translations[language][key] || translations.en[key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
