---
name: auditing-websites
description: Use when auditing, reviewing or diagnosing an existing marketing/showcase/e-commerce website — audit SEO ou GEO, "pourquoi je ne ranke pas", "pourquoi je n'ai pas de trafic", trafic quasi 100% marque, positions qui chutent, site invisible sur Google ou jamais cité par ChatGPT/Perplexity, site qui ne convertit pas (pas de leads, pas de devis), cannibalisation ou doublons de pages, consolidation de clusters, audit de maillage interne ou de cocon sémantique / silo topique (pages orphelines, ancres, sens des liens), revue design/qualité avant lancement, audit CRO ou copywriting, analyse concurrentielle, vérifier qu'une refonte n'a rien perdu (SEO ou GEO). Triggers FR - "audite ce site", "audit SEO", "audit de mon site", "revue du site", "personne ne me trouve sur Google", "benchmark concurrent", "check avant mise en ligne", "audit du maillage", "mon cocon fonctionne-t-il". Couvre aussi le poids JS d'un site de contenu et l'opportunité (ou non) d'un changement de framework, toujours adossée à une mesure. Triggers FR - "faut-il migrer vers Astro", "mon site est-il trop lourd", "pourquoi mon site est lent". Triggers EN - "audit this website", "SEO audit", "why no organic traffic", "site review before launch", "internal linking audit", "content silo audit", "should I migrate to Astro", "is my site too heavy".
---

# Auditing websites (méthode Smartshift 2026)

## Overview

Méthode d'audit multi-axes (Design/UX, Code, SEO, GEO, CRO) éprouvée sur smartshift.fr et un site concurrent du même secteur : croiser un audit externe outillé (Semrush ou équivalent — fallback sans outil : `ORCHESTRATION.md` §8) avec un audit interne multi-agents, **réconcilier factuellement avant de conclure**, scorer par axe, prioriser en 4 paliers. Le différenciateur de la méthode est la réconciliation : les agents et outils produisent des faux positifs récurrents, aucune conclusion sans preuve rejouée.

