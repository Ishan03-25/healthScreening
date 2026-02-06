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

    // Get total Medtech/Anemia patients
    const totalPatients = await prisma.patient.count({
      where: { 
        screeningType: "MEDTECH",
        createdById: user.id
      }
    })

    // Get today's screenings
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayPatients = await prisma.patient.count({
      where: {
        screeningType: "MEDTECH",
        createdById: user.id,
        createdAt: { gte: today }
      }
    })

    // Get all patients with their responses
    const patientsWithResponses = await prisma.patient.findMany({
      where: {
        screeningType: "MEDTECH",
        createdById: user.id
      },
      include: {
        medtechResponses: {
          include: {
            question: true
          }
        },
        medtechImages: true
      }
    })

    // Calculate risk levels based on responses
    let lowRisk = 0, mediumRisk = 0, highRisk = 0, completed = 0, pending = 0

    patientsWithResponses.forEach(patient => {
      const responses = patient.medtechResponses
      
      if (responses.length === 0) {
        pending++
        return
      }
      
      completed++
      
      // Simple risk calculation based on responses
      let riskScore = 0
      
      responses.forEach(r => {
        const answer = r.answer.toLowerCase()
        const questionText = r.question.text.toLowerCase()
        
        // Negative indicators increase risk
        if (questionText.includes("tired") && answer === "yes") riskScore += 2
        if (questionText.includes("dizzy") && answer === "yes") riskScore += 2
        if (questionText.includes("diagnosed with anemia") && answer === "yes") riskScore += 3
        if (questionText.includes("bleeding") && answer === "yes") riskScore += 2
        if (questionText.includes("weight loss") && answer === "yes") riskScore += 2
        if (questionText.includes("chronic") && answer === "yes") riskScore += 2
        
        // Positive indicators decrease risk
        if (questionText.includes("iron-rich") && answer === "yes") riskScore -= 1
        if (questionText.includes("fruits and vegetables") && answer === "daily") riskScore -= 1
        if (questionText.includes("physical activity") && answer === "yes") riskScore -= 1
        if (questionText.includes("energy") && answer === "high") riskScore -= 1
        if (questionText.includes("energy") && answer === "low") riskScore += 2
      })
      
      if (riskScore <= 2) {
        lowRisk++
      } else if (riskScore <= 5) {
        mediumRisk++
      } else {
        highRisk++
      }
    })

    // Get recent patients
    const recentPatients = await prisma.patient.findMany({
      where: {
        screeningType: "MEDTECH",
        createdById: user.id
      },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        medtechResponses: {
          include: {
            question: true
          }
        },
        medtechImages: true
      }
    })

    const formattedRecentPatients = recentPatients.map(p => {
      // Calculate individual risk
      let riskScore = 0
      p.medtechResponses.forEach(r => {
        const answer = r.answer.toLowerCase()
        const questionText = r.question.text.toLowerCase()
        
        if (questionText.includes("tired") && answer === "yes") riskScore += 2
        if (questionText.includes("dizzy") && answer === "yes") riskScore += 2
        if (questionText.includes("diagnosed with anemia") && answer === "yes") riskScore += 3
        if (questionText.includes("bleeding") && answer === "yes") riskScore += 2
        if (questionText.includes("weight loss") && answer === "yes") riskScore += 2
        if (questionText.includes("chronic") && answer === "yes") riskScore += 2
        if (questionText.includes("iron-rich") && answer === "yes") riskScore -= 1
        if (questionText.includes("fruits and vegetables") && answer === "daily") riskScore -= 1
        if (questionText.includes("physical activity") && answer === "yes") riskScore -= 1
        if (questionText.includes("energy") && answer === "high") riskScore -= 1
        if (questionText.includes("energy") && answer === "low") riskScore += 2
      })
      
      let riskLevel = "Pending"
      if (p.medtechResponses.length > 0) {
        if (riskScore <= 2) riskLevel = "Low"
        else if (riskScore <= 5) riskLevel = "Medium"
        else riskLevel = "High"
      }

      return {
        id: p.id,
        screeningNumber: p.screeningNumber,
        name: p.name,
        age: p.age,
        gender: p.gender,
        phone: p.phone,
        status: p.medtechResponses.length > 0 ? "Completed" : "Pending",
        riskLevel,
        responsesCount: p.medtechResponses.length,
        imagesCount: p.medtechImages.length,
        createdAt: p.createdAt.toISOString()
      }
    })

    // Get monthly trend data
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const trends: { month: string; completed: number; pending: number }[] = []
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthName = monthNames[date.getMonth()]
      
      const monthPatients = await prisma.patient.findMany({
        where: {
          screeningType: "MEDTECH",
          createdById: user.id,
          createdAt: {
            gte: new Date(date.getFullYear(), date.getMonth(), 1),
            lt: new Date(date.getFullYear(), date.getMonth() + 1, 1)
          }
        },
        include: { medtechResponses: true }
      })
      
      const monthCompleted = monthPatients.filter(p => p.medtechResponses.length > 0).length
      const monthPending = monthPatients.filter(p => p.medtechResponses.length === 0).length
      
      trends.push({ month: monthName, completed: monthCompleted, pending: monthPending })
    }

    // Risk distribution
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
        completed,
        pending,
        lowRisk,
        mediumRisk,
        highRisk,
        completionRate: totalPatients > 0 ? Math.round((completed / totalPatients) * 100) : 0
      },
      recentPatients: formattedRecentPatients,
      trends,
      riskDistribution,
      userRole: user.role,
      username: user.name || user.email
    })
  } catch (error) {
    console.error("Error fetching medtech dashboard stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    )
  }
}
