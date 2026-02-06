import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET single patient with full details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { id } = await params

    // Get patient with all related data
    const patient = await prisma.patient.findFirst({
      where: { 
        id,
        // Only allow viewing own patients unless admin
        ...(user.role !== "admin" ? { createdById: user.id } : {})
      },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true
          }
        },
        oroscanResponses: {
          include: {
            question: true
          }
        },
        oroscanImages: true,
        oroscanDiagnosis: {
          orderBy: { createdAt: "desc" },
          take: 1
        },
        medtechResponses: {
          include: {
            question: true
          }
        },
        medtechImages: true
      }
    })

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    // Format the response
    const formattedPatient = {
      id: patient.id,
      screeningNumber: patient.screeningNumber,
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      phone: patient.phone,
      healthAssistant: patient.healthAssistant,
      address: patient.address,
      screeningType: patient.screeningType,
      createdAt: patient.createdAt,
      createdBy: patient.createdBy,
      
      // Oroscan data
      oroscanResponses: patient.oroscanResponses.map(r => ({
        id: r.id,
        category: r.question.category,
        question: r.question.text,
        answer: r.answer,
        duration: r.duration
      })),
      oroscanImages: patient.oroscanImages.map(img => ({
        id: img.id,
        url: img.url,
        type: img.type,
        createdAt: img.createdAt
      })),
      oroscanDiagnosis: patient.oroscanDiagnosis[0] || null,
      
      // Medtech data
      medtechResponses: patient.medtechResponses.map(r => ({
        id: r.id,
        category: r.question.category,
        question: r.question.text,
        answer: r.answer
      })),
      medtechImages: patient.medtechImages.map(img => ({
        id: img.id,
        url: img.url,
        type: img.type,
        createdAt: img.createdAt
      }))
    }

    return NextResponse.json(formattedPatient)
  } catch (error) {
    console.error("Get patient error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
