/**
 * Crée en lot les repos GitHub pour les équipes du hackathon.
 * Utilise l'API GitHub (token avec scope repo ou create_repo).
 *
 * Usage:
 *   1. Copie scripts/repos-to-create.json et remplis "owner" + la liste "repos".
 *   2. GITHUB_TOKEN=ton_token node scripts/create-repos.js
 *      ou mets GITHUB_TOKEN dans .env.local et lance: node scripts/create-repos.js
 *
 * Option owner:
 *   - Si "owner" est ton username → crée les repos sur ton compte.
 *   - Si "owner" est une org (ex: LBS-Hack) → crée sous l'org (il faut que le token ait les droits org).
 */

const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  content.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^\s*GITHUB_TOKEN\s*=\s*(.+)\s*$/);
    if (m) process.env.GITHUB_TOKEN = m[1].trim().replace(/^["']|["']$/g, "").replace(/\s+$/, "");
  });
}

const token = (process.env.GITHUB_TOKEN || "").trim();
const configPath = path.join(__dirname, "repos-to-create.json");

if (!token) {
  console.error("GITHUB_TOKEN manquant. Définis-le dans .env.local ou: GITHUB_TOKEN=xxx node scripts/create-repos.js");
  process.exit(1);
}
// Vérifier quel type de token est utilisé (sans l'afficher en entier)
const tokenPreview = token.length >= 11 ? `${token.slice(0, 7)}...${token.slice(-4)}` : "???";
if (token.startsWith("github_pat_")) {
  console.error("Attention: le token dans .env.local est un token FINE-GRAINED (github_pat_...).");
  console.error("Pour créer des repos sur ton compte, il faut un token CLASSIC (ghp_...) avec la case « repo » cochée.");
  process.exit(1);
}
console.log("Token utilisé:", tokenPreview, token.startsWith("ghp_") ? "(classic)" : "(?)");

if (!fs.existsSync(configPath)) {
  console.error("Fichier scripts/repos-to-create.json introuvable.");
  process.exit(1);
}

const configRaw = fs.readFileSync(path.resolve(configPath), "utf8").replace(/^\uFEFF/, "");
const config = JSON.parse(configRaw);
let { owner, private: isPrivate = true, repos } = config;
owner = (process.env.GITHUB_OWNER || (typeof owner === "string" ? owner.trim() : "")).trim();

if (!owner || owner.toLowerCase() === "ton_username_github") {
  console.error('Dans repos-to-create.json, remplace "owner" par ton username GitHub (ou le nom de ton org).');
  process.exit(1);
}

if (!Array.isArray(repos) || repos.length === 0) {
  console.error("Dans repos-to-create.json, ajoute au moins un repo dans le tableau 'repos'.");
  process.exit(1);
}

const baseUrl = "https://api.github.com";
// Classic PAT: utiliser "token" ; fine-grained: "Bearer" (création repo compte perso = classic uniquement)
const authHeader = token.startsWith("ghp_") ? `token ${token}` : `Bearer ${token}`;
const headers = {
  Authorization: authHeader,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "Content-Type": "application/json",
};

async function createRepo(repo, createUrl) {
  const name = typeof repo === "string" ? repo : repo.name;
  const description = typeof repo === "string" ? "" : repo.description || "";
  const body = { name, description, private: isPrivate };
  const res = await fetch(createUrl, { method: "POST", headers, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || res.statusText || `HTTP ${res.status}`);
  }
  return { full_name: data.full_name, url: data.html_url };
}

async function main() {
  let createUrl;
  if (owner.includes("/")) {
    console.error('"owner" ne doit pas contenir de /. Utilise ton username ou le nom de l\'org.');
    process.exit(1);
  }
  const userRes = await fetch(`${baseUrl}/user`, { headers });
  const user = await userRes.json().catch(() => ({}));
  if (userRes.status === 401 || !user.login) {
    console.error("Token invalide ou expiré. Vérifie GITHUB_TOKEN dans .env.local");
    process.exit(1);
  }
  const login = user.login;
  console.log(`Connecté en tant que: ${login}`);
  if (owner !== login) {
    console.log(`Owner demandé: ${owner} → création sous l'org "${owner}"`);
  }
  if (owner === login) {
    createUrl = `${baseUrl}/user/repos`;
  } else {
    createUrl = `${baseUrl}/orgs/${owner}/repos`;
  }

  console.log(`\nCréation de ${repos.length} repo(s) sous "${owner}"...\n`);
  const created = [];
  const failed = [];

  for (let i = 0; i < repos.length; i++) {
    const repo = repos[i];
    const name = typeof repo === "string" ? repo : repo.name;
    try {
      const result = await createRepo(repo, createUrl);
      created.push(result.full_name);
      console.log(`  [${i + 1}/${repos.length}] OK ${result.full_name}`);
    } catch (e) {
      failed.push({ name, error: e.message });
      console.log(`  [${i + 1}/${repos.length}] ERREUR ${name}: ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log("\n--- Résumé ---");
  console.log(`Créés: ${created.length}`);
  if (failed.length) {
    console.log(`Échecs: ${failed.length}`);
    const isResourceError = failed.some((f) => /resource not accessible by personal access token/i.test(f.error));
    if (isResourceError) {
      console.log("\n→ Token classic requis avec la case « repo » cochée.");
      console.log("  GitHub → Settings → Developer settings → Personal access tokens (classic) → Generate new token → coche « repo ».");
    }
  }
  if (created.length) {
    console.log("\nÀ coller dans src/lib/teams.ts (githubRepo), ex.:");
    created.forEach((full) => console.log(`  githubRepo: "${full}",`));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