L'axe Design/UX inclut la **couche animation (GSAP) et vidéo (Remotion)** quand le site en a une. Un audit ne l'écrit pas (ça, c'est la skill jumelle `building-premium-sites`), mais il la **juge** comme n'importe quelle qualité : `prefers-reduced-motion` respecté (accessibilité WCAG 2.3.3), vidéos réellement rendues et servies en 200 (une `.mp4` non rendue = bloc 404, blocage pre-launch), impact CLS/LCP des animations d'entrée, gating `navigator.webdriver` pour que les captures QA restent déterministes. « Pas de rapport entre un audit et GSAP/Remotion » est faux : c'est un axe d'audit, pas une tâche de build.

## Process

1. **Prérequis** : domaine canonique indexable (pas de noindex, canonical alignés). Sinon : poursuivre l'audit mais l'indexabilité devient l'UNIQUE P0 et tout le reste y est conditionné. Demander les **données propriétaires** (Search Console, Analytics, historique de leads — `ORCHESTRATION.md` §9) pour trancher visibilité (H1) vs conversion (H2).
2. **Double collecte** : données SEO tierces (volumes, KD, positions — directionnelles, jamais vérité absolue) + audit interne multi-agents en parallèle — axes, modèles, templates de prompts et contrat de finding (`verify_cmd` obligatoire) : `ORCHESTRATION.md` §2-3. Fond méthodologique : `METHODE-AUDIT.md`. Commerce/artisan local → annexe GBP/NAP (`ORCHESTRATION.md` §10).
3. **Réconciliation factuelle** : TOUT finding passe à l'agent **`site-fact-checker`** (fan-out par lots de 10) — le thread principal ne s'auto-vérifie jamais, et un finding sans verdict CONFIRMÉ est irrecevable au scoring. Mécanique exacte (verdicts, divergences, archivage des faux positifs) : `ORCHESTRATION.md` §4.
4. **Scoring par axe** : score actuel / score potentiel (plafond réaliste, pas maximum théorique) / blocage principal — barème ancré : `ORCHESTRATION.md` §5. Inclure l'axe CRO si le brief est un problème de conversion.
5. **Revue qualité** : anti-slop design, revue socratique 7 catégories, CRO copy, images/perf → `REVUE-QUALITE.md`. QA automatisée : `assets/audit-local.mjs` (générique — configurer les variables `AUDIT_*`).
6. **Plan d'action** : 4 paliers + roadmap de contenu séparée en phases temporelles ; livrable markdown unique à structure imposée (en-tête méta, exec summary 3 bullets, annexe faux positifs) : `ORCHESTRATION.md` §6-7.

## Audit turnkey (multi-agents)

Pour un audit complet, lancer le workflow — la réconciliation y est structurelle (non contournable) :
`Workflow({ scriptPath: "<skill-dir>/assets/workflows/audit-site.mjs", args: { domain, repoPath?, competitors?, queries?, noCompetitors?, mode: "full" | "geo-regression" | "pre-launch", compareTo?, small?, skillDir? } })`
(chemin absolu obligatoire — pas de tilde ; concurrents non fournis = **découverts automatiquement** par recherche web sur les requêtes cibles, sauf `noCompetitors: true` ; `skillDir` = racine de la skill si copie répliquée ailleurs)

**`domain` non fourni et cwd = repo d'un site → inférence automatique**, ordre de priorité strict : 1. `CNAME` → 2. `vercel.json`/`netlify.toml` (domains/redirects) → 3. config framework (`astro.config.*` site, `next.config.*` metadataBase/siteUrl) → 4. `package.json` homepage. TOUJOURS annoncer « domaine détecté : X (source : Y) » avant de lancer — auditer le mauvais domaine invalide tout en amont du fact-checking. Plusieurs candidats plausibles (monorepo, staging vs prod) → lister et demander, jamais deviner.
Il rend des findings DÉJÀ vérifiés ; les étapes 4-6 (scoring, revue, plan) restent au thread principal — jamais déléguées. Sans le tool Workflow : Task en parallèle sur les collecteurs (`ORCHESTRATION.md` §3, modèles indiqués) puis fan-out `site-fact-checker` par lots de 10.

## Quick reference

| Situation | Règle |
|---|---|
| Pages qui se cannibalisent | Consolider vers 1 URL canonique (celle qui ranke le mieux ou la plus générique) ; **308** pour fusion interne, 301 pour migration structurelle avec mapping écrit AVANT |
| Page avec ranking actif, même faible | Jamais supprimée sans redirection — priorité absolue |
| Fichiers des pages retirées | Conservés (rollback + équité), juste sortis du build/menu/sitemap |
| Nouveau mot-clé | Volume × KD × **légitimité E-E-A-T** (offre réellement vendue, sinon on ne publie pas) ; autorité faible → KD ≤ 20 d'abord |
| Sommes de volumes | Dédupliquer les recouvrements avant de sommer (sinon surestimation systématique) |
| Refonte livrée | Workflow `audit-site` en mode **geo-regression** avec `compareTo` (llms.txt, RSS, négociation markdown, JSON-LD) — un site concurrent a tout perdu en refondant |
| Donnée manquante (témoignage, prix, délai) | **Gate, ne pas fabriquer** : item [GATE CLIENT] en attente, jamais clos par invention |
| Finding conformité légale (tracking vs politique de confidentialité) | Déployé seul, immédiatement — jamais noyé dans un lot cosmétique |
| Benchmark concurrent | Méthode 7 points (fiche, sitemap clusterisé, gap analysis vérifiée des DEUX côtés, non-actions justifiées) : `METHODE-AUDIT.md` §9 |
| Site portant un cocon sémantique (pilier → têtes → filles) | Ne PAS l'auditer avec les règles de maillage génériques : grille dédiée (sens des liens, ≤ 5 sortants, ancres exactes en descente, étanchéité des branches, orphelines à ≤ 2 sauts, fraîcheur des pages « déclencheurs ») + réconciliation du graphe rendu contre le plan de cocon source : `METHODE-AUDIT.md` §6 bis |
| Landing de conversion d'un silo sous le plancher de 5 liens | **Exception assumée**, pas un finding : 1 seul lien sortant pour ne pas fuiter la conversion. La lister comme exception nommée dans le rapport |
| Site avec animations (GSAP) ou vidéos (Remotion) | Auditer la couche motion, ne pas l'ignorer : `prefers-reduced-motion` (WCAG 2.3.3), `.mp4` servis en 200 pas 404, CLS/LCP des animations d'entrée, gating `navigator.webdriver`. L'audit la **juge** ; l'écrire = `building-premium-sites`. Détail : `REVUE-QUALITE.md` §6 |
| Site de contenu qui embarque un runtime UI (React/Vue) sur toutes ses pages | Constat structurel légitime, **jamais un finding sans mesure** : le poids du bundle ne prédit pas l'impact CWV (mesuré : 205 Ko de JS pour 0 ms d'impact LCP). Séquence terrain → labo → attribution → finding. Détail : `METHODE-AUDIT.md` §7 |
| Question de performance (« mon site est lent ») | Terrain AVANT labo : CrUX URL → CrUX origine → si aucun des deux, c'est un finding d'audience, pas de vitesse. Seuils, protocole de mesure reproductible et grille de décision : `METHODE-AUDIT.md` §7 |
| Conclure sur la réactivité (INP) depuis une trace de chargement | Impossible : une trace de load ne produit pas d'INP. Terrain CrUX, mesure en interaction, ou écrire « non mesuré ». `METHODE-AUDIT.md` §7.5 |
| Routing modèles | Collecteurs qui jugent (seo/design/cro/code) = sonnet ; checklists mécaniques (geo/fact-check/scout) = haiku ; scoring et plan = thread principal |

