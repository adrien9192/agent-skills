# Méthode d'audit SEO/GEO complète

> Distillée de trois audits menés entre mai et juillet 2026 : un audit consolidé
> multi-agents, un audit outillé avec Semrush, et une analyse concurrentielle.
> Chaque audit documente en en-tête sa date, ses outils, son échantillon et ses agents.

## 1. Collecte

**Externe (outil SEO tiers)** : mots-clés positionnés, volume/mois, Keyword Difficulty, position moyenne, score de visibilité. Directionnel uniquement — recouper avec Search Console dès que le domaine est indexé.

**Interne (multi-agents)** : lecture intégrale du code, captures Playwright desktop/mobile par famille de page (accueil, hub, détail, index, contact, article), détecteur de patterns IA génériques, vérifications curl en production.

**Réconciliation obligatoire** : chaque affirmation re-vérifiée contre la prod (curl brut) ou le code avant d'être retenue. Faux positifs récurrents observés : « JSON-LD absent » (l'outil de fetch filtrait les `<script>`), « image sans priority » (preload présent dans le HTML réel).

## 2. Scoring et priorisation

- Par axe (Design/UX, Code/Archi, SEO, GEO, **CRO si le brief est un problème de conversion**) : **score actuel / score potentiel / blocage principal**. Barème et définitions : `ORCHESTRATION.md` §5.
- Plan d'action en 4 paliers : P0 bloquant cette semaine, P1 impact fort ce mois, P2 croissance ce trimestre, P3 hygiène sans date.
- **Roadmap de CONTENU distincte des fixes**, en phases temporelles : Phase 0 prérequis bloquants (indexabilité) → 0-90 j quick wins KD ≤ 20 pour amorcer l'autorité → 3-6 mois volumes moyens + netlinking → 6-12 mois head terms KD 50+. Les paliers P0-P3 priorisent des corrections ; la roadmap séquence des créations.
- Une consolidation identifiée indépendamment par deux méthodes (externe + interne) = priorité automatique.
- Tableau requête cible → page de destination unique (jamais « cluster flou »).

## 3. Consolidation de clusters / doublons

- Critère de fusion : plusieurs URLs sur la **même intention de recherche** qui se cannibalisent.
- URL canonique = celle qui porte déjà le meilleur positionnement, ou la formulation la plus générique de l'intention.
- Retirer les doublons du build/menu/sitemap mais **conserver les fichiers** (rollback, historique).
- **308** pour consolidation interne same-site ; **301** pour migration d'architecture/domaine, avec mapping exhaustif ancienne → nouvelle URL écrit AVANT la bascule.
- Jamais supprimer une page qui porte un ranking actif (même position 70 sur 1 mot-clé) sans redirection.

## 4. Arbitrage mots-clés

- Décision = volume × KD × **légitimité E-E-A-T** (le service est réellement vendu). Non négociable : pas de page money sur une offre non délivrée (risque moteur + pratique commerciale trompeuse).
- Domaine à autorité faible : KD ≤ 20 d'abord (ranking réaliste à 60-90 jours), KD 40+ ensuite.
- Head terms ambigus (acronymes polysémiques) → requalifier en expression longue spécifique.
- Vérifier l'intention dominante de la SERP avant de choisir le format (SERP informationnelle → page ressource avec CTA secondaire, pas page commerciale).
- Dédupliquer les volumes qui se recoupent avant toute somme (cas réel : 38 480 apparents → ~31 000 réels).
- Mots-clés < 100 rech./mois → sections internes d'une page, pas des entrées de menu.
- Volume massif + KD anormalement bas = opportunité cachée, tête de backlog.
- **Recycler avant de créer** : un article informationnel existant qui ranke sur une intention commerciale se convertit en page service (money) plutôt que d'en créer une concurrente — l'historique de la page part avec elle.
- Vérifier la non-cannibalisation avec l'existant avant chaque nouvelle page.
- Backlog de contenu jamais généré en masse sans validation du périmètre réel de l'offre par le décideur ; backlog arbitré documenté séparément de l'exécuté.

