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

export async function GET() {
  try {
    const authResult = await checkAdmin()
    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    // Get date ranges
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    // Fetch stats in parallel
    const [
      totalUsers,
      totalPatients,
      oroscanCount,
      medtechCount,
      todayPatients,
      pendingOroscan,
      pendingMedtech,
      recentPatients,
      usersByMonth,
      recentPatientsDetail,
      topHealthAssistants
    ] = await Promise.all([
      prisma.user.count(),
      prisma.patient.count(),
      prisma.patient.count({ where: { screeningType: "OROSCAN" } }),
      prisma.patient.count({ where: { screeningType: "MEDTECH" } }),
      prisma.patient.count({
        where: {
          createdAt: { gte: today }
        }
      }),
      prisma.patient.count({
        where: {
          screeningType: "OROSCAN",
          oroscanDiagnosis: { none: {} }
        }
      }),
      prisma.patient.count({
        where: {
          screeningType: "MEDTECH",
          medtechResponses: { none: {} }
        }
      }),
      prisma.patient.findMany({
        where: {
          createdAt: { gte: sixMonthsAgo }
        },
        select: {
          createdAt: true,
          screeningType: true
        },
        orderBy: { createdAt: "asc" }
      }),
      prisma.user.findMany({
        where: {
          createdAt: { gte: sixMonthsAgo }
        },
        select: {
          createdAt: true
        },
        orderBy: { createdAt: "asc" }
      }),
      // Recent 5 patients for activity feed
      prisma.patient.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          screeningNumber: true,
          screeningType: true,
          createdAt: true,
          createdBy: {
            select: { name: true, email: true }
          }
        }
      }),
      // Top health assistants by screening count
      prisma.patient.groupBy({
        by: ["healthAssistant"],
        _count: { id: true },
        where: {
          healthAssistant: { not: null }
        },
        orderBy: { _count: { id: "desc" } },
        take: 5
      })
    ])

    // Process recent activity (last 7 days)
    const last7Days: { date: string; oroscan: number; medtech: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString("en-US", { weekday: "short" })
      
      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)
      
      const dayPatients = recentPatients.filter(p => 
        p.createdAt >= dayStart && p.createdAt <= dayEnd
      )
      
      last7Days.push({
        date: dateStr,
        oroscan: dayPatients.filter(p => p.screeningType === "OROSCAN").length,
        medtech: dayPatients.filter(p => p.screeningType === "MEDTECH").length
      })
    }

    // Process user growth by month
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const userGrowth: { month: string; users: number }[] = []
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
      
      const monthUsers = usersByMonth.filter(u => 
        u.createdAt >= monthStart && u.createdAt <= monthEnd
      ).length
      
      userGrowth.push({
        month: monthNames[date.getMonth()],
        users: monthUsers
      })
    }

    // Screening distribution
    const screeningDistribution = [
      { name: "Oroscan", value: oroscanCount, color: "#10b981" },
      { name: "Anemia", value: medtechCount, color: "#ef4444" }
    ]

    return NextResponse.json({
      totalUsers,
      totalPatients,
      totalOroscanScreenings: oroscanCount,
      totalMedtechScreenings: medtechCount,
      todayScreenings: todayPatients,
      pendingReviews: pendingOroscan + pendingMedtech,
      recentActivity: last7Days,
      screeningDistribution,
      userGrowth,
      recentPatientsDetail: recentPatientsDetail.map(p => ({
        id: p.id,
        name: p.name,
        screeningNumber: p.screeningNumber,
        screeningType: p.screeningType,
        createdAt: p.createdAt.toISOString(),
        createdBy: p.createdBy?.name || p.createdBy?.email || "Unknown"
      })),
      topHealthAssistants: topHealthAssistants.map(ha => ({
        name: ha.healthAssistant || "Unknown",
        count: ha._count.id
      }))
    })
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
