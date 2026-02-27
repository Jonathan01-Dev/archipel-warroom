import { NextResponse } from "next/server"
import { TEAMS, HACKATHON_CONFIG } from "@/lib/teams"
import { getCommitCount } from "@/lib/github"
import { getProgress } from "@/lib/store"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  const results = await Promise.all(
    TEAMS.map(async (team) => {
      const [commits, progress] = await Promise.all([
        getCommitCount(team.githubRepo),
        Promise.resolve(getProgress(team.id)),
      ])
      return {
        ...team,
        commits,
        progress: progress ?? { progress: 0, label: "Pas encore démarré", updatedAt: null },
      }
    })
  )

  const response = NextResponse.json({
    teams: results,
    hackathon: {
      name: HACKATHON_CONFIG.name,
      startTime: HACKATHON_CONFIG.startTime,
      durationMinutes: HACKATHON_CONFIG.durationMinutes,
      endTime: new Date(
        new Date(HACKATHON_CONFIG.startTime).getTime() +
          HACKATHON_CONFIG.durationMinutes * 60 * 1000
      ).toISOString(),
    },
    fetchedAt: new Date().toISOString(),
  })

  // Empêche tout cache CDN/proxy sur /api/teams
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
  return response
}
