# Orchestration de l'audit — agents, contrats, barèmes, livrable

> Mode d'emploi opérationnel du Process de SKILL.md : qui lance quoi, avec quels prompts, quel format de sortie, comment réconcilier, comment scorer, quoi livrer. Complète METHODE-AUDIT.md (le fond) et REVUE-QUALITE.md (les grilles).

## 1. Dimensionnement & prérequis

- **Site vitrine ≤ 10 pages** (artisan, commerce local) : 3 collecteurs suffisent (technique+SEO fusionnés, CRO/UX, GEO) ; clusters/cannibalisation/consolidation généralement hors sujet ; ajouter l'annexe SEO local (§10). **Site 30+ pages / e-commerce** : 5 axes complets + concurrents.
- **Prérequis bloquant** (Process étape 1) : si le domaine est en noindex ou non indexé, NE PAS s'arrêter — livrer l'audit complet avec l'indexabilité comme UNIQUE item P0 et tout le reste explicitement conditionné à sa résolution.
- **Détection site 100 % JS** (fatal pour un audit curl) : si le HTML brut de la home fait < 5 Ko de texte utile ou que `<body>` est quasi vide avec de gros bundles → basculer la collecte sur Playwright (`page.content()` après networkidle) et le NOTER dans le rapport (la citabilité GEO d'un site 100 % JS est elle-même un finding).

## 2. Contrat de finding (commun à tous les collecteurs)

Chaque collecteur retourne UNIQUEMENT une liste JSON — jamais de conclusion ni de score :

```json
{ "id": "seo-03", "axe": "seo", "url": "https://…/page", "claim": "meta description absente",
  "preuve": "extrait brut (HTML/code/capture) cité",
  "verify_cmd": "curl -s https://…/page | grep -c 'name=\"description\"'",
  "palier_propose": "P1", "confidence": "haute|moyenne|basse" }
```

Le champ **`verify_cmd` est obligatoire** : celui qui affirme fournit la commande exacte qui permet de le contredire. Un finding sans `verify_cmd` rejouable est irrecevable. Les `id` sont **uniques au sein de l'axe** (deux findings partageant un id partageraient silencieusement le même verdict).

## 3. Fan-out de collecte

Lancer en PARALLÈLE (Task tool ou workflow §12), un agent par ligne. Prompts auto-suffisants : chaque agent reçoit le domaine, le chemin du repo (si disponible), le chemin des fichiers de la skill à lire, et le contrat §2.

| Axe | Modèle | Lit | Collecte |
|---|---|---|---|
| SEO technique + sémantique | sonnet | METHODE-AUDIT §1,3,4,6 | indexabilité, canonical/hreflang, meta, cannibalisation, maillage, orphelines, sitemap |
| GEO | haiku | METHODE-AUDIT §5 | llms.txt, négociation markdown, robots+bots IA, RSS, JSON-LD bruts, fraîcheur visible |
| Design/UX anti-slop | sonnet | REVUE-QUALITE §1 | design read preserve/redesign D'ABORD, captures 390/768/1440, grille quantifiée, hiérarchie réelle des balises dans le code |
| CRO/copy | sonnet | REVUE-QUALITE §3 | objectif de conversion unique par page, 5 frictions, chaque critique AVEC réécriture proposée |
| Code/perf/a11y | sonnet | REVUE-QUALITE §2,4,5 + **METHODE-AUDIT §7** | CWV terrain (CrUX URL puis origine) AVANT tout labo ; trace bridée mobile selon le protocole §7.3 sur 2 pages minimum (accueil + contenu) ; images, formulaires (anti-spam), tracking vs politique de confidentialité, audit-local.mjs si repo. **Un poids de bundle n'est pas un finding** (§7.6) et l'INP ne se conclut pas d'une trace de chargement (§7.5) |
| Concurrent (×N) | haiku | METHODE-AUDIT §9 | fiche normalisée par concurrent (mêmes champs pour tous → tableau comparatif sans retraitement) |

Modèles = matrice de routing (haiku pour checklist mécanique, sonnet pour jugement). Externe outillé (Semrush/Ahrefs si licence) en parallèle de tout ça ; sinon §8.

**Concurrents non fournis → découverte automatique** (avant les scouts) : recherche web sur les 5-10 requêtes cibles du client (+ variante « {service} {ville} » pour un business local) ; retenir les 3-5 domaines qui reviennent dans les résultats organiques, en EXCLUANT annuaires, marketplaces, médias et agrégateurs (PagesJaunes, Yelp, Amazon, presse) — un concurrent = un site qui vend la même chose à la même cible. Les valider en une ligne chacun dans le rapport (pourquoi retenu).

**Template de prompt collecteur** :
> Tu audites {domaine} sur l'axe {axe}. Lis d'abord {chemins des sections skill}. Collecte par curl BRUT (protocole §4) {+ lecture du code dans {repo} si fourni}. Retourne UNIQUEMENT une liste JSON de findings au contrat suivant : {contrat §2}. Interdictions : conclure, scorer, recommander, affirmer « absent » sans citer le HTML brut téléchargé.

## 4. Protocole curl & réconciliation

**Commandes canoniques** (UA identifiable, jamais un fetch qui filtre les `<script>`) :
```bash
curl -sIL "$URL"                                    # status, redirections, X-Robots-Tag
curl -s "$URL" -A "AuditBot (+contact)"             # HTML brut complet
curl -s "$URL" > page.html   # puis extraction JSON-LD robuste : voir §11 (jamais un grep ligne à ligne — multiligne)
curl -s -H 'Accept: text/markdown' "$URL" -D - -o /dev/null | grep -i 'vary\|content-type'
curl -s "$DOMAIN/robots.txt" | grep -iE 'gptbot|claudebot|perplexitybot|google-extended|content-signal'
```

**Réconciliation (Process étape 3) — mécanique exacte** :
1. TOUT finding passe au fact-check — par affirmation, JAMAIS par échantillon. Fan-out de l'agent `site-fact-checker` (haiku) par lots de ~10 findings.
2. Le vérificateur exécute le `verify_cmd` tel quel et rend un verdict : **CONFIRMÉ / INFIRMÉ / INVÉRIFIABLE** + preuve brute.
3. Divergence collecteur/vérificateur → une 2e vérification par un angle différent (code au lieu de prod, ou inverse) ; toujours divergent = INVÉRIFIABLE.
4. Seuls les CONFIRMÉS entrent au scoring. Les INFIRMÉS sont archivés AVEC leur preuve en annexe (jurisprudence anti-récidive pour les audits suivants). Les INVÉRIFIABLES sont listés à part, jamais promus.

## 5. Barème de scoring (par axe, /10)

| Score | Ancre |
|---|---|
| 9-10 | Aucun finding P0/P1 confirmé ; l'axe est un différenciateur |
| 7-8 | Fondations saines, P1 mineurs ; optimisations = gains marginaux |
| 5-6 | Fonctionnel mais fuites réelles (P1 multiples) ; corrections = gains mesurables |
| 3-4 | Au moins un P0 confirmé ou P1 systémique ; l'axe sous-performe structurellement |
| 1-2 | L'axe est cassé (non indexé, formulaire mort, design illisible) |

- **Score potentiel** = plafond RÉALISTE compte tenu du domaine (autorité, budget, périmètre offre) — pas le maximum théorique. Un domaine neuf plafonne à ~7 en SEO à 6 mois quoi qu'on fasse.
- **Blocage principal** = LE finding qui empêche de monter d'un palier (un seul par axe).
- Seuil KD : domaine neuf OU faible autorité (peu de référents, trafic 100 % marque) → KD ≤ 20 d'abord ; la règle suit l'autorité réelle, pas l'âge du domaine.

## 6. Plan d'action — template

Fixes en 4 paliers, chaque item :
`| # | Item | Axe | Effort (S/M/L) | Impact attendu | Dépend de | Responsable (agence/client) |`
- P0 = bloquant cette semaine (indexation, formulaire cassé, conformité légale — cette dernière déployée SEULE).
- Gates client (donnée manquante : prix, témoignage, délai) = items marqués **[GATE CLIENT]**, jamais clos par invention.
- Roadmap de CONTENU séparée, en phases temporelles (METHODE-AUDIT §2).

## 7. Livrable

UN fichier markdown, dans la langue du client, structure imposée :
1. **En-tête méta** (exigé par la méthode) : date, outils utilisés, échantillon de pages, agents lancés.
2. **Executive summary — 3 bullets max** (dont le verdict H1/H2 si le brief est un problème de conversion, cf. §9).
3. Tableau de scoring par axe (actuel / potentiel / blocage).
4. Findings confirmés par axe (avec preuves).
5. Plan d'action 4 paliers + roadmap contenu.
6. Annexes : faux positifs écartés (avec preuves), invérifiables, fiches concurrents.

Destinataire par défaut = le décideur client (vulgarisé, chaque item actionnable) ; version backlog interne sur demande.

## 8. Fallback sans outil SEO tiers (cas nominal pour un petit client)

- SERP manuelle : 5-10 requêtes cibles en navigation privée (+ variante localisée « {service} {ville} ») ; noter position du site et 3-5 concurrents qui rankent.
- Volumes : suggestions Google/autocomplete + « recherches associées » + Google Trends en relatif. TOUT étiqueter « directionnel » dans le rapport — jamais présenté comme mesure.
- La légitimité E-E-A-T (offre réellement vendue) et l'intention de SERP se jugent sans outil : lire la SERP réelle.

## 9. Données propriétaires à demander au client (AVANT de conclure)

Accès ou exports : **Search Console** (impressions/clics/requêtes), **Analytics** (trafic, sources, conversions), historique formulaires/appels reçus.
- Triage du symptôme « pas de leads » : GSC ≈ 0 impressions → **H1 : problème de visibilité** (SEO/technique) ; trafic réel mais 0 conversion → **H2 : problème CRO/confiance**. L'audit pondère les axes selon H1/H2.
- Accès refusés/inexistants → audit « en aveugle » possible mais le noter en en-tête + le verdict H1/H2 reste une hypothèse.

## 10. Annexe SEO local (artisans, commerces, cabinets)

L'axe le plus rentable pour un business local, à ajouter au fan-out (haiku) :
- **Google Business Profile** : existence, catégorie exacte, avis (volume/note/réponses), photos, posts.
- **Cohérence NAP** (nom/adresse/téléphone) : site vs GBP vs annuaires (PagesJaunes, Yelp, annuaires métier).
- **Citations locales** + backlinks locaux (mairie, CCI, associations pro).
- Sur le site : `LocalBusiness` (sous-type métier exact) avec geo/openingHours, téléphone en `href="tel:"` visible mobile, zone d'intervention explicite, pages villes seulement si ancrées dans le réel local.

## 11. Validation JSON-LD scriptable

Le Rich Results Test (web, non scriptable) reste le gate FINAL manuel. En agent :
```bash
# extracteur robuste (JSON-LD multiligne, attributs réordonnés) — jamais un grep ligne à ligne
curl -s "$URL" | python3 -c '
import sys, re, json
html = sys.stdin.read()
blocks = re.findall(r"<script[^>]*application/ld\+json[^>]*>(.*?)</script>", html, re.S | re.I)
print(f"{len(blocks)} bloc(s) JSON-LD")
for i, b in enumerate(blocks): json.loads(b); print(f"bloc {i+1}: JSON valide")'
```
puis vérifier à la main les invariants métier : BreadcrumbList ≥ 2 items, @id Person unique partout, Review/AggregateRating seulement si notes réelles, sous-type LocalBusiness exact.

## 12. Audit turnkey (workflow) + fallback

- **Avec le tool Workflow** : `Workflow({scriptPath: "<skill-dir>/assets/workflows/audit-site.mjs", args: {domain, repoPath?, competitors?, mode: 'full'|'geo-regression'|'pre-launch', compareTo?, small?, skillDir?}})` — chemin absolu obligatoire (pas de tilde) ; `compareTo` = ancien site pour geo-regression ; `small` = site ≤ 10 pages (3 collecteurs, §1) ; `skillDir` = racine de la skill si copie répliquée. Le script couvre collecte + réconciliation (étapes 2-3) et rend des findings DÉJÀ vérifiés ; scoring, revue et plan (étapes 4-6) restent au thread principal — jamais délégués.
- **Sans le tool Workflow** : Task en parallèle sur les collecteurs du §3 (modèles indiqués), puis fan-out de l'agent `site-fact-checker` par lots de 10, puis §4-§7 au thread principal.