## Red flags — STOP

- Conclure depuis un rapport d'agent/outil sans verdict `site-fact-checker` : un finding sans CONFIRMÉ n'entre ni au scoring ni au plan.
- Promouvoir un INVÉRIFIABLE en finding « probable ».
- JSON-LD « présent » ≠ valide : BreadcrumbList à 1 item, DefinedTerm hors `<script>` = valeur nulle. Validation scriptable puis Rich Results Test manuel (`ORCHESTRATION.md` §11).
- Faux positifs de contraste axe / captures à sections vides → artefact `content-visibility:auto`, pas un bug (forcer visible avant scan).
- Corriger un « défaut » qui est une identité de marque documentée ou un pattern UX fonctionnel (FAQ accordéon + schema) → vérifier le doc de marque avant d'appliquer un ban générique.

| Rationalisation | Réalité |
|---|---|
| « Semrush / l'agent le dit, inutile de re-vérifier » | Faux positifs récurrents documentés (JSON-LD « absent » car l'outil filtre les `<script>`, preload ignoré). Chaque affirmation = un verify_cmd rejoué. |
| « J'ai vérifié 3 claims, le reste doit être bon » | La réconciliation se fait par affirmation, jamais par échantillon. |
| « Je rédige le rapport d'abord, je vérifierai ensuite » | Rédiger d'abord ancre les conclusions fausses. Vérification AVANT scoring et plan. |
| « L'animation (GSAP) / la vidéo (Remotion), c'est pas le périmètre d'un audit » | Faux. Reduced-motion = accessibilité (WCAG 2.3.3), `.mp4` 404 = blocage pre-launch, animations d'entrée = CLS/LCP, gating webdriver = captures déterministes. Un audit ne l'écrit pas, il la juge — c'est un axe Design/UX + a11y + perf. |

Pour un redesign qui suit l'audit : **REQUIRED SUB-SKILL** `design-taste-frontend`. Pour construire ou reconstruire le site : skill `building-premium-sites`.
