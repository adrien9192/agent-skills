// Workflow d'audit multi-axes turnkey (skill auditing-websites).
// Invocation (scriptPath ABSOLU, pas de tilde) : Workflow({ scriptPath: '<ce fichier>',
//   args: { domain, repoPath?, competitors?: [], mode?: 'full'|'geo-regression'|'pre-launch',
//           compareTo?, small?: bool, skillDir?: '<racine de la skill si copie répliquée>' } })
// Couvre les étapes 2-3 du Process (collecte + réconciliation). Le scoring par
// axe, la revue qualité et le plan 4 paliers restent au thread principal.
// Encode la règle centrale de la méthode : AUCUN finding n'atteint le thread
// principal sans verdict du fact-checker — la réconciliation est structurelle,
// pas déclarative.

export const meta = {
  name: 'audit-site',
  description: 'Audit multi-axes (SEO/GEO/design/CRO/code) avec réconciliation factuelle non-sautable',
  whenToUse: 'Audit complet d un site, contrôle de non-régression GEO post-refonte, validation pre-launch',
  phases: [
    { title: 'Gate', detail: 'indexabilité (prérequis)' },
    { title: 'Collecte', detail: 'un agent par axe + fiches concurrents' },
    { title: 'Réconciliation', detail: 'fact-check adversarial par lots de 10' },
  ],
}

// Certains harness livrent args en string JSON — normaliser avant toute lecture.
const ARGS = typeof args === 'string' ? JSON.parse(args) : args
const SKILL = (ARGS && ARGS.skillDir) || '<skill-dir>'
const domain = ARGS && ARGS.domain
if (!domain) throw new Error('args.domain requis (ex: https://client.fr)')
const repoPath = (ARGS && ARGS.repoPath) || null
let competitors = (ARGS && ARGS.competitors) || []
const noCompetitors = Boolean(ARGS && ARGS.noCompetitors) // true = benchmark explicitement exclu
const queries = (ARGS && ARGS.queries) || [] // requêtes cibles connues (aident la découverte)
const mode = (ARGS && ARGS.mode) || 'full'
const compareTo = (ARGS && ARGS.compareTo) || null
const small = Boolean(ARGS && ARGS.small)

const CONTRAT = `Contrat de sortie STRICT (cf. ${SKILL}/ORCHESTRATION.md §2) : uniquement une liste de findings
{ id (unique au sein de l'axe), axe, url, claim, preuve (extrait brut cité), verify_cmd (commande curl/grep exacte rejouable — OBLIGATOIRE),
palier_propose (P0|P1|P2|P3), confidence (haute|moyenne|basse) }.
Interdictions : conclure, scorer, recommander, affirmer "absent" sans citer le HTML brut téléchargé (curl -s, jamais un fetch qui filtre les <script>).`

const FINDINGS_SCHEMA = {
  type: 'object', required: ['findings'],
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'axe', 'url', 'claim', 'preuve', 'verify_cmd', 'palier_propose', 'confidence'],
        properties: {
          id: { type: 'string' }, axe: { type: 'string' }, url: { type: 'string' },
          claim: { type: 'string' }, preuve: { type: 'string' }, verify_cmd: { type: 'string' },
          palier_propose: { type: 'string', enum: ['P0', 'P1', 'P2', 'P3'] },
          confidence: { type: 'string', enum: ['haute', 'moyenne', 'basse'] },
        },
      },
    },
  },
}

const VERDICTS_SCHEMA = {
  type: 'object', required: ['verdicts'],
  properties: {
    verdicts: {
      type: 'array',
      items: {
        type: 'object', required: ['id', 'verdict', 'preuve_verification'],
        properties: {
          id: { type: 'string' },
          verdict: { type: 'string', enum: ['CONFIRMÉ', 'INFIRMÉ', 'INVÉRIFIABLE'] },
          preuve_verification: { type: 'string' },
        },
      },
    },
  },
}