## 5. GEO (au-delà du SEO classique)

- `llms.txt` (sommaire) + `llms-full.txt` (prose complète) en **markdown standard** (pas de format propriétaire), itérant sur les mêmes données que les pages.
- Négociation de contenu `Accept: text/markdown` → route dédiée reconstruisant le markdown depuis les données structurées (jamais de conversion HTML→MD). `Vary: Accept`.
- robots.txt : bots IA nommés individuellement (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, OAI-SearchBot...) + Content-Signal.
- Fraîcheur **visible dans le HTML** (date de mise à jour dans le corps), pas seulement en meta.
- Contenu citable : chaque page money contient au moins un fait daté, un chiffre sourcé, une méthodologie nommée ou un comparatif structuré.
- Flux RSS maintenu en complément du sitemap.
- Sitemap : `lastmod` statiques par route, jamais `new Date()` à chaque build (Google finit par ignorer le signal).
- JSON-LD complets ET valides ; `Person` du fondateur avec @id unique partout ; jamais de Review/AggregateRating sans notes réelles.
- **Contrôle de non-régression GEO après toute refonte** : lister ce que la refonte a supprimé (llms.txt, RSS, négociation markdown) — un concurrent a corrigé tout son SEO classique en refondant et perdu toute sa couche GEO sans s'en rendre compte.
- **Search Console opérationnelle** : re-soumettre le sitemap après toute restructuration (scriptable via service account) ; un verdict URL Inspection « NEUTRAL » sur des pages fraîches est normal, pas un problème à corriger.

## 6. Maillage / pages orphelines

- Identifier les pages à fort volume absentes de la navigation (orphelines du menu) et chiffrer le volume cumulé : quick wins déjà construits mais invisibles.
- Plancher de liens internes par page (référence marché : 20-30+ ; < 5 = sous-maillée, priorité).
- Maillage templatisé par cluster (chaque fiche → N fiches sœurs + M pages money), jamais ad hoc.
- Preuves/cas clients tagués par pilier et liés vers la page money correspondante.
- Quand le sitemap et le maillage sont **data-driven** (générés depuis les mêmes données typées), l'intégrité des liens internes est garantie par construction : auditer le générateur une fois vaut mieux que crawler les liens à chaque fois.

### 6 bis. Audit d'un cocon sémantique (silo topique)

Quand le site porte un silo hiérarchique (pilier → têtes → filles, cf. blueprint §9 quater), le maillage ne s'audite PAS avec les règles génériques ci-dessus. Contrôles spécifiques :

| Contrôle | Attendu | Symptôme de dérive |
|---|---|---|
| **Sens des liens** | Pilier → têtes uniquement ; filles → 4 sœurs de la même branche + 1 remontée | Pilier qui lie directement en N2 : les têtes ne distribuent plus rien |
| **Volume sortant** | ≤ 5 liens contextuels par page | 10+ liens : le silo se comporte comme un maillage plat, bénéfice annulé |
| **Ancres** | Exactes en descente (ancre = requête cible de la page pointée), descriptives en remontée | Ancres génériques (« en savoir plus », « cliquez ici ») : aucun signal sémantique transmis |
| **Étanchéité** | Liens inter-branches rares et justifiés | Branches qui se lient massivement entre elles = un seul gros cluster, pas un cocon |
| **Source des liens** | 100 % depuis le champ typé (`linksOut`) du modèle de données | Liens en dur dans le corps : invisibles du script de validation, comptage faussé |
| **Orphelines** | Toute page du silo atteignable depuis le pilier en ≤ 2 sauts | Page présente au sitemap mais jamais liée = crawlée, jamais pondérée |
| **Fraîcheur** | Pages « déclencheurs » (faits datés) portent leur propre `updated` visible + `dateModified` | Une date globale de silo qui masque des faits périmés = risque E-E-A-T |
| **Entrées de nav** | UNE seule (le pilier) | Plusieurs entrées de menu vers l'intérieur du silo : la hiérarchie est court-circuitée |

