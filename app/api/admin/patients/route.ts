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

// GET all patients
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
        phone: true,
        address: true,
        healthAssistant: true,
        screeningType: true,
        createdAt: true,
        createdBy: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(patients)
  } catch (error) {
    console.error("Get patients error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