const GATE_SCHEMA = {
  type: 'object', required: ['indexable', 'details'],
  properties: { indexable: { type: 'boolean' }, details: { type: 'string' } },
}

// ---------------------------------------------------------------------------
const gate = await agent(
  `Vérifie l'indexabilité de ${domain} par curl : curl -sIL (status, redirections, X-Robots-Tag), curl -s de la home (meta robots noindex ?, <link rel=canonical> aligné sur le domaine ?), curl ${domain}/robots.txt. indexable=false si noindex, canonical cassé ou blocage robots. details = ce que tu as observé, avec extraits.`,
  { label: 'gate:indexabilite', phase: 'Gate', model: 'haiku', schema: GATE_SCHEMA },
)
if (gate && !gate.indexable) log(`P0 indexabilité : ${gate.details} — audit poursuivi, tout le reste conditionné à ce fix (ORCHESTRATION.md §1)`)

// Découverte automatique des concurrents si non fournis (ORCHESTRATION.md §3).
if (!competitors.length && !noCompetitors && mode !== 'geo-regression') {
  const DISCOVERY_SCHEMA = {
    type: 'object', required: ['competitors'],
    properties: { competitors: { type: 'array', items: { type: 'object', required: ['domain', 'raison'], properties: { domain: { type: 'string' }, raison: { type: 'string' } } } } },
  }
  const found = await agent(
    `Identifie les 3-5 VRAIS concurrents de ${domain}. Méthode : 1) curl -s ${domain} pour comprendre l'offre et la zone (title, h1, services, ville). 2) ${queries.length ? `Requêtes cibles connues : ${queries.join(', ')}.` : 'Déduis 5-8 requêtes cibles (service + ville si business local).'} 3) Recherche web sur ces requêtes ; retiens les domaines récurrents dans les résultats organiques. EXCLUS : annuaires, marketplaces, médias, agrégateurs (PagesJaunes, Yelp, Amazon, presse) et ${domain} lui-même. Un concurrent = un site qui vend la même chose à la même cible. Pour chacun : domain (URL racine) + raison (1 ligne : sur quelles requêtes il apparaît).`,
    { label: 'discovery:concurrents', phase: 'Collecte', model: 'haiku', schema: DISCOVERY_SCHEMA },
  )
  competitors = ((found && found.competitors) || []).map((c) => c.domain).slice(0, 5)
  log(competitors.length ? `Concurrents découverts : ${competitors.join(', ')}` : 'Aucun concurrent identifié avec certitude — benchmark sauté')
}

// ---------------------------------------------------------------------------
const repoNote = repoPath
  ? `Le code du site est disponible : ${repoPath} — vérifie dans le code réel, cite fichier:ligne en preuve.`
  : `Pas de repo local : audit prod-only par curl (le noter dans les findings concernés).`
const modeNote = mode === 'pre-launch'
  ? 'Mode PRE-LAUNCH : le site va être mis en ligne — priorité aux bloquants (formulaire, indexabilité future, légal).'
  : ''

