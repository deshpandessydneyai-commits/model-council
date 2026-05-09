export type StakeLevel = 'exploratory' | 'implemented' | 'critical' | 'timeCritical' | 'resourceConstrained';

export type DomainType =
  | 'medical'
  | 'academic'
  | 'technical'
  | 'legal'
  | 'creative'
  | 'policy'
  | 'personal'
  | 'business'
  | 'unknown';

export interface StakeContext {
  label: string;
  description: string;
  mainPrompt: string;
  adversarialPrompt: (domain: DomainType) => string;
  biasCheckPrompt: (domain: DomainType) => string;
  accountabilityPrompt: (domain: DomainType) => string;
  estimatedImpactLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface DomainConfig {
  name: DomainType;
  keywords: RegExp;
  aliases: string[];
  failureScenario: string;
  stakeholder: string;
  consequenceType: string;
  description?: string;
}