- **Toujours réconcilier le graphe rendu contre le plan de cocon source** (xlsx / doc de plan) par script : URLs, ancres, sens, compte. Un silo de 40+ pages se casse silencieusement lors des éditions ultérieures.
- ⚠️ **Auditer le RENDU, jamais le tableau de données.** Une page du silo qui possède aussi sa propre route (typiquement la landing du lead magnet) apparaît deux fois : le framework sert la route dédiée, et le générateur dynamique doit exclure ce slug sinon il prérend une version fantôme jamais atteignable — sans erreur de build ni symptôme en prod. Compter les pages rendues (`.next/server/app/**.html` en Next, `dist/**.html` en Astro, ou le sitemap servi), pas les entrées de données. ⚠️ **Faux positif classique** : `nb d'entrées` = `nb de pages générées + 1` n'est PAS un bug quand une route dédiée existe en face — c'est exactement ce que produit une exclusion correcte. Lire le générateur de routes (`generateStaticParams` en Next, `getStaticPaths` en Astro) avant d'ouvrir un finding (faux positif réel, 2026-07-27). La priorité route statique > route dynamique vaut dans les deux frameworks.
- **Exception assumée à ne pas « corriger »** : la landing de conversion du silo porte 1 seul lien sortant. Elle ressortira sous le plancher de 5 liens à chaque passe — la lister comme exception nommée dans le rapport, pas comme finding.
- **Gate factuel sur marques tierces** : un cocon « migration depuis [concurrent] » doit porter la mention de non-affiliation, sourcer les conditions commerciales citées, et signaler ce qui n'est pas confirmé officiellement. Vérifier aussi qu'aucun cas client n'est présenté comme réel s'il s'agit d'une trajectoire type.

## 7. Performance & Core Web Vitals

> Section née d'une mesure contre-intuitive (2026-07-30) : sur un site dont les pages de contenu servaient **205 Ko de JS gzip** (dont 69 Ko de `react-dom`), l'analyse render-blocking de Chrome donnait **0 ms d'économie sur FCP et LCP**, aucune long task signalée par la trace même à 4× de bridage CPU, et un CLS de 0.00. **Le poids du bundle ne prédit pas l'impact CWV.**

### Principe

Un constat de poids (bundle, nombre de requêtes, choix de framework) est une **observation**, pas un finding. Il ne le devient qu'adossé à une métrique dégradée et mesurée. Séquence non négociable : **terrain → labo → attribution → finding**. Sauter une étape produit des recommandations chères et fausses.

### 7.1 Métriques et seuils (référence opposable)

| Métrique | Good | À améliorer | Poor | Capture |
|---|---|---|---|---|
| **LCP** | ≤ 2 500 ms | 2 501-4 000 | > 4 000 | vitesse d'affichage du contenu principal |
| **INP** | ≤ 200 ms | 201-500 | > 500 | réactivité aux interactions (remplace FID depuis le 2024-03-12) |
| **CLS** | ≤ 0,1 | 0,1-0,25 | > 0,25 | stabilité visuelle |

Évaluation Google : **75e percentile**, fenêtre glissante de **28 jours**. Sources : `web.dev/articles/defining-core-web-vitals-thresholds`, `web.dev/articles/inp`, `web.dev/articles/vitals-tools` (vérifiées le 2026-07-30).

⚠️ Les CWV sont un signal de classement **confirmé mais dont le poids n'a jamais été publié**, et Google écrit que la pertinence prime sur l'expérience de page. Ne jamais promettre de positions gagnées contre une amélioration de CWV : formuler en risque évité.

### 7.2 Terrain d'abord, toujours

Ordre strict, sans raccourci :