const AXES = [
  {
    key: 'seo', model: 'sonnet',
    prompt: `Tu audites ${domain} sur l'axe SEO (technique + sémantique). Lis d'abord ${SKILL}/METHODE-AUDIT.md sections 1, 3, 4, 6 et ${SKILL}/ORCHESTRATION.md sections 2 et 4 (protocole curl). ${repoNote} ${modeNote} Collecte : indexabilité par page, canonical/hreflang, meta (unicité, 50-170c), doublons sur même intention (candidats consolidation), maillage interne (plancher de liens), pages orphelines de la nav, sitemap (lastmod statiques ?). ${CONTRAT}`,
  },
  {
    key: 'geo', model: 'haiku',
    prompt: `Tu audites ${domain} sur l'axe GEO (agent-readiness). Lis d'abord ${SKILL}/METHODE-AUDIT.md section 5 et ${SKILL}/ORCHESTRATION.md section 4. Batterie curl : /llms.txt et /llms-full.txt ; négociation markdown (curl -H 'Accept: text/markdown' + header Vary) ; /robots.txt (bots IA nommés : GPTBot, ClaudeBot, PerplexityBot, Google-Extended + Content-Signal) ; RSS ; JSON-LD bruts par famille de page ; date de mise à jour VISIBLE dans le body. Chaque item : présent/absent/malformé + extrait de preuve.${compareTo ? ` MODE COMPARE : rejoue exactement la même batterie sur ${compareTo} et produis le diff — ce que la version actuelle a PERDU par rapport à l'ancienne est un finding par élément perdu (cas réel : un site a perdu toute sa couche GEO en refondant).` : ''} ${CONTRAT}`,
  },
  {
    key: 'design', model: 'sonnet',
    prompt: `Tu audites ${domain} sur l'axe design/UX anti-slop. Lis d'abord ${SKILL}/REVUE-QUALITE.md section 1 (grille quantifiée + faux positifs) et ${SKILL}/ORCHESTRATION.md section 2. ÉTAPE BLOQUANTE avant tout jugement : déterminer le design read (preserve : identité documentée à protéger / redesign) ${repoPath ? `en cherchant le doc de marque dans ${repoPath}` : 'en observant la cohérence délibérée du site'}. Captures Playwright 390/768/1440 par famille de page si possible (forcer content-visibility:visible avant), sinon analyse du HTML/CSS par curl. Vérifie la hiérarchie RÉELLE des balises (h1-h3 dans le code, pas le rendu). Sépare VALIDE (intentionnel) de FLAG (slop). ${CONTRAT}`,
  },
  {
    key: 'cro', model: 'sonnet',
    prompt: `Tu audites ${domain} sur l'axe CRO/copywriting. Lis d'abord ${SKILL}/REVUE-QUALITE.md section 3 et ${SKILL}/ORCHESTRATION.md section 2. Pour chaque page clé (curl) : pose D'ABORD l'objectif de conversion primaire unique (introuvable = premier finding) ; chasse les 5 frictions ; parcours complet vers la conversion (CTA visibles, formulaire fonctionnel, téléphone cliquable mobile, réassurance à côté du formulaire). Règle dure : chaque finding inclut la réécriture proposée dans le champ preuve — jamais "améliorer le copy" ; donnée manquante (prix, délai, témoignage) = finding marqué [GATE CLIENT] dans le claim. ${CONTRAT}`,
  },
  {
    key: 'code', model: 'sonnet',
    prompt: `Tu audites ${domain} sur l'axe code/perf/a11y/confiance. Lis d'abord ${SKILL}/REVUE-QUALITE.md sections 2, 4, 5 et ${SKILL}/ORCHESTRATION.md section 4. ${repoNote} Collecte : images (WebP, dimensions, priority/lazy selon LCP, hotlinks), headers sécurité/CSP, formulaires (anti-spam, rate-limit, payload invalide sur les routes API — pas de crash), TRACKING RÉEL vs politique de confidentialité (mismatch = P0 isolé, jamais noyé dans un lot cosmétique), erreurs console. Pièges : contraste axe-core faussé par content-visibility:auto ; scan à 0 éléments = sélecteur obsolète, pas un succès. ${CONTRAT}`,
  },
]

const collectors = mode === 'geo-regression'
  ? AXES.filter((a) => a.key === 'geo')
  : small
    ? AXES.filter((a) => ['seo', 'geo', 'cro'].includes(a.key))
    : AXES

function chunk(arr, n) {
  const out = []
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n))
  return out
}

