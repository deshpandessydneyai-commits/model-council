import { DomainType, DomainConfig } from '@/lib/types/stakes';

const domainConfigs: Record<DomainType, DomainConfig> = {
  medical: {
    name: 'medical',
    keywords: /treatment|symptom|diagnosis|patient|disease|medication|therapy|clinical|health|doctor|nurse|hospital|condition|infection|prescription|dosage|surgery|vaccine|medicine|illness|cure/i,
    aliases: ['healthcare', 'health', 'medical', 'clinical'],
    failureScenario: 'patient suffering adverse effects',
    stakeholder: 'patient or healthcare provider',
    consequenceType: 'health outcomes',
    description: 'Medical/healthcare question',
  },
  academic: {
    name: 'academic',
    keywords: /research|study|thesis|dissertation|paper|hypothesis|evidence|theory|scholarly|literature|methodology|academic|peer review|citation|publication|experiment|data analysis|research question/i,
    aliases: ['research', 'scholarly', 'academic', 'thesis'],
    failureScenario: 'flawed research undermining credibility',
    stakeholder: 'peer reviewers or academic community',
    consequenceType: 'academic reputation and knowledge',
    description: 'Academic/research question',
  },
  technical: {
    name: 'technical',
    keywords: /architecture|system|database|api|microservice|scalability|performance|code|deploy|infrastructure|server|framework|algorithm|optimization|bug|stack|technical|engineering|software|programming|implementation/i,
    aliases: ['tech', 'technical', 'engineering', 'software'],
    failureScenario: 'system downtime or critical bugs',
    stakeholder: 'engineering team and end users',
    consequenceType: 'system reliability and user experience',
    description: 'Technical/engineering question',
  },
  legal: {
    name: 'legal',
    keywords: /lawsuit|contract|legal|court|statute|law|attorney|litigation|defendant|plaintiff|agreement|compliance|regulation|jurisdiction|precedent|trial|verdict|lawyer|legal advice/i,
    aliases: ['legal', 'law', 'court', 'litigation'],
    failureScenario: 'losing the case or legal liability',
    stakeholder: 'court or opposing counsel',
    consequenceType: 'legal standing or financial liability',
    description: 'Legal/law question',
  },
  creative: {
    name: 'creative',
    keywords: /story|character|plot|narrative|creative|write|scene|dialogue|author|book|film|script|artist|design|creative writing|fiction|screenplay|art|writing|creative project/i,
    aliases: ['creative', 'writing', 'story', 'design', 'art'],
    failureScenario: 'weak storytelling harming audience engagement',
    stakeholder: 'audience or critics',
    consequenceType: 'creative impact and audience reception',
    description: 'Creative/writing question',
  },
  policy: {
    name: 'policy',
    keywords: /policy|regulation|government|law|citizens|public|legislation|compliance|oversight|mandate|enforce|administrative|stakeholder impact|social|political|public policy/i,
    aliases: ['policy', 'government', 'public', 'regulation'],
    failureScenario: 'unintended consequences affecting citizens',
    stakeholder: 'affected citizens or legislative body',
    consequenceType: 'societal impact and policy outcomes',
    description: 'Policy/government question',
  },
  personal: {
    name: 'personal',
    keywords: /career|relationship|life|decision|future|personal|goal|family|friend|job|move|invest|choice|advice|should i|life choice|personal decision/i,
    aliases: ['personal', 'life', 'career', 'advice'],
    failureScenario: 'life regret or missed opportunity',
    stakeholder: 'yourself or your family',
    consequenceType: 'personal life satisfaction and wellbeing',
    description: 'Personal/life decision question',
  },
  business: {
    name: 'business',
    keywords: /market|revenue|strategy|competitive|roi|startup|enterprise|sales|customer|product|business|company|profit|investment|growth|acquisition|competitor|market strategy/i,
    aliases: ['business', 'market', 'startup', 'enterprise'],
    failureScenario: 'loss of market share or revenue',
    stakeholder: 'competitors or investors',
    consequenceType: 'business success and market position',
    description: 'Business/market question',
  },
  unknown: {
    name: 'unknown',
    keywords: /(?!)/,
    aliases: [],
    failureScenario: 'unspecified negative outcome',
    stakeholder: 'relevant stakeholders',
    consequenceType: 'decision quality',
    description: 'General question',
  },
};

export function detectDomain(text: string): DomainType {
  const normalizedText = text.toLowerCase();

  // Try exact matches first (highest confidence)
  for (const [domain, config] of Object.entries(domainConfigs)) {
    if (domain === 'unknown') continue;
    if (config.keywords.test(normalizedText)) {
      return domain as DomainType;
    }
  }

  return 'unknown';
}

export function getDomainConfig(domain: DomainType): DomainConfig {
  return domainConfigs[domain];
}

export function getAllDomainConfigs(): Record<DomainType, DomainConfig> {
  return domainConfigs;
}

// Helper to get domain description for UI
export function getDomainDescription(domain: DomainType): string {
  const config = getDomainConfig(domain);
  const domainLabel = domain === 'unknown' ? 'General' : domain.charAt(0).toUpperCase() + domain.slice(1);
  return `Detected: ${domainLabel} question`;
}