1. **CrUX au niveau URL** (données d'utilisateurs réels, 28 j).
2. Pas de données URL → **CrUX au niveau origine** (agrégat du domaine). Y passer avant de conclure : l'absence au niveau URL est banale.
3. Ni l'un ni l'autre → **c'est un finding, mais pas un finding de performance**. Google n'a pas assez de visites réelles pour calculer les métriques. Le goulot est l'audience. À écrire tel quel et à basculer dans l'axe SEO.

Le seuil de trafic minimal de CrUX n'est pas publié par Google : ne pas le chiffrer.

### 7.3 Protocole de mesure labo (quand le terrain manque)

Le labo ne remplace pas le terrain, il **oriente le diagnostic**. Conditions à figer, sinon deux audits ne sont pas comparables :

1. **PageSpeed Insights API** — terrain CrUX + labo en un appel. ⚠️ Le quota anonyme s'épuise (constaté le 2026-07-30) ; prévoir une clé ou le fallback ci-dessous.
2. **Chrome DevTools (MCP)** — `emulate` avec `cpuThrottlingRate: 4`, `networkConditions: 'Slow 4G'`, `viewport: 412x915x2.625,mobile,touch` ; puis `performance_start_trace` (reload) ; puis `performance_analyze_insight` sur `LCPBreakdown`.
3. **Au moins deux pages** : l'accueil ET une page de contenu type. Elles divergent fortement (mesuré sur un même site : 1 919 ms contre 1 090 ms).

Poids réel du JS servi, indépendant du framework et du build (mesure ce que le visiteur télécharge, pas ce que le build annonce) :

```bash
#!/usr/bin/env bash
# usage: ./jsweight.sh https://example.com https://example.com/une-page
ORIGIN="$1"; URL="$2"
curl -s "$URL" \
  | grep -oE 'src="[^"]+\.js"' | sed 's/src="//; s/"$//' | sort -u \
  | sed "s|^/|$ORIGIN/|" | grep '^http' \
  | while read -r u; do curl -s -o /dev/null -w "%{size_download}\n" "$u" -H "Accept-Encoding: gzip"; done \
  | awk '{s+=$1; n++} END {printf "%d fichiers JS, %d octets gzip (%.0f Ko)\n", n, s, s/1024}'
```

Testé le 2026-07-30 (sortie : `11 fichiers JS, 210226 octets gzip (205 Ko)`). Le mettre dans un fichier plutôt que de le coller en une ligne. `awk` et non `paste -sd+ | bc` : le `paste` de BSD/macOS refuse l'entrée standard sans argument.

### 7.4 Lire un LCP

Le LCP se décompose en **4 sous-parties officielles**, et le levier dépend entièrement de celle qui domine :

| Sous-partie | Levier correspondant |
|---|---|
| **TTFB** | hébergement, cache CDN, rendu serveur |
| **Resource Load Delay** | découverte tardive de la ressource : `preload`, priorité, position dans le HTML |
| **Resource Load Duration** | poids et format de l'image LCP |
| **Element Render Delay** | CSS critique, polices (`font-display`), JS bloquant |

Quand l'élément LCP est **du texte**, les deux sous-parties de ressource valent 0 : il ne reste que TTFB + render delay. **Un render delay qui pèse 90 %+ du LCP désigne le CSS et les polices, pas le bundle JS.**

Deux corroborations, à ne pas confondre :
- `RenderBlocking` à 0 ms d'économie estimée = **aucune ressource bloquante à récupérer**. Ça ne dit rien du JS chargé en `async`/`defer`, qui n'est jamais bloquant par construction.
- Le JS ne peut nuire qu'**après** le rendu, par des long tasks qui monopolisent le thread. Ça se vérifie séparément, dans la trace, et c'est ce qui alimente l'INP (§7.5).

Conclure « le JS ne coûte rien » exige donc les deux : pas de blocage de rendu **et** pas de long task sous bridage.

### 7.5 Ce qu'une trace de chargement ne mesure PAS

**L'INP.** Une trace de load n'en produit aucune valeur : la métrique exige des interactions réelles. Or c'est précisément la métrique qu'un bundle JS lourd dégrade.

Conséquence opposable : « le JS pénalise la réactivité » **ne peut pas** se conclure d'une trace de chargement. Soit on dispose de l'INP terrain (CrUX), soit on mesure en interagissant, soit on écrit que **ce n'est pas mesuré**. Un LCP et un CLS verts ne disent rien de l'INP.

### 7.6 Grille de décision

| Constat | Devient un finding si… | Sinon |
|---|---|---|
| Bundle lourd | INP terrain > 200 ms, **ou** long tasks mesurées sous bridage | observation notée, sans priorité |
| LCP terrain > 2 500 ms | toujours | — |
| Render delay dominant | oui, avec le levier nommé (CSS / police) | — |
| CLS > 0,1 | toujours, avec la cause identifiée (image sans dimensions, police, injection) | — |
| Aucune donnée CrUX (URL et origine) | finding d'**audience**, axe SEO | jamais un finding de performance |

### 7.7 Anti-patterns

- **Conclure la performance depuis le poids du bundle.** Mesuré : 205 Ko de JS pour 0 ms d'impact sur LCP et FCP.
- **Recommander une migration de framework sur ce seul constat.** Sur des URLs positionnées, ça se juge au risque SEO et au coût, jamais au confort technique. CWV terrain verts → écrire **NON RETENU** dans le rapport ; rouges → attribuer la dégradation à une cause mesurée avant d'évoquer une réécriture.
- **Servir un Lighthouse de labo comme preuve terrain.** Deux choses différentes : le rapport doit dire laquelle il montre.
- **Mesurer une seule page** puis généraliser au site.
- **Promettre des positions** en échange de CWV améliorées.

## 8. Pièges d'audit connus

- Sitemap `lastModified: new Date()` → churn qui détruit le signal.
- metaTitle > 60 caractères acceptable si le mot-clé est front-loaded et que seule la marque est tronquée → ne pas « corriger » mécaniquement.
- `content-visibility:auto` : faux positifs de contraste axe-core (forcer visible avant scan — validé 16→0 violations) et captures full-page à sections vides (artefact Chromium, pas un bug).
- Scripts QA cassés silencieusement après un changement de composant (sélecteur obsolète) → revalider les sélecteurs à chaque évolution du DOM ciblé.
- Badge « populaire » sur l'offre la moins chère → l'ancrage doit pointer l'offre médiane/haute.
- Domaine encore en noindex pendant qu'on rédige le plan de contenu → prérequis §1.
- Recommander une migration de framework, ou tout autre chantier de performance, sans mesure → §7 (la séquence y est opposable).

## 9. Analyse concurrentielle (méthode éprouvée 2× sur un concurrent du secteur)

1. **Fiche d'identité** : registre légal (societe.com / registre national), stack technique (fuites de template, générateur, CMS), notoriété externe vérifiable (LinkedIn, Trustpilot, presse avec URLs) — jamais d'affirmation de notoriété sans lien.
2. **Inventaire sitemap complet** : toutes les URLs du sitemap concurrent, mappées en clusters avec le rôle de chacun (money, éditorial, programmatique, légal). Volumétrie par cluster.
3. **Dissection page par page** d'un échantillon large (30+ pages) : structure hn réelle, JSON-LD, maillage, CTA, preuves affichées.
4. **Gap analysis vérifiée DES DEUX CÔTÉS** : chaque « il fait X et pas nous » se vérifie par grep dans NOTRE code (pas seulement chez le concurrent) — la moitié des gaps supposés existent déjà en interne.
5. **Livrable en 3 colonnes** : « il fait mieux → à reprendre adapté » / « on fait mieux → à conserver et défendre » / « ses erreurs → items ajoutés à notre checklist QA ».
6. **Plan d'action effort × impact AVEC non-actions délibérées** : ce qu'on décide de NE PAS copier, justifié (dilution E-E-A-T, hors périmètre offre).
7. **Re-audit après chaque refonte concurrente** : un concurrent peut corriger 13 anti-patterns en une seule refonte — mesurer sa vélocité d'exécution fait partie du benchmark (et sa refonte peut aussi lui faire PERDRE sa couche GEO : vérifier les deux sens).
