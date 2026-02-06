import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Generate 5-digit screening number
function generateScreeningNumber(): string {
  return String(Math.floor(10000 + Math.random() * 90000))
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await request.json()
    const {
      patientInfo,
      healthData,
    } = body

    // Generate screening number (used as patient ID)
    const screeningNumber = generateScreeningNumber()

    // Create patient record with screening number as ID
    const patient = await prisma.patient.create({
      data: {
        id: screeningNumber,
        screeningNumber,
        name: patientInfo.name,
        age: parseInt(patientInfo.age) || 0,
        gender: patientInfo.gender,
        phone: patientInfo.phone,
        healthAssistant: "",
        address: patientInfo.address || "",
        screeningType: "MEDTECH",
        createdById: user.id,
      },
    })

    // Save all health/medical data as responses
    if (healthData) {
      const questions = [
        // Health and Dietary Habits
        { category: "dietary", text: "How often do you eat fruits and vegetables?", value: healthData.fruitsVegetablesFrequency },
        { category: "dietary", text: "Do you consume iron-rich foods like green leafy vegetables, red meat, or beans?", value: healthData.consumesIronRichFoods },
        { category: "dietary", text: "Have you had any recent episodes of feeling unusually tired or weak?", value: healthData.feelsTiredOrWeak },
        { category: "dietary", text: "Do you often feel dizzy or have headaches?", value: healthData.feelsDizzyOrHeadaches },
        
        // Menstrual Health
        { category: "menstrual", text: "Have you started menstruating?", value: healthData.hasStartedMenstruating },
        
        // Medical History
        { category: "medical", text: "Have you experienced any bleeding in the past 7 days?", value: healthData.bleedingPast7Days },
        { category: "medical", text: "Have you ever been diagnosed with Anemia before?", value: healthData.diagnosedWithAnemia },
        { category: "medical", text: "Are you currently taking any medications?", value: healthData.takingMedications },
        
        // Lifestyle
        { category: "lifestyle", text: "Do you participate in regular physical activity or sports?", value: healthData.regularPhysicalActivity },
        { category: "lifestyle", text: "How would you rate your overall energy levels on most days?", value: healthData.energyLevels },
        
        // General Health
        { category: "general", text: "Have you experienced any recent unexplained weight loss?", value: healthData.unexplainedWeightLoss },
        { category: "general", text: "Do you have any chronic health conditions?", value: healthData.chronicHealthConditions },
        
        // Physical measurements
        { category: "physical", text: "Height (cm)", value: patientInfo.height },
        { category: "physical", text: "Weight (kg)", value: patientInfo.weight },
      ]

      for (const q of questions) {
        if (q.value) {
          let question = await prisma.medtechQuestion.findFirst({
            where: { 
              category: q.category,
              text: q.text,
            },
          })

          if (!question) {
            question = await prisma.medtechQuestion.create({
              data: {
                category: q.category,
                text: q.text,
                type: "text",
              },
            })
          }

          await prisma.medtechResponse.create({
            data: {
              patientId: patient.id,
              questionId: question.id,
              answer: q.value,
            },
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      patientId: patient.id,
      screeningNumber: patient.screeningNumber,
    })
  } catch (error) {
    console.error("Error saving medtech screening:", error)
    return NextResponse.json(
      { error: "Failed to save screening data" },
      { status: 500 }
    )
  }
}
