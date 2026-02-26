"use client"

import { useState } from "react"
import { TEAMS } from "@/lib/teams"
import { TeamIcon } from "@/components/TeamIcon"

const LABELS = [
  "Brainstorming en cours",
  "Architecture définie",
  "MVP en développement",
  "Fonctionnalités de base OK",
  "Tests en cours",
  "Démo prête",
  "Finitions & polish",
  "Prêt à présenter 🎉",
]

export default function TeamPage() {
  const [teamId, setTeamId] = useState("")
  const [progress, setProgress] = useState(0)
  const [label, setLabel] = useState(LABELS[0])
  const [customLabel, setCustomLabel] = useState("")
  const [useCustom, setUseCustom] = useState(false)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  const submit = async () => {
    if (!teamId) return
    setStatus("loading")
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId,
          progress,
          label: useCustom ? customLabel : label,
        }),
      })
      if (!res.ok) throw new Error()
      setStatus("success")
      setTimeout(() => setStatus("idle"), 3000)
    } catch {
      setStatus("error")
      setTimeout(() => setStatus("idle"), 3000)
    }
  }

  const team = TEAMS.find((t) => t.id === teamId)

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: "var(--bg)" }}
    >
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display font-black text-xl glow-cyan mb-1" style={{ color: "#00d4ff" }}>
            ARCHIPEL WAR ROOM
          </h1>
          <p className="font-mono text-xs text-gray-500">Mise à jour de progression équipe</p>
        </div>

        {/* Card */}
        <div className="card-border rounded-xl p-6 space-y-6">

          {/* Team selector */}
          <div>
            <label className="font-mono text-xs text-gray-400 block mb-2">VOTRE ÉQUIPE</label>
            <div className="grid grid-cols-2 gap-2">
              {TEAMS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTeamId(t.id)}
                  className="p-3 rounded-lg border text-left transition-all"
                  style={{
                    borderColor: teamId === t.id ? t.color : "#1e2d3d",
                    background: teamId === t.id ? t.color + "20" : "transparent",
                    color: teamId === t.id ? t.color : "#4a5568",
                  }}
                >
                  <TeamIcon name={t.icon} size={24} style={{ color: t.color }} />
                  <div className="font-display text-xs font-bold mt-1">{t.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Progress slider */}
          <div>
            <label className="font-mono text-xs text-gray-400 block mb-2">
              PROGRESSION —{" "}
              <span className="font-display font-bold" style={{ color: team?.color ?? "#00d4ff" }}>
                {progress}%
              </span>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full accent-current"
              style={{ accentColor: team?.color ?? "#00d4ff" }}
            />
            {/* Visual bar */}
            <div className="progress-bar mt-2">
              <div
                className="progress-fill"
                style={{
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${team?.color ?? "#00d4ff"}80, ${team?.color ?? "#00d4ff"})`,
                }}
              />
            </div>
          </div>

          {/* Label selector */}
          <div>
            <label className="font-mono text-xs text-gray-400 block mb-2">OÙ EN ÊTES-VOUS ?</label>
            <div className="space-y-1">
              {LABELS.map((l) => (
                <button
                  key={l}
                  onClick={() => { setLabel(l); setUseCustom(false) }}
                  className="w-full text-left px-3 py-2 rounded text-sm font-mono transition-all"
                  style={{
                    background: !useCustom && label === l ? (team?.color ?? "#00d4ff") + "20" : "transparent",
                    color: !useCustom && label === l ? (team?.color ?? "#00d4ff") : "#4a5568",
                    borderLeft: `2px solid ${!useCustom && label === l ? (team?.color ?? "#00d4ff") : "transparent"}`,
                  }}
                >
                  {l}
                </button>
              ))}

              {/* Custom label */}
              <div
                className="flex items-center gap-2 mt-2 cursor-pointer"
                onClick={() => setUseCustom(true)}
              >
                <input
                  type="text"
                  placeholder="Autre (personnalisé)..."
                  value={customLabel}
                  onChange={(e) => { setCustomLabel(e.target.value); setUseCustom(true) }}
                  className="flex-1 bg-transparent border rounded px-3 py-2 font-mono text-sm text-gray-300 focus:outline-none"
                  style={{ borderColor: useCustom ? (team?.color ?? "#00d4ff") : "#1e2d3d" }}
                />
              </div>
            </div>
          </div>

          {/* Submit button */}
          <button
            onClick={submit}
            disabled={!teamId || status === "loading"}
            className="w-full py-3 rounded-lg font-display font-bold text-sm transition-all disabled:opacity-40"
            style={{
              background: status === "success"
                ? "#00ff8820"
                : status === "error"
                ? "#ff444420"
                : (team?.color ?? "#00d4ff") + "20",
              color: status === "success" ? "#00ff88" : status === "error" ? "#ff4444" : (team?.color ?? "#00d4ff"),
              border: `1px solid ${status === "success" ? "#00ff88" : status === "error" ? "#ff4444" : (team?.color ?? "#00d4ff")}`,
            }}
          >
            {status === "loading" ? "ENVOI..." :
              status === "success" ? "✓ DASHBOARD MIS À JOUR !" :
              status === "error" ? "✗ ERREUR, RÉESSAIE" :
              "METTRE À JOUR LE WAR ROOM"}
          </button>
        </div>

        <div className="text-center mt-6">
          <a
            href="/dashboard"
            className="font-mono text-xs text-gray-700 hover:text-gray-400 transition-colors"
          >
            ← Voir le dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
