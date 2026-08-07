# Revue qualité : design taste, socratique, CRO, images

## 1. Revue design anti-AI-slop

**Protocole** : (1) déterminer le « design read » — mode **preserve** (identité existante intentionnelle et documentée, à protéger) ou **redesign** — et fixer les curseurs (variance/motion/densité) AVANT de juger ; (2) captures desktop+mobile sur un échantillon de chaque famille de page + vérification dans le code (hiérarchie réelle des balises, pas le rendu) ; (3) séparer ce que la grille VALIDE (choix intentionnels) de ce qu'elle FLAG (slop à corriger).

**Catalogue de patterns slop (règles quantifiées)** :

| Pattern | Règle |
|---|---|
| Eyebrows/labels au-dessus de chaque titre | max ~1 pour 3 sections |
| Page « tout en cartes » (même grille 5-6 sections) | 1 famille de layout max 1×/page ; varier : listes à filet, bandes pleine largeur, rails |
| Hero surchargé (eyebrow+titre long+chips+CTA multiples+tagline) | max ~4 éléments, titre ≤ 2 lignes, sous-texte ≤ 20 mots |
| Marquees/carrousels multiples | max 1 par page |
| CTA à intention dupliquée (4+ libellés pour la même action) | 1 libellé par intention, partout |
| Bascules clair/sombre répétées | 1 bascule délibérée max (ex. CTA final) |
| Nav qui déborde aux breakpoints intermédiaires | tester les bornes réelles de bascule burger |
| Pas d'état actif de nav | fix a11y/UX à faible effort, toujours |

**Faux positifs à ne pas « corriger »** : identité de marque verrouillée et documentée (couleur signature, typo de caractère) ; pattern UX générique déconseillé mais fonctionnellement justifié (accordéon FAQ + schema FAQPage) ; artefacts de capture (`content-visibility:auto`) ; **animation d'entrée figée sur une capture** (élément à `opacity:0`/translaté avant son trigger GSAP → « élément manquant » qui est en fait animé — forcer l'état final ou vérifier le gating `navigator.webdriver`/`prefers-reduced-motion` avant de flag).

**Arbitrage design vs SEO = divergence assumée, documentée** : quand la grille design et l'intérêt SEO se contredisent (ex. h1 de 3 lignes chargé en mots-clés), on ne tranche pas en silence — décision explicite (« h1 conservé pour le SEO, police réduite pour le design ») consignée dans le rapport, pour que le prochain audit ne « corrige » pas l'arbitrage.

## 2. Revue socratique

Format : liste numérotée de questions fermées, chacune → réponse courte → **Décision explicite** (appliquée OU gate différée). Deux granularités : complète greenfield (~50 questions), delta post-changement (~15-20 sur ce qui a changé). Grille de 7 catégories :

1. **Conversion & CTA** : clarté du CTA primaire, unicité d'intention, friction, pas de cul-de-sac après succès, attentes de délai, requis/optionnel distingués.
2. **Accessibilité** : aria-live sur erreurs/succès async, outline focus jamais supprimé, alt légitimes (décoratives en `alt=""`), contrastes mesurés, focus des menus (Escape → déclencheur), hiérarchie de titres, nom accessible des cartes-liens, **`prefers-reduced-motion` désactive réellement animations et autoplay vidéo** (WCAG 2.3.3 — présence de la media query ET couverture de la couche motion, pas juste une transition).
3. **Performance** : format/priority/lazy selon rôle LCP, libs JS lourdes arbitrées (coût bundle vs risque), fonts, décoratif en CSS plutôt que JS, périmètre client minimal, content-visibility sur pages longues, **animations d'entrée (split-text du h1, counters, parallax) qui ne décalent pas le layout ni ne retardent le LCP** (réserver la place, animer `transform`/`opacity` pas la géométrie).
4. **SEO/GEO** : meta uniques et calibrées, canonical+hreflang cohérents, données structurées valides, ancres descriptives, sitemap frais, schema FAQ seulement si contenu visible, lisibilité agents/LLM, OG images, fil d'Ariane visible = schema.
5. **Contenu & voix** : tics bannis, vocabulaire IA générique, parallélisme négatif, CTA à verbes d'action, titres mots-clés sans perdre la voix, stats sourcées datées jamais inventées.
6. **Confiance** : politique de confidentialité vs tracking réel (mismatch = non-conformité légale, priorité absolue, déployée seule), zéro témoignage/logo/avis fabriqué, E-E-A-T incarné, aucun prix inventé, gates explicites.
7. **Robustesse** : anti-spam/rate-limit sur formulaires publics, redirections vs données Search Console, 404 de marque, dégradation sans JS évaluée consciemment.

**Discipline de déploiement** : corrections chirurgicales, statut par item (à faire/ok/corrigé/ouvert), déployer par lots cohérents — SAUF conformité légale/sécurité : immédiat et séparé.

