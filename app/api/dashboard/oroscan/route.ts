import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
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

    // Get total Oroscan patients
    const totalPatients = await prisma.patient.count({
      where: { 
        screeningType: "OROSCAN",
        createdById: user.id
      }
    })

    // Get today's screenings
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayPatients = await prisma.patient.count({
      where: {
        screeningType: "OROSCAN",
        createdById: user.id,
        createdAt: { gte: today }
      }
    })

    // Get completed (those with diagnoses)
    const patientsWithDiagnosis = await prisma.patient.findMany({
      where: {
        screeningType: "OROSCAN",
        createdById: user.id,
        oroscanDiagnosis: { some: {} }
      },
      include: {
        oroscanDiagnosis: true
      }
    })

    const totalDiagnoses = patientsWithDiagnosis.length

    // Calculate average confidence
    let totalConfidence = 0
    let diagnosisCount = 0
    patientsWithDiagnosis.forEach(p => {
      p.oroscanDiagnosis.forEach(d => {
        totalConfidence += d.confidence
        diagnosisCount++
      })
    })
    const avgConfidence = diagnosisCount > 0 ? (totalConfidence / diagnosisCount * 100).toFixed(1) : "0"

    // Count risk levels
    let lowRisk = 0, mediumRisk = 0, highRisk = 0
    patientsWithDiagnosis.forEach(p => {
      const latestDiagnosis = p.oroscanDiagnosis[0]
      if (latestDiagnosis) {
        const result = latestDiagnosis.result.toLowerCase()
        if (result.includes("negative") || result.includes("low") || latestDiagnosis.confidence < 0.3) {
          lowRisk++
        } else if (result.includes("medium") || (latestDiagnosis.confidence >= 0.3 && latestDiagnosis.confidence < 0.7)) {
          mediumRisk++
        } else {
          highRisk++
        }
      }
    })

    // Get recent patients
    const recentPatients = await prisma.patient.findMany({
      where: {
        screeningType: "OROSCAN",
        createdById: user.id
      },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        oroscanDiagnosis: {
          take: 1,
          orderBy: { createdAt: "desc" }
        },
        oroscanImages: true
      }
    })

    const formattedRecentPatients = recentPatients.map(p => ({
      id: p.id,
      screeningNumber: p.screeningNumber,
      name: p.name,
      age: p.age,
      gender: p.gender,
      phone: p.phone,
      status: p.oroscanDiagnosis.length > 0 ? "Completed" : "Pending",
      diagnosis: p.oroscanDiagnosis[0]?.result || "Pending",
      confidence: p.oroscanDiagnosis[0]?.confidence || 0,
      imagesCount: p.oroscanImages.length,
      createdAt: p.createdAt.toISOString()
    }))

    // Get monthly trend data
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyData = await prisma.patient.groupBy({
      by: ["createdAt"],
      where: {
        screeningType: "OROSCAN",
        createdById: user.id,
        createdAt: { gte: sixMonthsAgo }
      }
    })

    // Process monthly data
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const trends: { month: string; completed: number; pending: number }[] = []
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthName = monthNames[date.getMonth()]
      
      const monthPatients = await prisma.patient.findMany({
        where: {
          screeningType: "OROSCAN",
          createdById: user.id,
          createdAt: {
            gte: new Date(date.getFullYear(), date.getMonth(), 1),
            lt: new Date(date.getFullYear(), date.getMonth() + 1, 1)
          }
        },
        include: { oroscanDiagnosis: true }
      })
      
      const completed = monthPatients.filter(p => p.oroscanDiagnosis.length > 0).length
      const pending = monthPatients.filter(p => p.oroscanDiagnosis.length === 0).length
      
      trends.push({ month: monthName, completed, pending })
    }

    // Risk distribution
    const pending = totalPatients - totalDiagnoses
    const riskDistribution = [
      { name: "Low Risk", value: lowRisk, color: "#10b981" },
      { name: "Medium Risk", value: mediumRisk, color: "#f59e0b" },
      { name: "High Risk", value: highRisk, color: "#ef4444" },
      { name: "Pending", value: pending, color: "#6b7280" },
    ]

    return NextResponse.json({
      stats: {
        total: totalPatients,
        todayScreenings: todayPatients,
        completed: totalDiagnoses,
        pending: pending,
        avgConfidence: parseFloat(avgConfidence),
        lowRisk,
        mediumRisk,
        highRisk
      },
      recentPatients: formattedRecentPatients,
      trends,
      riskDistribution,
      userRole: user.role,
      username: user.name || user.email
    })
  } catch (error) {
    console.error("Error fetching oroscan dashboard stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    )
  }
}
