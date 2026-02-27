"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TeamIcon } from "@/components/TeamIcon"

interface CommitSummary {
  count: number
  lastCommitAt: string | null
  lastMessage: string | null
  authors: string[]
  lastCommitLines?: { additions: number; deletions: number } | null
}

interface TeamData {
  id: string
  name: string
  color: string
  icon: string
  commits: CommitSummary
  progress: { progress: number; label: string; updatedAt: string | null }
}

interface HackathonData {
  name: string
  startTime: string
  durationMinutes: number
  endTime: string
}

interface ApiResponse {
  teams: TeamData[]
  hackathon: HackathonData
  fetchedAt: string
}

// ---- Countdown ----
function useCountdown(endTime: string | null) {
  const [remaining, setRemaining] = useState<number>(0)

  useEffect(() => {
    if (!endTime) return
    const tick = () => {
      const diff = new Date(endTime).getTime() - Date.now()
      setRemaining(Math.max(0, diff))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [endTime])

  const total = remaining
  const h = Math.floor(total / 3600000)
  const m = Math.floor((total % 3600000) / 60000)
  const s = Math.floor((total % 60000) / 1000)
  const isUrgent = total < 30 * 60 * 1000 && total > 0
  const isDone = total === 0

  return {
    display: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
    isUrgent,
    isDone,
  }
}

// ---- Time ago ----
function timeAgo(iso: string | null) {
  if (!iso) return "jamais"
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60000) return "il y a " + Math.floor(diff / 1000) + "s"
  if (diff < 3600000) return "il y a " + Math.floor(diff / 60000) + "min"
  return "il y a " + Math.floor(diff / 3600000) + "h"
}

// ---- Rank badge ----
function RankBadge({ rank }: { rank: number }) {
  const styles: Record<number, { bg: string; text: string; label: string }> = {
    1: { bg: "#FFD700", text: "#000", label: "01" },
    2: { bg: "#C0C0C0", text: "#000", label: "02" },
    3: { bg: "#CD7F32", text: "#000", label: "03" },
  }
  const s = styles[rank] ?? { bg: "#1e2d3d", text: "#4a5568", label: String(rank).padStart(2, "0") }
  return (
    <div
      className="font-display text-xs font-black w-8 h-8 flex items-center justify-center rounded"
      style={{ background: s.bg, color: s.text }}
    >
      {s.label}
    </div>
  )
}

// ---- Team Card (avec animation layout) ----
function TeamCard({
  team,
  rank,
  isNewLeader,
}: {
  team: TeamData
  rank: number
  isNewLeader?: boolean
}) {
  const lastCommit = timeAgo(team.commits.lastCommitAt)
  const isRecent = team.commits.lastCommitAt
    ? Date.now() - new Date(team.commits.lastCommitAt).getTime() < 5 * 60 * 1000
    : false
  const lines = team.commits.lastCommitLines

  return (
    <motion.div
      layout
      initial={false}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      className={`card-border rounded-lg p-5 ${isNewLeader ? "ring-2 ring-[#00d4ff] ring-offset-2 ring-offset-[var(--bg)]" : ""}`}
      style={{ borderColor: team.color + "40" }}
    >
      {isNewLeader && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-mono text-[10px] text-[#00d4ff] mb-2 font-bold"
        >
          ↑ Nouveau 1er
        </motion.div>
      )}
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <RankBadge rank={rank} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <TeamIcon name={team.icon} size={22} style={{ color: team.color }} />
            <h2 className="font-display font-bold text-lg leading-none" style={{ color: team.color }}>
              {team.name}
            </h2>
            {isRecent && (
              <span
                className="animate-pulse-dot w-2 h-2 rounded-full"
                style={{ background: "#00ff88" }}
                title="Commit récent !"
              />
            )}
          </div>
        </div>

        {/* Commit count big */}
        <div className="text-right">
          <div className="font-display font-black text-3xl" style={{ color: team.color }}>
            {team.commits.count}
          </div>
          <div className="font-mono text-xs text-gray-500">commits</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="font-mono text-xs text-gray-400 truncate max-w-[70%]">
            {team.progress.label}
          </span>
          <span className="font-display font-bold text-sm" style={{ color: team.color }}>
            {team.progress.progress}%
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${team.progress.progress}%`,
              background: `linear-gradient(90deg, ${team.color}80, ${team.color})`,
            }}
          />
        </div>
      </div>

      {/* Lignes du dernier commit */}
      {lines && (lines.additions > 0 || lines.deletions > 0) && (
        <div className="flex items-center gap-3 mb-2 font-mono text-xs">
          <span className="text-gray-500">Lignes :</span>
          <span className="text-[#00ff88]">+{lines.additions}</span>
          <span className="text-[#ff6384]">−{lines.deletions}</span>
        </div>
      )}

      {/* Last commit */}
      <div className="flex items-center gap-2 mt-3">
        <div className="font-mono text-xs text-gray-500">dernier commit :</div>
        <div className="font-mono text-xs" style={{ color: isRecent ? "#00ff88" : "#4a5568" }}>
          {lastCommit}
        </div>
      </div>
      {team.commits.lastMessage && (
        <div className="font-mono text-xs text-gray-600 mt-1 truncate">
          → {team.commits.lastMessage}
        </div>
      )}
    </motion.div>
  )
}

// ---- Main Dashboard ----
export default function DashboardPage() {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [error, setError] = useState(false)
  const [viewMode, setViewMode] = useState<"cards" | "bars">("cards")
  const [manualEnd, setManualEnd] = useState<string | null>(null)
  const [askRestartConfirm, setAskRestartConfirm] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/teams", { cache: "no-store" })
      if (!res.ok) throw new Error("API error")
      const json: ApiResponse = await res.json()
      setData(json)
      setLastUpdate(new Date())
      setError(false)
    } catch {
      setError(true)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const id = setInterval(fetchData, 30000) // refresh every 30s
    return () => clearInterval(id)
  }, [fetchData])

  // Chargement d'un éventuel chrono manuel (24h) depuis le localStorage
  useEffect(() => {
    if (typeof window === "undefined") return
    const saved = window.localStorage.getItem("warroom_manual_end")
    if (saved) setManualEnd(saved)
  }, [])

  const effectiveEndTime = manualEnd ?? data?.hackathon.endTime ?? null
  const { display: countdown, isUrgent, isDone } = useCountdown(effectiveEndTime)

  // Rank teams by commits desc, then progress
  const rankedTeams = data
    ? [...data.teams].sort((a, b) => {
        if (b.commits.count !== a.commits.count) return b.commits.count - a.commits.count
        return b.progress.progress - a.progress.progress
      })
    : []

  const totalCommits = rankedTeams.reduce((s, t) => s + t.commits.count, 0)
  const maxCommits = rankedTeams.reduce((m, t) => Math.max(m, t.commits.count), 0) || 1
  const hasActivity = totalCommits > 0 || rankedTeams.some((t) => t.progress.progress > 0)

  const prevFirstIdRef = useRef<string | null>(null)
  const currentFirstId = rankedTeams[0]?.id ?? null
  const newLeaderId =
    currentFirstId != null &&
    prevFirstIdRef.current != null &&
    currentFirstId !== prevFirstIdRef.current
      ? currentFirstId
      : null
  useEffect(() => {
    prevFirstIdRef.current = currentFirstId
  }, [currentFirstId])

  return (
    <div className="min-h-screen p-6 md:p-8" style={{ background: "var(--bg)" }}>
      {/* Top bar */}
      <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-black text-2xl md:text-3xl glow-cyan" style={{ color: "#00d4ff" }}>
            ARCHIPEL WAR ROOM
          </h1>
          <p className="font-mono text-sm text-gray-400 mt-1">
            {data?.hackathon.name} · {data?.hackathon.durationMinutes} min · {rankedTeams.length} équipes
          </p>
        </div>

        {/* Countdown */}
        <div
          className={`text-center px-6 py-3 rounded-lg card-border ${isUrgent ? "animate-pulse" : ""}`}
          style={{ borderColor: isUrgent ? "#ff4444" : isDone ? "#00ff88" : "#1e2d3d" }}
        >
          <div className="font-mono text-xs mb-1" style={{ color: isUrgent ? "#ff4444" : "#4a5568" }}>
            {effectiveEndTime
              ? isDone
                ? "TERMINÉ"
                : isUrgent
                  ? "⚠ TEMPS RESTANT"
                  : "TEMPS RESTANT"
              : "PRÊT À DÉMARRER"}
          </div>
          <div
            className={`font-display font-black text-4xl ${isDone ? "glow-green" : isUrgent ? "glow-red" : "glow-cyan"}`}
            style={{ color: isDone ? "#00ff88" : isUrgent ? "#ff4444" : "#00d4ff" }}
          >
            {effectiveEndTime ? (isDone ? "00:00:00" : countdown) : "24:00:00"}
          </div>
          <button
            type="button"
            className={`mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[11px] transition-colors ${
              askRestartConfirm
                ? "border-[#ff4444] bg-[#ff444420] text-[#ff8888]"
                : "border-[#00d4ff40] text-gray-300 hover:bg-[#00d4ff20] hover:text-[#00d4ff]"
            }`}
            onClick={() => {
              // Première pression : demande de confirmation claire
              if (effectiveEndTime && !isDone && !askRestartConfirm) {
                setAskRestartConfirm(true)
                // Annule la demande au bout de 8s si l'utilisateur ne confirme pas
                setTimeout(() => setAskRestartConfirm(false), 8000)
                return
              }

              const end = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
              setManualEnd(end)
              setAskRestartConfirm(false)
              if (typeof window !== "undefined") {
                window.localStorage.setItem("warroom_manual_end", end)
              }
            }}
          >
            {effectiveEndTime && !isDone
              ? askRestartConfirm
                ? "Cliquer encore pour CONFIRMER"
                : "Redémarrer 24h"
              : "Démarrer 24h"}
          </button>
        </div>

        {/* Stats globales */}
        <div className="text-right">
          <div className="font-mono text-xs text-gray-500">Total commits</div>
          <div className="font-display font-black text-3xl md:text-4xl glow-cyan" style={{ color: "#00d4ff" }}>
            {totalCommits}
          </div>
          <div className="font-mono text-xs text-gray-500 mt-1">
            {error ? (
              <span className="text-red-500">● Erreur réseau</span>
            ) : lastUpdate ? (
              <>● sync {lastUpdate.toLocaleTimeString("fr-FR")}</>
            ) : (
              <span className="animate-blink">● chargement...</span>
            )}
          </div>
        </div>
      </header>

      {/* View toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="font-display font-bold text-sm text-gray-300">Vue du classement</div>
          <div className="font-mono text-xs text-gray-500 mt-0.5">
            Cartes = détail · Histogramme = vue d’ensemble
          </div>
        </div>
        <div className="inline-flex rounded-xl border border-[#1e2d3d] bg-[#0d1117] p-1 text-sm font-mono">
          <button
            onClick={() => setViewMode("cards")}
            className={`rounded-lg px-4 py-2 transition-all ${
              viewMode === "cards"
                ? "bg-[#00d4ff] text-[#080c10] shadow-[0_0_12px_rgba(0,212,255,0.4)]"
                : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
            }`}
          >
            Cartes
          </button>
          <button
            onClick={() => setViewMode("bars")}
            className={`rounded-lg px-4 py-2 transition-all ${
              viewMode === "bars"
                ? "bg-[#00d4ff] text-[#080c10] shadow-[0_0_12px_rgba(0,212,255,0.4)]"
                : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
            }`}
          >
            Histogramme
          </button>
        </div>
      </div>

      {/* Teams view */}
      {!data ? (
        <div className="flex items-center justify-center h-64">
          <div className="font-mono text-gray-500 animate-blink">INITIALISATION DU WAR ROOM...</div>
        </div>
      ) : viewMode === "cards" ? (
        <motion.div
          layout
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))" }}
        >
          <AnimatePresence mode="popLayout">
            {rankedTeams.map((team, i) => (
              <TeamCard
                key={team.id}
                team={team}
                rank={i + 1}
                isNewLeader={team.id === newLeaderId}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="card-border rounded-xl p-5 md:p-6">
          {/* Message d'accueil quand tout est à zéro */}
          {!hasActivity && (
            <div className="mb-4 rounded-lg border border-[#00d4ff30] bg-[#00d4ff08] px-4 py-3 text-center">
              <p className="font-mono text-sm text-gray-300">
                Les équipes n’ont pas encore commencé — les premiers commits et la progression apparaîtront ici.
              </p>
              <p className="font-mono text-xs text-gray-500 mt-1">
                Chaque équipe peut mettre à jour sa progression depuis la page <strong className="text-gray-400">Mise à jour équipe</strong>.
              </p>
            </div>
          )}

          {/* Zone du graphe */}
          <div className="relative">
            {/* Légende */}
            <div className="flex flex-wrap gap-6 items-center mb-4 font-mono text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-3 rounded-md bg-[#ffb347]" />
                <span>Commits</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-3 rounded-md bg-[#ff6384]" />
                <span>Progression %</span>
              </div>
            </div>

            {/* Histogramme groupé */}
            <div className="flex items-end gap-2 overflow-x-auto pb-2 min-h-[220px] scroll-smooth">
              {rankedTeams.map((team, i) => {
                const barHeightPx = 180
                const commitHeightPx = maxCommits
                  ? (team.commits.count / maxCommits) * barHeightPx
                  : 0
                const progressHeightPx = Math.max(8, (team.progress.progress / 100) * barHeightPx)
                const shortName = team.name.length > 10 ? team.name.slice(0, 8) + "…" : team.name
                return (
                  <div
                    key={team.id}
                    className="flex flex-col items-center min-w-[64px] shrink-0 group"
                    title={team.name}
                  >
                    <div
                      className="relative w-full rounded-md overflow-hidden flex items-end justify-center"
                      style={{ height: barHeightPx, background: "rgba(13,17,23,0.8)" }}
                    >
                      <div
                        className="flex items-end gap-1 w-full h-full px-1"
                        style={{ minHeight: barHeightPx }}
                      >
                        <div
                          className="flex-1 min-w-[10px] rounded-md transition-all duration-500"
                          style={{
                            height: Math.max(commitHeightPx, commitHeightPx === 0 ? 2 : 0),
                            background: `linear-gradient(180deg, #ffb347cc, #ffb347)`,
                          }}
                        />
                        <div
                          className="flex-1 min-w-[10px] rounded-md transition-all duration-500"
                          style={{
                            height: progressHeightPx,
                            background: `linear-gradient(180deg, #ff6384cc, #ff6384)`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="mt-2 font-mono text-[11px] text-gray-400 text-center leading-tight">
                      #{i + 1} · {team.commits.count}c / {team.progress.progress}%
                    </div>
                    <div className="mt-1 flex items-center gap-1 min-h-[20px]" style={{ color: team.color }}>
                      <TeamIcon name={team.icon} size={18} style={{ color: team.color }} />
                      <span className="text-[11px] font-medium text-gray-400 max-w-[56px] truncate group-hover:text-gray-300" title={team.name}>
                        {shortName}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-8 flex flex-wrap justify-between items-center gap-4">
        <div className="font-mono text-xs text-gray-500">
          Rafraîchissement auto · 30 s · GitHub API
        </div>
        <a
          href="/team"
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 font-display font-bold text-sm transition-all bg-[#00d4ff] text-[#080c10] hover:bg-[#00b8e6] hover:shadow-[0_0_16px_rgba(0,212,255,0.3)]"
        >
          Mise à jour équipe
        </a>
      </footer>
    </div>
  )
}
