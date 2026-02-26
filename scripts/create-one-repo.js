const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf8").split(/\r?\n/).forEach((line) => {
    const m = line.match(/^\s*GITHUB_TOKEN\s*=\s*(.+)\s*$/);
    if (m) process.env.GITHUB_TOKEN = m[1].trim().replace(/^["']|["']$/g, "");
  });
}

const token = (process.env.GITHUB_TOKEN || "").trim();
const owner = process.env.GITHUB_OWNER || "Jonathan01-Dev";
const repoName = process.argv[2] || "archipel-warroom";

if (!token) {
  console.error("GITHUB_TOKEN manquant dans .env.local");
  process.exit(1);
}

const auth = token.startsWith("ghp_") ? `token ${token}` : `Bearer ${token}`;

async function main() {
  const url = "https://api.github.com/user/repos";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: auth,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: repoName,
      description: "Archipel War Room - Tableau de bord hackathon",
      private: false,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    if (data.message && data.message.includes("already exists")) {
      console.log("Repo existe déjà:", owner + "/" + repoName);
      process.exit(0);
    }
    console.error("Erreur", res.status, data.message || data);
    process.exit(1);
  }
  console.log("Créé:", data.full_name);
}

main();