// Pipeline par axe : chaque axe part en réconciliation dès que SA collecte
// finit (pas de barrière entre axes). Le fact-check utilise l'agent dédié
// site-fact-checker (haiku, stance adversariale, catalogue de faux positifs).
const perAxe = await pipeline(
  collectors,
  (a) => agent(a.prompt, { label: `collecte:${a.key}`, phase: 'Collecte', model: a.model, schema: FINDINGS_SCHEMA }),
  async (result, a) => {
    const findings = (result && result.findings) || []
    if (!findings.length) return { axe: a.key, findings: [], verdicts: [] }
    const lots = chunk(findings, 10)
    const verdictLots = await parallel(lots.map((lot, i) => () =>
      agent(
        `Réconciliation factuelle adversariale. Domaine audité : ${domain}${repoPath ? ` ; repo : ${repoPath}` : ''}.\nClaims à vérifier (exécute chaque verify_cmd tel quel, verdict par claim) :\n${JSON.stringify(lot, null, 2)}\nSortie : UNIQUEMENT le JSON au schéma imposé (pas de tableau markdown, pas de ligne Total) — un objet par claim { id: identique au finding, verdict: CONFIRMÉ|INFIRMÉ|INVÉRIFIABLE, preuve_verification: commande exécutée + extrait exact }.`,
        { label: `verify:${a.key}#${i + 1}`, phase: 'Réconciliation', agentType: 'site-fact-checker', schema: VERDICTS_SCHEMA },
      ),
    ))
    const verdicts = verdictLots.filter(Boolean).flatMap((v) => v.verdicts || [])
    return { axe: a.key, findings, verdicts }
  },
)

// Fiches concurrents en parallèle de tout le reste (pas de fact-check : ce sont
// des fiches normalisées, pas des claims sur NOTRE site).
const fichesConcurrents = competitors.length
  ? await parallel(competitors.map((c) => () =>
      agent(
        `Fiche benchmark normalisée du concurrent ${c}. Lis d'abord ${SKILL}/METHODE-AUDIT.md section 8. Par curl uniquement : nav + clusters depuis le HTML et sitemap.xml (familles d'URLs, volumétrie par cluster), checklist GEO (llms.txt, Accept: text/markdown, robots bots IA, RSS, JSON-LD), signaux E-E-A-T visibles (auteur nommé, dates, sources, preuves chiffrées), proposition de valeur du hero + CTA primaire (verbatim). Champs IDENTIQUES pour tous les concurrents. Interdiction d'extrapoler positions/trafic sans donnée (directionnel uniquement). Retourne la fiche en markdown compact.`,
        { label: `scout:${c}`, phase: 'Collecte', model: 'haiku' },
      ),
    ))
  : []

// Tri final (inline — aucun agent ne juge ici) : seuls les CONFIRMÉS passent,
// les INFIRMÉS sont archivés avec preuve (jurisprudence), les INVÉRIFIABLES
// listés à part, jamais promus.
const verifies = []
const fauxPositifs = []
const inverifiables = []
for (const bloc of perAxe.filter(Boolean)) {
  const byId = new Map(bloc.verdicts.map((v) => [v.id, v]))
  for (const f of bloc.findings) {
    const v = byId.get(f.id)
    const enriched = { ...f, verdict: v ? v.verdict : 'INVÉRIFIABLE', preuve_verification: v ? v.preuve_verification : 'aucun verdict rendu' }
    if (enriched.verdict === 'CONFIRMÉ') verifies.push(enriched)
    else if (enriched.verdict === 'INFIRMÉ') fauxPositifs.push(enriched)
    else inverifiables.push(enriched)
  }
}

const stats = {}
for (const f of verifies) stats[f.axe] = (stats[f.axe] || 0) + 1
log(`Findings vérifiés : ${verifies.length} confirmés, ${fauxPositifs.length} faux positifs écartés, ${inverifiables.length} invérifiables`)

return {
  gate,
  mode,
  findings_confirmes_par_axe: verifies,
  faux_positifs_archives: fauxPositifs,
  inverifiables,
  fiches_concurrents: fichesConcurrents.filter(Boolean),
  stats_confirmes_par_axe: stats,
  suite_au_thread_principal: 'Scoring par axe (ORCHESTRATION.md §5), revue qualité (REVUE-QUALITE.md), plan 4 paliers + livrable (ORCHESTRATION.md §6-7). Aucun INVERIFIABLE ne doit être promu.',
}
