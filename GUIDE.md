# Guide pas-à-pas — BeGraphix Portfolio

Ce guide vous accompagne de A à Z : créer Sanity, lancer le site en local, puis déployer sur Vercel via GitHub.

---

## Étape 0 — Prérequis

Vous devez avoir installé :

| Outil | Vérification | Installation |
|-------|--------------|--------------|
| **Node.js** (v20+) | `node --version` | [nodejs.org](https://nodejs.org) |
| **Git** | `git --version` | [git-scm.com](https://git-scm.com) |
| **Compte GitHub** | — | [github.com](https://github.com) |
| **Compte Sanity** | — | [sanity.io](https://www.sanity.io) (gratuit) |
| **Compte Vercel** | — | [vercel.com](https://vercel.com) (gratuit) |

---

## Étape 1 — Installer les dépendances

Ouvrez un terminal dans le dossier du projet :

```powershell
cd "C:\Users\Forza PC\Projects\BeGraphixPortfolio"
```

Puis installez les packages npm :

```powershell
npm install
```

**Ce que fait cette commande :** télécharge Next.js, Sanity, Framer Motion et toutes les bibliothèques listées dans `package.json` dans le dossier `node_modules`.

---

## Étape 2 — Créer votre projet Sanity

### 2.1 Créer le projet sur sanity.io

1. Allez sur [sanity.io/manage](https://www.sanity.io/manage)
2. Cliquez **Create project**
3. Nommez-le (ex: `BeGraphix Portfolio`)
4. Choisissez le dataset **`production`** (par défaut)
5. Notez le **Project ID** affiché (ex: `abc123xy`)

### 2.2 Configurer les variables d'environnement

Copiez le fichier d'exemple :

```powershell
Copy-Item .env.local.example .env.local
```

Ouvrez `.env.local` et remplacez :

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=abc123xy
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
```

**Ce que fait ce fichier :** il connecte votre site Next.js à votre base de contenu Sanity sans modifier le code.

### 2.3 Autoriser Sanity Studio (CORS)

1. Sur [sanity.io/manage](https://www.sanity.io/manage), ouvrez votre projet
2. Allez dans **API** → **CORS origins**
3. Ajoutez ces URLs :
   - `http://localhost:3000` (développement local)
   - `https://votre-site.vercel.app` (après déploiement — vous pourrez l'ajouter plus tard)

Cochez **Allow credentials** pour chaque origine.

---

## Étape 3 — Lancer le site en local

```powershell
npm run dev
```

**Ce que fait cette commande :** démarre un serveur de développement Next.js avec rechargement automatique.

Ouvrez dans votre navigateur :

| URL | Contenu |
|-----|---------|
| [http://localhost:3000](http://localhost:3000) | Page d'accueil (grille de projets) |
| [http://localhost:3000/studio](http://localhost:3000/studio) | **Sanity Studio** — back-office pour gérer le contenu |
| [http://localhost:3000/about](http://localhost:3000/about) | Page À propos / Contact |

Pour arrêter le serveur : `Ctrl + C` dans le terminal.

---

## Étape 4 — Ajouter du contenu dans Sanity

1. Allez sur [http://localhost:3000/studio](http://localhost:3000/studio)
2. Connectez-vous avec votre compte Sanity
3. **Créez un projet :**
   - Cliquez **Projets** → **Create**
   - Remplissez : Titre, Slug (généré auto), Client, Année, Description, Tags
   - Uploadez une **Vignette**
   - Ajoutez des **Vidéos Vimeo** (URL du type `https://vimeo.com/123456789`)
   - Définissez l'**Ordre d'affichage** (0 = premier)
   - Cliquez **Publish**
4. **Page À propos :** cliquez **À propos**, remplissez bio, email, réseaux → **Publish**

Rechargez [http://localhost:3000](http://localhost:3000) — vos projets apparaissent.

---

## Étape 5 — Pousser le code sur GitHub

### 5.1 Créer un dépôt GitHub

1. Allez sur [github.com/new](https://github.com/new)
2. Nom : `BeGraphixPortfolio`
3. Laissez **Public** ou **Private**
4. **Ne cochez pas** « Add README » (le projet en a déjà un)
5. Cliquez **Create repository**

### 5.2 Premier commit et push

Dans le terminal (remplacez `VOTRE_USERNAME` par votre identifiant GitHub) :

```powershell
git add .
git commit -m "Initial commit — portfolio Next.js + Sanity"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/BeGraphixPortfolio.git
git push -u origin main
```

**Ce que fait chaque commande :**

| Commande | Rôle |
|----------|------|
| `git add .` | Prépare tous les fichiers pour le commit |
| `git commit -m "..."` | Enregistre un snapshot du projet |
| `git branch -M main` | Renomme la branche principale en `main` |
| `git remote add origin ...` | Lie le dossier local au dépôt GitHub |
| `git push -u origin main` | Envoie le code sur GitHub |

---

## Étape 6 — Déployer sur Vercel

### 6.1 Importer le projet

1. Allez sur [vercel.com/new](https://vercel.com/new)
2. Connectez votre compte **GitHub** si ce n'est pas fait
3. Sélectionnez le dépôt **BeGraphixPortfolio**
4. Vercel détecte automatiquement **Next.js**

### 6.2 Variables d'environnement

Avant de cliquer **Deploy**, ajoutez ces variables (section **Environment Variables**) :

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Votre Project ID Sanity |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` |
| `NEXT_PUBLIC_SANITY_API_VERSION` | `2024-01-01` |

### 6.3 Déployer

Cliquez **Deploy**. Vercel build et publie votre site (~2 min).

Vous obtenez une URL du type : `https://begraphix-portfolio.vercel.app`

### 6.4 Finaliser Sanity pour la production

Retournez sur [sanity.io/manage](https://www.sanity.io/manage) → **CORS origins** → ajoutez votre URL Vercel.

Accédez au CMS en production : `https://votre-site.vercel.app/studio`

---

## Étape 7 — Mises à jour futures

1. Modifiez le contenu dans `/studio` (aucun redéploiement nécessaire pour le contenu)
2. Pour des changements de code : commit + push → Vercel redéploie automatiquement

```powershell
git add .
git commit -m "Description du changement"
git push
```

---

## Structure du contenu Sanity

Chaque **Projet** contient :

| Champ | Description |
|-------|-------------|
| Titre | Nom du projet |
| Slug | URL (`/project/mon-projet`) |
| Client | Nom du client |
| Année | Ex: 2025 |
| Description | Texte court |
| Tags | motion design, IA, 3D… |
| Vignette | Image de la grille |
| Vidéos Vimeo | URLs embed |
| Ordre d'affichage | Position dans la grille |

---

## Dépannage

| Problème | Solution |
|----------|----------|
| Page blanche sur `/studio` | Vérifiez `.env.local` et les CORS Sanity |
| Aucun projet affiché | Publiez des projets dans Studio (bouton **Publish**) |
| Vidéo Vimeo ne s'affiche pas | Utilisez une URL `https://vimeo.com/XXXXX` |
| Erreur au build Vercel | Vérifiez que les 3 variables d'env sont définies |

---

## Besoin d'aide ?

Envoyez-moi votre **Sanity Project ID** et je peux configurer `.env.local` avec vous, ou lancer le serveur pour vérifier que tout fonctionne.
