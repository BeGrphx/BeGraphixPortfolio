# Pipeline média automatique

Ce pipeline conserve l’expérience actuelle dans Sanity Studio :

1. tu importes des images ou vidéos dans un projet ;
2. tu publies ;
3. Sanity déclenche GitHub Actions ;
4. FFmpeg compresse les vidéos et retire le son des loops/fonds ;
5. les fichiers sont publiés sur Cloudflare R2 ;
6. Sanity reçoit automatiquement les URLs optimisées ;
7. le site est revalidé sur Vercel ;
8. le lecteur personnalisé fonctionne comme avant.

Un cron toutes les 2 heures rattrape aussi les cas où le webhook aurait raté.

## Ce que tu fais côté utilisateur

Rien de spécial. Tu continues à :

- créer un projet ;
- glisser-déposer images et vidéos ;
- publier.

Le badge **Optimisation…** apparaît tant que la compression n’est pas finie.
Le badge **Médias OK** confirme que tout est prêt.

## Secrets GitHub Actions

Dans **GitHub → Settings → Secrets and variables → Actions** :

- `SANITY_API_WRITE_TOKEN`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_ENDPOINT`
- `REVALIDATE_SECRET`

Le bucket et l’URL publique R2 sont déjà définis dans
`.github/workflows/optimize-sanity-media.yml`.

## Variable Vercel

Dans **Vercel → Project → Settings → Environment Variables** :

- `REVALIDATE_SECRET` : même valeur que sur GitHub

## Webhook Sanity

Créer un jeton GitHub restreint au dépôt `BeGrphx/BeGraphixPortfolio`
avec la permission `Contents: Read and write`.

Puis créer un webhook Sanity :

- **Nom** : `Optimize videos on R2`
- **Dataset** : `production`
- **URL** :
  `https://api.github.com/repos/BeGrphx/BeGraphixPortfolio/dispatches`
- **Méthode** : `POST`
- **Filtre** :

```groq
_type in ["project", "siteSettings"] &&
!(_id in path("drafts.**")) &&
(
  (
    defined(showreelVideoFile.asset._ref) &&
    (
      !defined(showreelVideoUrl) ||
      !(showreelVideoUrl match (
        "*" + string::split(showreelVideoFile.asset._ref, "-")[1] + "*"
      ))
    )
  ) ||
  count(gallery[
    defined(videoFile.asset._ref) &&
    (
      !defined(videoUrl) ||
      !(videoUrl match (
        "*" + string::split(videoFile.asset._ref, "-")[1] + "*"
      ))
    )
  ]) > 0 ||
  count(videoGallery[
    defined(videoFile.asset._ref) &&
    (
      !defined(videoUrl) ||
      !(videoUrl match (
        "*" + string::split(videoFile.asset._ref, "-")[1] + "*"
      ))
    )
  ]) > 0 ||
  count(media[
    defined(videoFile.asset._ref) &&
    (
      !defined(url) ||
      !(url match (
        "*" + string::split(videoFile.asset._ref, "-")[1] + "*"
      ))
    )
  ]) > 0
)
```

- **Projection** :

```groq
{
  "event_type": "sanity-media-upload",
  "client_payload": {
    "documentId": _id,
    "documentType": _type
  }
}
```

- **Headers** :
  - `Authorization: Bearer <JETON_GITHUB>`
  - `Accept: application/vnd.github+json`
  - `X-GitHub-Api-Version: 2026-03-10`

Activer les déclencheurs `create` et `update`.

## Traitement appliqué

- format de diffusion : MP4 H.264, pixel format `yuv420p` ;
- largeur maximale : 1920 px, sans agrandissement ;
- showreels et lecteurs complets : CRF 19 avec audio AAC 160 kbit/s ;
- loops et fond d’accueil : CRF 21 sans audio ;
- optimisation uniquement si nécessaire ou si le fichier dépasse 20 Mo ;
- cache R2 : un an, immutable ;
- sauvegarde de l’original dans `originals/` ;
- diffusion depuis `media/`.

Les images restent dans Sanity : son CDN les redimensionne déjà automatiquement.

## Vérification locale

```powershell
npm run media:check
$env:MEDIA_PIPELINE_DRY_RUN = "1"
npm run media:process
```

Le workflow peut aussi être lancé manuellement depuis l’onglet **Actions**
de GitHub avec **Run workflow**.
