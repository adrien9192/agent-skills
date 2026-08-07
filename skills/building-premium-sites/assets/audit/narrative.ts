// REFERENCE IMPLEMENTATION — the system prompt below carries a founder PERSONA
// as {{PLACEHOLDERS}} (brand, activity, city): fill them in, or regenerate the
// prompt entirely, for every site before any use.
// Report narrative generation. The interface is decoupled so the provider
// (deterministic stub now, AI later) stays interchangeable without touching the
// rest of the flow. Voice: B2B founder, formal "vous", no em dash.

import type { AuditReport, Severity } from './scoring';

export interface AuditNarrative {
  intro: string;
  conclusion: string;
}

export interface NarrativeProvider {
  generate(report: AuditReport, locale: 'fr' | 'en'): Promise<AuditNarrative>;
}

function count(report: AuditReport, severity: Severity): number {
  return report.findings.filter((f) => f.severity === severity).length;
}

function verdictFr(score: number): string {
  if (score >= 85) return 'solides';
  if (score >= 65) return 'correctes mais perfectibles';
  if (score >= 45) return 'fragiles';
  return 'à reprendre en priorité';
}

function verdictEn(score: number): string {
  if (score >= 85) return 'solid';
  if (score >= 65) return 'decent but improvable';
  if (score >= 45) return 'fragile';
  return 'a priority to rework';
}

/**
 * AI provider via the Anthropic API (compliant, scalable). Enabled only when
 * ANTHROPIC_API_KEY is set; otherwise it falls back to the deterministic stub.
 * NB: no personal subscription is used here (ToS); commercial API key only.
 */
export const apiNarrative: NarrativeProvider = {
  async generate(report, locale) {
    const key = process.env.ANTHROPIC_API_KEY?.trim();
    if (!key) return deterministicNarrative.generate(report, locale);

    const findings = report.findings
      .filter((f) => f.severity !== 'good')
      .map((f) => `- [${f.severity}] ${f.title}: ${f.detail}`)
      .join('\n');
    const axes = report.axisScores
      .filter((a) => a.applicable)
      .map((a) => `${a.label}: ${a.score}/100`)
      .join(', ');

    const lang = locale === 'en' ? 'American English' : 'francais (avec accents)';
    const system =
      `Tu es le fondateur de {{COMPANY}}, agence web (WordPress, Shopify, automatisation IA), basee a {{CITY}}. ` +
      `Tu rediges en ${lang}, voix fondateur B2B, vouvoiement, ton direct et concret. ` +
      `Interdits : tiret cadratin, regle de trois, paralleles negatifs, jargon vague, promesses non chiffrees. ` +
      `Tu produis STRICTEMENT un objet JSON {"intro": string, "conclusion": string}. ` +
      `intro = 2 a 3 phrases qui resument l'etat du site et le score. ` +
      `conclusion = 2 phrases qui pointent le premier levier et invitent a nous contacter, sans sur-promettre.`;
    const user =
      `Score global: ${report.globalScore}/100. Axes: ${axes}. ` +
      `Site: ${report.signals.finalUrl} (plateforme: ${report.signals.platform}). ` +
      `Points releves:\n${findings || 'aucun point bloquant majeur'}`;

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 700,
          system,
          messages: [{ role: 'user', content: user }],
        }),
      });
      if (!res.ok) throw new Error(`anthropic ${res.status}`);
      const data = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
      const text = data.content?.find((b) => b.type === 'text')?.text ?? '';
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('no json');
      const parsed = JSON.parse(match[0]) as Partial<AuditNarrative>;
      if (typeof parsed.intro !== 'string' || typeof parsed.conclusion !== 'string') throw new Error('bad shape');
      return { intro: parsed.intro, conclusion: parsed.conclusion };
    } catch (e) {
      console.error('[audit] api narrative failed, fallback to stub', e);
      return deterministicNarrative.generate(report, locale);
    }
  },
};

/** Picks the provider: AI when an API key is present, deterministic stub otherwise. */
export function getNarrativeProvider(): NarrativeProvider {
  return process.env.ANTHROPIC_API_KEY ? apiNarrative : deterministicNarrative;
}

/** Default provider: writes the report straight from the findings, no AI. */
export const deterministicNarrative: NarrativeProvider = {
  async generate(report, locale) {
    const { globalScore, signals, topPriorities } = report;
    const criticals = count(report, 'critical');
    const warnings = count(report, 'warning');
    const top = topPriorities[0];

    if (locale === 'en') {
      const intro =
        `We analyzed ${signals.finalUrl} and scored it ${globalScore}/100. ` +
        `Your foundations look ${verdictEn(globalScore)}. ` +
        `We found ${criticals} blocking issue${criticals === 1 ? '' : 's'} and ${warnings} improvement${warnings === 1 ? '' : 's'} across four areas: website, e-commerce, SEO/GEO and automation.`;
      const conclusion = top
        ? `The first lever we would pull: ${top.title.toLowerCase()}. ` +
          `It is exactly the kind of work we handle day to day. Tell us about your context and we will map a concrete plan, no jargon.`
        : `Your site is in good shape. If you want to push further on conversion, SEO/GEO or automation, we are happy to look together.`;
      return { intro, conclusion };
    }

    const intro =
      `Nous avons analysé ${signals.finalUrl} et lui attribuons la note de ${globalScore}/100. ` +
      `Vos fondations paraissent ${verdictFr(globalScore)}. ` +
      `Nous relevons ${criticals} point${criticals > 1 ? 's' : ''} bloquant${criticals > 1 ? 's' : ''} et ${warnings} amélioration${warnings > 1 ? 's' : ''} sur quatre axes : site, e-commerce, SEO/GEO et automatisation.`;
    const conclusion = top
      ? `Le premier levier que nous activerions : ${top.title.toLowerCase()}. ` +
        `C'est exactement le type de chantier que nous menons au quotidien. Parlez-nous de votre contexte, nous vous proposerons un plan concret, sans jargon.`
      : `Votre site est en bon état. Pour aller plus loin sur la conversion, le SEO/GEO ou l'automatisation, regardons cela ensemble.`;
    return { intro, conclusion };
  },
};
