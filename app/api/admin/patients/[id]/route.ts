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

// GET single patient
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await checkAdmin()
    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const { id } = await params

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true
          }
        },
        oroscanResponses: {
          include: {
            question: {
              select: {
                text: true,
                category: true,
                type: true
              }
            }
          }
        },
        oroscanImages: true,
        oroscanDiagnosis: true,
        medtechResponses: {
          include: {
            question: {
              select: {
                text: true,
                category: true,
                type: true
              }
            }
          }
        },
        medtechImages: true
      }
    })

    if (!patient) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(patient)
  } catch (error) {
    console.error("Get patient error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE patient
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await checkAdmin()
    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const { id } = await params

    // Delete patient (cascade will handle related records)
    await prisma.patient.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete patient error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PATCH - Update patient
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await checkAdmin()
    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const { id } = await params
    const body = await request.json()

    const { name, age, gender, phone, address, healthAssistant, responses, deleteImageIds } = body

    // Get the patient to determine screening type
    const patient = await prisma.patient.findUnique({
      where: { id },
      select: { screeningType: true }
    })

    if (!patient) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      )
    }

    // Update patient info
    const updatedPatient = await prisma.patient.update({
      where: { id },
      data: {
        name,
        age: age ? parseInt(age) : undefined,
        gender,
        phone,
        address,
        healthAssistant
      }
    })

    // Update responses if provided
    if (responses && Array.isArray(responses)) {
      for (const response of responses) {
        if (patient.screeningType === "OROSCAN") {
          await prisma.oroscanResponse.update({
            where: { id: response.id },
            data: {
              answer: response.answer,
              duration: response.duration
            }
          })
        } else {
          await prisma.medtechResponse.update({
            where: { id: response.id },
            data: {
              answer: response.answer
            }
          })
        }
      }
    }

    // Delete images if provided
    if (deleteImageIds && Array.isArray(deleteImageIds) && deleteImageIds.length > 0) {
      if (patient.screeningType === "OROSCAN") {
        await prisma.oroscanImage.deleteMany({
          where: { id: { in: deleteImageIds } }
        })
      } else {
        await prisma.medtechImage.deleteMany({
          where: { id: { in: deleteImageIds } }
        })
      }
    }

    return NextResponse.json(updatedPatient)
  } catch (error) {
    console.error("Update patient error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
