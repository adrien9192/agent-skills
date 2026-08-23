# agent-skills

Quatorze skills pour agents de code — Claude Code, Codex, Cursor, et tout runtime compatible avec le standard Agent Skills.

Elles ne sont pas théoriques : chacune est née d'un problème rencontré en production sur un parc d'une vingtaine de projets Next.js et Astro, et sert quotidiennement.

## Installation

```bash
# Une skill
cp -R skills/verify ~/.claude/skills/

# Toutes
cp -R skills/* adaptations/* ~/.claude/skills/
```

---

## Ce que j'ai construit

Dix skills écrites de zéro. Chacune répond à une question précise : *qu'est-ce qui, dans mon travail, échoue silencieusement ?*

### `verify` — prouver qu'un changement marche

**Le problème.** Un agent annonce « c'est corrigé » après avoir lu le code. Lire n'est pas exécuter.

**Ce qu'elle fait.** Impose la séquence : inspecter le diff → lint → typecheck → tests → build → tester le comportement réel. Elle distingue explicitement **exécuté** (commande lancée, sortie à l'appui), **inspecté** (fichier lu) et **supposé**.

**Ce qu'elle change.** Elle rend impossible la phrase « ça devrait marcher ». Sur ce parc, elle a mis au jour une négociation de contenu morte depuis l'origine : le code compilait, le composant s'exécutait, et la fonctionnalité n'avait jamais fonctionné. Aucune relecture ne l'aurait vue.

### `debug` — remonter à la cause, pas au symptôme

**Le problème.** Un rapport de bug nomme un symptôme. Le réflexe est de patcher là où ça fait mal.

**Ce qu'elle fait.** Reproduire d'abord, écrire un test qui échoue, corriger la cause, vérifier que les appelants voisins ne sont pas restés cassés.

**Ce qu'elle change.** Un garde-fou dans la fonction partagée est un diff plus court qu'un garde-fou dans chaque appelant — et il corrige les cas que le ticket ne nommait pas.

### `doctor` — auditer la configuration de l'agent

**Le problème.** Hooks morts, MCP déconnectés, skills en double, consignes orphelines. Rien ne le signale : l'agent fonctionne, moins bien.

**Ce qu'elle fait.** Passe en revue version, modèle, hooks, MCP, plugins, LSP, coût du contexte, doublons, éléments cassés ou inutilisés.

### `learn-error` — n'enregistrer que ce qui est prouvé

**Le problème.** Les bases de « leçons apprises » se remplissent d'hypothèses non vérifiées, qui deviennent du folklore.

**Ce qu'elle fait.** N'enregistre une leçon qu'**après** reproduction du bug **et** preuve de la correction par un test. Consigne date, projet, commit, cause, correctif, prévention.

**Ce qu'elle change.** Une base de connaissances où chaque entrée porte sa preuve — donc consultable sans se demander si c'est vrai.

### `architecture-review` — juger un design, pas un style

**Ce qu'elle fait.** Revoit frontières, couplage, flux de données, modes de défaillance, sécurité, arbitrages de montée en charge. Sur un design ou un diff.

### `setup-project` — câbler un dépôt sans écraser l'existant

**Ce qu'elle fait.** Détecte la stack, met en place configuration d'agent, hooks de pré-commit, commande qualité et CI — en **fusionnant** avec l'outillage déjà présent, jamais en le remplaçant.

### `advance-milestone` et `verify-milestone` — le jalon comme contrat

**Le problème.** Cocher des tâches n'est pas atteindre un objectif. Un jalon peut être « terminé » sans que le résultat promis existe.

**Ce qu'elles font.** `verify-milestone` part de l'objectif et vérifie en marche arrière que les résultats promis existent réellement dans le code et passent. `advance-milestone` ne passe au jalon suivant qu'une fois cette preuve faite.

### `auditing-websites` — auditer un site sur cinq axes

**Ce qu'elle fait.** Design/UX, code, SEO, GEO, CRO. Croise un audit externe outillé et une lecture du dépôt. Branches dédiées : pas de visibilité organique, jamais cité par les IA, site qui ne convertit pas, pages cannibalisées, contrôle de non-régression après refonte.

### `building-premium-sites` — construire un site sans inventer ses chiffres

**Le problème.** Une maquette vide met la pression. Les chiffres, témoignages, prix et années d'ancienneté que le client n'a jamais fournis finissent par être comblés au plausible, et partent en production.

**Ce qu'elle fait.** Impose un **gate** : toute donnée absente reste un item ouvert que seul un écrit du client referme. Un chiffre dicté à l'oral, une page LinkedIn ou un « je vous fais confiance » n'en referment aucun. Couvre l'intake, le choix Astro/Next, le SEO local, le GEO et la QA de déploiement. Une branche optionnelle traite le scrollytelling sans ajouter un second moteur : courbe émotionnelle, grammaire de page, empreinte inter-projets, encodage vidéo de scrub et audit temporel.

**Ce qu'elle change.** Quand la donnée manque, c'est le bloc qui sort de la maquette, pas la vérité qui s'adapte à la maquette.

---

## Ce que j'ai adapté

Quatre skills adaptées à un environnement de travail précis :

| Skill | Adaptation |
|---|---|
| `apex-doc` | Méthodologie APEX pour rapports, analyses, audits, mémos et propositions commerciales |
| `apex-decision` | Méthodologie APEX pour choisir : la sortie est une recommandation, pas un comparatif |
| `apex-brief` | Méthodologie APEX pour un briefing de réunion factuel et multi-sources |
| `build-site` | Orchestrateur Adrien : stack, sources, routes publiques/produit, gates de capacité/risque et cible local/preview/production |

`build-site` n'est pas autonome : il suppose le catalogue de dépendances nommé dans
`ROUTING.md` et `FIRST-RUN.md`. Cette distribution publique n'en embarque qu'une partie. Un
owner requis absent bloque la lane concernée ; il ne doit jamais être improvisé.

---

## Le fil conducteur

Ces skills partagent une conviction : **un agent échoue rarement en se trompant, il échoue en affirmant.**

Il affirme qu'un test passe sans l'avoir lancé. Qu'un bug est corrigé sans l'avoir reproduit. Qu'un jalon est atteint parce que les cases sont cochées. La plupart de ces skills sont donc des machines à exiger des preuves.

Le corollaire vaut pour elles-mêmes : celles qui embarquent un contrôle automatique portent un test de leur propre détection. Un contrôle qui ne trouve jamais rien peut être un contrôle cassé.

## Licence

MIT — voir `LICENSE`.
