const GITHUB_TOKEN = (process.env.GITHUB_TOKEN || "").trim()

export interface CommitSummary {
  count: number
  lastCommitAt: string | null
  lastMessage: string | null
  authors: string[]
}

function authHeader(): string {
  if (!GITHUB_TOKEN) return ""
  return GITHUB_TOKEN.startsWith("ghp_")
    ? `token ${GITHUB_TOKEN}`
    : `Bearer ${GITHUB_TOKEN}`
}

export async function getCommitCount(repo: string, since?: string): Promise<CommitSummary> {
  if (!GITHUB_TOKEN) {
    console.warn("GITHUB_TOKEN non défini — retour données mockées")
    return mockCommitData(repo)
  }

  try {
    const params = new URLSearchParams({ per_page: "100" })
    if (since) params.set("since", since)

    const url = `https://api.github.com/repos/${repo}/commits?${params}`
    const headers: HeadersInit = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    }
    const auth = authHeader()
    if (auth) headers.Authorization = auth

    const res = await fetch(url, {
      headers,
      next: { revalidate: 30 },
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      const msg = (body.message as string) || ""
      if (res.status === 404)
        return { count: 0, lastCommitAt: null, lastMessage: "Repo introuvable", authors: [] }
      if (res.status === 403)
        return { count: 0, lastCommitAt: null, lastMessage: "Rate limit atteint", authors: [] }
      if (res.status === 401)
        return { count: 0, lastCommitAt: null, lastMessage: "Token invalide ou expiré", authors: [] }
      return {
        count: 0,
        lastCommitAt: null,
        lastMessage: msg || `Erreur ${res.status}`,
        authors: [],
      }
    }

    const commits = await res.json()
    const authors = [...new Set(commits.map((c: any) => c.commit?.author?.name).filter(Boolean))] as string[]

    return {
      count: commits.length,
      lastCommitAt: commits[0]?.commit?.author?.date ?? null,
      lastMessage: commits[0]?.commit?.message?.split("\n")[0] ?? null,
      authors,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur réseau"
    console.error(`Erreur GitHub pour ${repo}:`, err)
    return { count: 0, lastCommitAt: null, lastMessage: message, authors: [] }
  }
}

// Données mockées pour développement sans token
function mockCommitData(repo: string): CommitSummary {
  const seed = repo.length
  return {
    count: (seed * 7) % 40 + 5,
    lastCommitAt: new Date(Date.now() - Math.random() * 3600000).toISOString(),
    lastMessage: "feat: ajout de la fonctionnalité principale",
    authors: ["Dev1", "Dev2"],
  }
}