**Gate, ne pas fabriquer** : opportunité réelle mais donnée manquante (délai de réponse, témoignage, prix) → item ouvert dépendant du client, jamais clos par invention.

## 3. Audit CRO / copywriting

Poser d'abord **l'objectif de conversion primaire unique** de la page. 5 frictions à chasser :
1. Positionnement trop large qui dilue l'offre cœur (titre qui dérive vers du langage généraliste).
2. CTA jugé sur sa **spécificité de valeur** : engagement perçu faible et concret > générique correct.
3. Preuves formulées défensivement (« nous ne faisons pas X ») → reformuler positivement (méthode, livrables).
4. Différenciateur secondaire (techno, buzzword) visuellement surreprésenté vs l'offre principale.
5. Bénéfices abstraits → « ce que le visiteur gagne concrètement ».

Réécriture : clarté avant style ; mots-clés de l'offre principale en tête ; CTA = prochain pas à engagement faible ; preuves honnêtes uniquement ; traiter l'objection du statu quo ; chaque page interne permet de **trancher entre des actions concrètes** (corriger/refondre/migrer/optimiser), pas seulement décrire. Passe finale : jargon réduit, bénéfices sectoriels concrets, ton humain, verbes d'action.

## 4. Audit images / performance

- Chaque page publique : ≥ 1 image significative avec alt (vérifiable par script).
- Sources lourdes → WebP compressé (~< 100 Ko cible) ; dimensions explicites (CLS).
- Assets originaux ou logos officiels **stockés localement** (jamais de hotlink : dépendance + licence).
- LCP : image candidate explicitement priorisée (priority/preload) — ou pas d'image du tout sur le LCP (hero texte/SVG élimine la classe de risque) ; sous le pli = lazy.
- Alterner les types de visuels (photo, schéma/SVG, logo réel) — une suite d'illustrations générées trop semblables = tell IA.
- Favicon/manifest à la vraie marque. Assets reproductibles dans le repo déployé.
- **Vidéos explicatives (Remotion offline ou autre)** : source `.mp4` servie en **200** (piège récurrent : rendue au build ? non-régénérée = bloc 404), attribut `poster` présent (évite frame blanche + CLS), dimensions/ratio explicites, `autoplay` toujours `muted playsInline`, désactivée sous `prefers-reduced-motion`. Vérifiable par script (`audit-local.mjs` teste maintenant chaque `<video>`).

## 5. QA automatisée (pattern `assets/audit-local.mjs`)

Boucle pages × breakpoints (mobile/tablet/desktop) : HTTP 200, h1 unique, pas de débordement horizontal, meta description 50-170 c, canonical absolu, JSON-LD présent, image+alt, chaque `<video>` (source 200 + poster + autoplay muet), menu mobile visible, scan axe-core, erreurs console, requêtes échouées. Séparément : routes machine (robots, sitemap, llms.txt, manifest) en 200 avec le bon content-type ; routes API testées avec payload invalide (pas de crash). Adapter la liste de pages/domaine ; revalider les sélecteurs à chaque changement de composant.

## 6. Couche animation & vidéo (GSAP / Remotion)

Un site premium construit avec la skill jumelle `building-premium-sites` embarque une couche motion (GSAP + Lenis, un moteur type `engine.ts`) et des vidéos explicatives rendues offline (Remotion → `.mp4` auto-hébergées). **Un audit ne l'écrit pas — il la juge**, comme tout le reste. Ne jamais conclure « GSAP/Remotion n'a aucun rapport avec un audit » : c'est un axe transverse Design/UX + accessibilité + performance. Checklist :

| Check | Axe | Défaillance concrète |
|---|---|---|
| `prefers-reduced-motion` désactive animations ET autoplay vidéo | a11y (WCAG 2.3.3) | animation non désactivable = fail accessibilité |
| Chaque `.mp4` référencée servie en **200** (pas 404) | pre-launch / robustesse | piège récurrent : vidéo non re-rendue au build → bloc 404 en prod |
| `<video>` : `poster` + dimensions explicites | perf (CLS) | frame blanche au chargement, saut de layout |
| `autoplay` toujours `muted playsInline` | robustesse | politique navigateur bloque l'autoplay non-muet |
| Animations d'entrée (split-text h1, counters, parallax) réservent leur place | perf (CLS/LCP) | h1 animé qui décale le contenu / retarde le LCP |
| Gating `navigator.webdriver` (+ reduced-motion) sur le moteur motion | méthode d'audit | sans lui, captures QA non déterministes → faux positifs « élément manquant »/contraste |

Ces contrôles sont partiellement automatisés par `audit-local.mjs` (source vidéo 200, poster, autoplay muet) ; reduced-motion, CLS/LCP et gating webdriver restent une revue de code (grep du moteur motion + de la media query). Ce qui touche **écrire ou modifier** l'animation relève de `building-premium-sites` / `design-taste-frontend`, jamais de cette skill.
