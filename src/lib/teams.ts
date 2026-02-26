// ============================================================
// CONFIGURATION DES ÉQUIPES
// Modifie ce fichier avant chaque hackathon (noms, couleurs, membres)
// ============================================================

export interface Team {
  id: string          // identifiant unique, pas d'espaces
  name: string        // nom affiché sur le dashboard
  color: string       // couleur hex pour les barres et accents
  icon: string        // nom d'icône Lucide (ex: "Zap", "Rocket")
  githubRepo: string  // format: "owner/repo-name"
  members: string[]   // liste des membres (affichage seulement)
}

const REPOS = [
  "binary-sharks", "quantum-coders", "neural-ninjas", "data-wizards", "cyber-phoenix",
  "algorithm-avengers", "cloud-warriors", "pixel-pirates", "debug-dragons", "stack-overflow",
  "code-breakers", "blockchain-bandits", "ai-rebels", "byte-fighters", "script-samurais",
  "git-gurus", "api-assassins", "lambda-lions", "devops-demons", "full-stack-fury",
  "crypto-kings", "ml-mavericks", "iot-innovators", "tech-titans", "silicon-spartans",
  "kernel-killers", "root-access", "terminal-terminators", "firewall-breakers", "logic-legends",
  "zero-day-heroes",
] as const;

const COLORS = [
  "#FF6B35", "#4ECDC4", "#FFE66D", "#A8DADC", "#E63946",
  "#2A9D8F", "#E9C46A", "#264653", "#F4A261", "#2EC4B6",
  "#FF9F1C", "#C73E1D", "#6A4C93", "#1982C4", "#8AC926",
  "#FFCA3A", "#6A0572", "#06D6A0", "#EF476F", "#118AB2",
  "#073B4C", "#FFD166", "#EF476F", "#06D6A0", "#118AB2",
  "#073B4C", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
  "#FFEAA7",
];

// Noms d'icônes Lucide (lucide-react) — style propre type HTML/SVG
const ICONS = [
  "Zap", "Code", "Rocket", "Target", "Cpu", "Cloud", "Ship", "Bug", "BookOpen", "Key",
  "Link", "Bot", "Database", "Server", "Terminal", "Code2", "Box", "Package", "Layers", "GitBranch",
  "FileCode", "Binary", "Sparkles", "Flame", "Shield", "Lock", "Globe", "Wifi", "Radio", "CircleDot",
  "Boxes",
];

function toTitleCase(s: string): string {
  return s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// --- Repo de test pour le dashboard (à retirer après le test) ---
const MON_REPO_TEST: Team = {
  id: "archipel-warroom",
  name: "Mon repo test",
  color: "#00d4ff",
  icon: "Sparkles",
  githubRepo: "Jonathan01-Dev/archipel-warroom",
  members: [],
};

export const TEAMS: Team[] = [
  MON_REPO_TEST,
  ...REPOS.map((repo, i) => ({
    id: repo,
    name: toTitleCase(repo),
    color: COLORS[i % COLORS.length],
    icon: ICONS[i % ICONS.length],
    githubRepo: `Jonathan01-Dev/${repo}`,
    members: [],
  })),
];

// ============================================================
// CONFIGURATION DU HACKATHON
// ============================================================
export const HACKATHON_CONFIG = {
  name: "Archipel Hackathon",
  edition: "2024",
  // Surcharge possible via .env.local
  durationMinutes: parseInt(process.env.HACKATHON_DURATION_MINUTES || "480"),
  startTime: process.env.HACKATHON_START_TIME || "2024-06-01T09:00:00",
}
