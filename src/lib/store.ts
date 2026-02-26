// Store en mémoire simple — pour la prod, remplace par Vercel KV, Redis, ou SQLite
// Les données sont perdues au redémarrage du serveur

interface ProgressEntry {
  teamId: string
  progress: number      // 0-100
  label: string         // ex: "MVP en cours", "Tests OK"
  updatedAt: string     // ISO date
}

// Singleton global (fonctionne en dev, en prod utilise une vraie DB)
const globalStore = global as typeof globalThis & {
  progressStore?: Map<string, ProgressEntry>
}

if (!globalStore.progressStore) {
  globalStore.progressStore = new Map()
}

export const progressStore = globalStore.progressStore

export function getProgress(teamId: string): ProgressEntry | null {
  return progressStore.get(teamId) ?? null
}

export function setProgress(teamId: string, progress: number, label: string): ProgressEntry {
  const entry: ProgressEntry = {
    teamId,
    progress: Math.max(0, Math.min(100, progress)),
    label,
    updatedAt: new Date().toISOString(),
  }
  progressStore.set(teamId, entry)
  return entry
}

export function getAllProgress(): ProgressEntry[] {
  return Array.from(progressStore.values())
}
