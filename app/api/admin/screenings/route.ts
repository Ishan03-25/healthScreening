import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Admin check helper
async function checkAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return { error: "Unauthorized", status: 401 }
  }
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { role: true }
  })
  
  if (user?.role !== "admin") {
    return { error: "Forbidden", status: 403 }
  }
  
  return { user, session }
}

// GET all screenings
export async function GET() {
  try {
    const authResult = await checkAdmin()
    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const patients = await prisma.patient.findMany({
      select: {
        id: true,
        screeningNumber: true,
        name: true,
        age: true,
        gender: true,
        screeningType: true,
        createdAt: true,
        createdBy: {
          select: {
            name: true,
            email: true
          }
        },
        oroscanDiagnosis: {
          select: {
            result: true,
            confidence: true
          }
        },
        oroscanImages: {
          select: { id: true }
        },
        oroscanResponses: {
          select: { id: true }
        },
        medtechResponses: {
          select: { 
            id: true,
            answer: true
          }
        },
        medtechImages: {
          select: { id: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    // Transform data for the screenings table
    const screenings = patients.map(patient => {
      // Determine status
      let status: "pending" | "completed" | "reviewed" = "pending"
      if (patient.screeningType === "OROSCAN") {
        if (patient.oroscanDiagnosis && patient.oroscanDiagnosis.length > 0) {
          status = "reviewed"
        } else if (patient.oroscanImages.length > 0) {
          status = "completed"
        }
      } else {
        if (patient.medtechResponses.length > 0) {
          status = "completed"
        }
      }

      // Determine risk level
      let riskLevel: "low" | "medium" | "high" | null = null
      if (patient.screeningType === "OROSCAN" && patient.oroscanDiagnosis && patient.oroscanDiagnosis.length > 0) {
        // Determine risk based on confidence level from the latest diagnosis
        const latestDiagnosis = patient.oroscanDiagnosis[0]
        const confidence = latestDiagnosis.confidence
        if (confidence >= 0.7) riskLevel = "high"
        else if (confidence >= 0.4) riskLevel = "medium"
        else riskLevel = "low"
      } else if (patient.screeningType === "MEDTECH" && patient.medtechResponses.length > 0) {
        // Calculate risk based on responses
        const yesCount = patient.medtechResponses.filter(r => 
          r.answer?.toLowerCase() === "yes" || r.answer?.toLowerCase() === "हाँ"
        ).length
        if (yesCount >= 4) riskLevel = "high"
        else if (yesCount >= 2) riskLevel = "medium"
        else riskLevel = "low"
      }

      return {
        id: patient.id,
        screeningNumber: patient.screeningNumber,
        patientName: patient.name,
        patientAge: patient.age,
        patientGender: patient.gender,
        screeningType: patient.screeningType,
        status,
        riskLevel,
        createdAt: patient.createdAt,
        createdBy: patient.createdBy?.name || patient.createdBy?.email || "Unknown",
        imagesCount: patient.screeningType === "OROSCAN" 
          ? patient.oroscanImages.length 
          : patient.medtechImages.length,
        responsesCount: patient.screeningType === "OROSCAN"
          ? patient.oroscanResponses.length
          : patient.medtechResponses.length
      }
    })

    return NextResponse.json(screenings)
  } catch (error) {
    console.error("Get screenings error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
