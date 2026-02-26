import { NextRequest, NextResponse } from "next/server"
import { TEAMS } from "@/lib/teams"
import { setProgress } from "@/lib/store"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { teamId, progress, label } = body

    // Validation
    if (!teamId || typeof progress !== "number" || !label) {
      return NextResponse.json({ error: "teamId, progress (number), label requis" }, { status: 400 })
    }

    const team = TEAMS.find((t) => t.id === teamId)
    if (!team) {
      return NextResponse.json({ error: "Équipe inconnue" }, { status: 404 })
    }

    const entry = setProgress(teamId, progress, label.slice(0, 100))
    return NextResponse.json({ success: true, data: entry })
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 })
  }
}
