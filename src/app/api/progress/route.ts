import { NextRequest, NextResponse } from "next/server"
import { TEAMS } from "@/lib/teams"
import { setProgress } from "@/lib/store"
import { TEAM_CODES } from "@/lib/teamCodes"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { teamId, progress, label, code } = body

    // Validation de base
    if (!teamId || typeof progress !== "number" || !label) {
      return NextResponse.json(
        { error: "teamId, progress (number), label requis" },
        { status: 400 },
      )
    }

    const team = TEAMS.find((t) => t.id === teamId)
    if (!team) {
      return NextResponse.json({ error: "Équipe inconnue" }, { status: 404 })
    }

    // Validation du code équipe
    const expectedCode = TEAM_CODES[teamId]
    if (!expectedCode) {
      return NextResponse.json(
        { error: "Aucun code configuré pour cette équipe (voir teamCodes.ts)" },
        { status: 500 },
      )
    }
    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Code équipe obligatoire pour mettre à jour la progression" },
        { status: 401 },
      )
    }
    if (code.trim() !== expectedCode) {
      return NextResponse.json(
        { error: "Code équipe incorrect" },
        { status: 401 },
      )
    }

    const entry = setProgress(teamId, progress, label.slice(0, 100))
    return NextResponse.json({ success: true, data: entry })
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 })
  }
}

