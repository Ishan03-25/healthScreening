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
      medicalResponses,
      familyResponses,
      featureResponses,
      images,
    } = body

    // Generate screening number (used as patient ID)
    const screeningNumber = generateScreeningNumber()

    // Create patient record with screening number as ID
    const patient = await prisma.patient.create({
      data: {
        id: screeningNumber,
        screeningNumber,
        name: patientInfo.name,
        age: parseInt(patientInfo.age),
        gender: patientInfo.gender,
        phone: patientInfo.phone,
        healthAssistant: patientInfo.healthAssistant || "",
        address: patientInfo.address,
        screeningType: "OROSCAN",
        createdById: user.id,
      },
    })

    // Save medical responses
    if (medicalResponses && medicalResponses.length > 0) {
      for (const response of medicalResponses) {
        // First, find or create the question
        let question = await prisma.oroscanQuestion.findFirst({
          where: { 
            category: "medical",
            text: response.questionId,
          },
        })

        if (!question) {
          question = await prisma.oroscanQuestion.create({
            data: {
              category: "medical",
              text: response.questionId,
              type: "boolean",
            },
          })
        }

        await prisma.oroscanResponse.create({
          data: {
            patientId: patient.id,
            questionId: question.id,
            answer: response.answer,
            duration: response.duration,
          },
        })
      }
    }

    // Save family responses
    if (familyResponses && familyResponses.length > 0) {
      for (const response of familyResponses) {
        let question = await prisma.oroscanQuestion.findFirst({
          where: { 
            category: "family",
            text: response.questionId,
          },
        })

        if (!question) {
          question = await prisma.oroscanQuestion.create({
            data: {
              category: "family",
              text: response.questionId,
              type: "boolean",
            },
          })
        }

        await prisma.oroscanResponse.create({
          data: {
            patientId: patient.id,
            questionId: question.id,
            answer: response.answer,
          },
        })
      }
    }

    // Save feature responses
    if (featureResponses && featureResponses.length > 0) {
      for (const response of featureResponses) {
        let question = await prisma.oroscanQuestion.findFirst({
          where: { 
            category: "features",
            text: response.questionId,
          },
        })

        if (!question) {
          question = await prisma.oroscanQuestion.create({
            data: {
              category: "features",
              text: response.questionId,
              type: "choice",
            },
          })
        }

        await prisma.oroscanResponse.create({
          data: {
            patientId: patient.id,
            questionId: question.id,
            answer: response.answer,
          },
        })
      }
    }

    // Save images
    if (images && images.length > 0) {
      for (const image of images) {
        await prisma.oroscanImage.create({
          data: {
            patientId: patient.id,
            url: image.data, // Base64 data or URL
            type: image.category || "device-upload",
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      patientId: patient.id,
      screeningNumber: patient.screeningNumber,
    })
  } catch (error) {
    console.error("Error saving oroscan screening:", error)
    return NextResponse.json(
      { error: "Failed to save screening data" },
      { status: 500 }
    )
  }
}
