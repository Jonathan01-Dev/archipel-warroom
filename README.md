# 🏝️ Archipel War Room

Tableau de bord hackathon en temps réel pour **plusieurs équipes** — affiche les commits GitHub, la **progression auto-déclarée** de chaque groupe (via une webapp mobile) et un chrono décompte sur grand écran. Projet Next.js pensé pour être **remodelé** (équipes, durée, style) avant chaque édition.

---

## Architecture

```
/dashboard    → Grand écran central (TV / projecteur)
/team         → Page mobile pour chaque équipe (mise à jour progression)
/api/teams    → Données agrégées (commits + progression)
/api/progress → Endpoint POST pour mise à jour équipe
```

---

## Démarrage rapide

### 1. Cloner et installer

```bash
git clone https://github.com/ton-compte/archipel-warroom
cd archipel-warroom
npm install
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env.local
```

Édite `.env.local` :

```env
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
HACKATHON_DURATION_MINUTES=480
HACKATHON_START_TIME=2024-06-01T09:00:00
ADMIN_SECRET=change-moi-en-prod
```

**Créer un GitHub Token :**
1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. Permissions : `Contents: Read` + `Metadata: Read`
3. Colle le token dans `.env.local`

### 3. (Optionnel) Créer les repos en lot

Si tu crées toi-même un repo par équipe sur ton compte (ou une org), tu peux tout lancer d’un coup :

1. Édite `scripts/repos-to-create.json` : mets ton **username GitHub** (ou le nom de l’**org**) dans `"owner"`, et la liste des repos à créer dans `"repos"` (nom + description).
2. Token : le script lit `GITHUB_TOKEN` depuis `.env.local`. Ton token doit avoir le droit **Repository: Create** (fine-grained) ou le scope **repo** (classic).
3. Lance :

```bash
node scripts/create-repos.js
```

Les repos sont créés un par un (petit délai entre chaque pour éviter le rate limit). À la fin, le script affiche les `owner/repo` à recopier dans `src/lib/teams.ts` pour chaque équipe.

### 4. Configurer les équipes

Édite `src/lib/teams.ts` :

```typescript
export const TEAMS: Team[] = [
  {
    id: "team-alpha",       // identifiant unique (pas d'espaces)
    name: "Équipe Alpha",   // nom affiché
    color: "#FF6B35",       // couleur hex
    emoji: "🔥",
    githubRepo: "nom-user/nom-repo",  // ← format owner/repo
    members: ["Alice", "Bob"],
  },
  // Ajouter autant d'équipes que nécessaire
]
```

### 5. Lancer

```bash
npm run dev
```

- Dashboard : http://localhost:3000/dashboard
- Page équipe : http://localhost:3000/team

---

## Workflow le jour J

### Avant le hackathon

1. Demander à chaque équipe de créer leur repo GitHub
2. Les équipes t'ajoutent comme **collaborateur** (Settings → Collaborators → Add)
3. Renseigner chaque `githubRepo` dans `teams.ts`
4. Mettre `HACKATHON_START_TIME` à l'heure de départ
5. Lancer le dashboard sur le grand écran en mode plein écran (F11)

### Pendant le hackathon

- Le dashboard se **rafraîchit automatiquement toutes les 30s**
- Les équipes ouvrent `/team` sur leur téléphone pour mettre à jour leur progression
- Les commits GitHub sont comptés automatiquement depuis `HACKATHON_START_TIME`

### Partager la page `/team` aux équipes

Chaque équipe ouvre **le même lien** `/team` sur son téléphone, choisit **son équipe** dans la liste, règle le curseur de progression (0→100 %) et l’étape (ou un message libre), puis envoie. Le grand écran affiche en temps réel la progression déclarée de **toutes** les équipes.

Options de partage :
- QR code (ex. [qr-code-generator.com](https://qr-code-generator.com)) pointant vers ton IP locale ou l’URL de prod
- Lien direct si déployé en ligne (Vercel, etc.)

---

## Déploiement en production

### Option Vercel (recommandée, gratuit)

```bash
npm install -g vercel
vercel --prod
```

Ajoute les variables d'environnement dans le dashboard Vercel.

> ⚠️ **Note** : Le store en mémoire (`src/lib/store.ts`) est réinitialisé à chaque redémarrage.
> Pour une vraie persistance en production, remplace-le par **Vercel KV** (Redis) ou **Upstash**.

### Option locale (réseau interne)

```bash
npm run build && npm start
# Accessible sur ton IP locale : http://192.168.x.x:3000
```

---

## Structure du projet

```
src/
├── app/
│   ├── api/
│   │   ├── teams/route.ts      # GET — données complètes
│   │   └── progress/route.ts   # POST — mise à jour progression
│   ├── dashboard/page.tsx      # 📺 Grand écran war room
│   ├── team/page.tsx           # 📱 Page mobile équipes
│   ├── layout.tsx
│   └── globals.css
└── lib/
    ├── teams.ts                # ← ÉDITE CE FICHIER avant chaque hackathon
    ├── github.ts               # Client API GitHub
    └── store.ts                # Store en mémoire (remplaçable)
```

---

## Personnalisation

### Changer l'intervalle de rafraîchissement

Dans `src/app/dashboard/page.tsx` :
```typescript
const id = setInterval(fetchData, 30000) // 30000ms = 30s
```

### Changer les labels de progression

Dans `src/app/team/page.tsx`, modifie le tableau `LABELS`.

### Ajouter la persistance (Vercel KV)

Dans `src/lib/store.ts`, remplace le `Map` par des appels à `@vercel/kv` :
```bash
npm install @vercel/kv
```

---

## Développement sans token GitHub

Le projet fonctionne sans token — les données GitHub sont alors **mockées** avec des chiffres aléatoires. Parfait pour tester le design et le layout.

> **Note API GitHub :** l’endpoint `commits` renvoie au maximum 100 commits par repo. Pour un hackathon, c’est en général suffisant ; si besoin, tu peux ajouter la pagination dans `src/lib/github.ts`.

---

## Fait avec ❤️ pour Archipel Hackathon (LBS)

Merci
test
test again
