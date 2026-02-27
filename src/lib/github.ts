export interface CommitSummary {
  count: number
  lastCommitAt: string | null
  lastMessage: string | null
  authors: string[]
  lastCommitLines: { additions: number; deletions: number } | null
}

function getToken() {
  return (process.env.GITHUB_TOKEN || "").trim()
}

function authHeader(token: string): string {
  if (!token) return ""
  return token.startsWith("ghp_") ? `token ${token}` : `Bearer ${token}`
}

export async function getCommitCount(repo: string, since?: string): Promise<CommitSummary> {
  const token = getToken()

  if (!token) {
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
    const auth = authHeader(token)
    if (auth) headers.Authorization = auth

    const res = await fetch(url, {
      headers,
      cache: "no-store",
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      const msg = (body.message as string) || ""
      const empty = { count: 0, lastCommitAt: null, lastMessage: "", authors: [] as string[], lastCommitLines: null }
      if (res.status === 404) return { ...empty, lastMessage: "Repo introuvable" }
      if (res.status === 403) return { ...empty, lastMessage: "Rate limit atteint" }
      if (res.status === 401) return { ...empty, lastMessage: "Token invalide ou expiré" }
      return { ...empty, lastMessage: msg || `Erreur ${res.status}` }
    }

    const commits = await res.json()
    const authorsSet = new Set<string>(
      (commits.map((c: any) => c.commit?.author?.name).filter(Boolean) as string[]) || [],
    )
    const authors = Array.from(authorsSet)
    let lastCommitLines: { additions: number; deletions: number } | null = null

    if (commits.length > 0 && commits[0].sha) {
      try {
        const detailRes = await fetch(
          `https://api.github.com/repos/${repo}/commits/${commits[0].sha}`,
          {
            headers: {
              ...(authHeader(token) ? { Authorization: authHeader(token) } : {}),
              Accept: "application/vnd.github+json",
              "X-GitHub-Api-Version": "2022-11-28",
            },
            cache: "no-store",
          }
        )
        if (detailRes.ok) {
          const detail = await detailRes.json()
          if (detail.stats) {
            lastCommitLines = { additions: detail.stats.additions ?? 0, deletions: detail.stats.deletions ?? 0 }
          }
        }
      } catch {
        // ignore
      }
    }

    return {
      count: commits.length,
      lastCommitAt: commits[0]?.commit?.author?.date ?? null,
      lastMessage: commits[0]?.commit?.message?.split("\n")[0] ?? null,
      authors,
      lastCommitLines,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur réseau"
    console.error(`Erreur GitHub pour ${repo}:`, err)
    return { count: 0, lastCommitAt: null, lastMessage: message, authors: [], lastCommitLines: null }
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
    lastCommitLines: { additions: (seed * 11) % 50 + 10, deletions: (seed * 5) % 20 },
  }
}
