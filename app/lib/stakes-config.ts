import { StakeContext, DomainType } from '@/lib/types/stakes';

export const stakeContexts: Record<string, StakeContext> = {
  exploratory: {
    label: 'Exploratory',
    description: 'Intellectual exploration. Models will prioritize nuance over certainty. ✓ Encourage alternative perspectives ✓ Explore trade-offs and unknowns',
    mainPrompt: `You are providing an intellectual analysis of this question.
This is exploratory in nature—the goal is thorough understanding rather than implementation.
Feel free to explore nuances, trade-offs, and alternative perspectives without pressure for a single "right answer."`,

    adversarialPrompt: (domain: DomainType) => {
      const domainSpecific: Record<DomainType, string> = {
        medical: 'What alternative medical explanations or treatment approaches should be considered?',
        academic: 'What is the strongest counterargument that other researchers might make?',
        technical: 'What alternative architecture or approach might work better?',
        legal: 'What is the opposing counsel\'s strongest argument?',
        creative: 'What weaknesses could a critic find in this concept?',
        policy: 'What is the strongest argument from those who oppose this policy?',
        personal: 'What is the best argument for the opposite choice?',
        business: 'What would a thoughtful skeptic say about this strategy?',
        unknown: 'What is a compelling counterargument to this position?',
      };
      return domainSpecific[domain] || domainSpecific.unknown;
    },

    biasCheckPrompt: (domain: DomainType) => {
      const domainSpecific: Record<DomainType, string> = {
        medical: 'Identify any anchoring bias toward popular treatments or confirmation bias in evidence selection.',
        academic: 'Check for publication bias, p-hacking, or over-reliance on recent studies.',
        technical: 'Look for trend-chasing (microservices hype?) or cargo-cult programming.',
        legal: 'Identify anchoring from opening statements or recency bias from recent case law.',
        creative: 'Check for trend-chasing in genre conventions or echo-chamber consensus.',
        policy: 'Look for political bias, lobbyist influence, or local vs global thinking.',
        personal: 'Check for availability heuristic (recent events), sunk cost fallacy, or status quo bias.',
        business: 'Identify survivor bias (focusing on success stories) or trend-chasing.',
        unknown: 'Check for confirmation bias and groupthink.',
      };
      return `Before finalizing, identify cognitive biases: ${domainSpecific[domain] || domainSpecific.unknown}`;
    },

    accountabilityPrompt: (domain: DomainType) => {
      const domainSpecific: Record<DomainType, string> = {
        medical: 'If you had to explain this to the patient and accept blame if it goes wrong, would you change anything?',
        academic: 'If this was published under your name and defended against critics, would you change it?',
        technical: 'If you were on-call 24/7 debugging production issues, would you change the design?',
        legal: 'If you had to stake your bar license on this argument, would you change your position?',
        creative: 'If your career reputation depended entirely on this work, would you change anything?',
        policy: 'If you were personally responsible for unintended consequences, would you change the policy?',
        personal: 'If you had to live with this decision for 20 years, would you change anything?',
        business: 'If you were personally liable for financial losses, would you change your strategy?',
        unknown: 'If you were personally accountable for failure, would you change anything?',
      };
      return domainSpecific[domain] || domainSpecific.unknown;
    },

    gapCheckPrompt: (domain: DomainType) => {
      const domainSpecific: Record<DomainType, string> = {
        medical: 'What relevant research, conditions, or patient subgroups are we not discussing?',
        academic: 'What assumptions are we making that we haven\'t explicitly questioned? What contradicting evidence exists?',
        technical: 'What architectural concerns, security issues, or scaling challenges are missing from this analysis?',
        legal: 'What legal precedents, jurisdictional issues, or procedural requirements are we overlooking?',
        creative: 'What genre conventions, audience expectations, or cultural contexts aren\'t we addressing?',
        policy: 'What stakeholder groups, economic impacts, or implementation challenges are we underrepresenting?',
        personal: 'What information about your circumstances, priorities, or constraints might change this decision?',
        business: 'What market trends, customer needs, or competitive moves aren\'t we anticipating?',
        unknown: 'What essential information, perspectives, or considerations are we missing?',
      };
      return `Identify gaps: ${domainSpecific[domain] || domainSpecific.unknown}`;
    },

    estimatedImpactLevel: 'low',
  },

  implemented: {
    label: 'Implementation',
    description: 'This will be acted upon. Models will focus on practical concerns. ✓ Stress-test for implementation failures ✓ Check for unintended consequences',
    mainPrompt: `This recommendation will be implemented in the real world.
Real outcomes and consequences depend on the accuracy of this analysis.
Provide thorough analysis that accounts for practical implementation challenges, unintended side effects, and stakeholder impact.
Assume this advice will be followed—be appropriately cautious and complete.`,

    adversarialPrompt: (domain: DomainType) => {
      const domainSpecific: Record<DomainType, string> = {
        medical: 'What serious side effects or contraindications might apply to some patients?',
        academic: 'What is the strongest empirical counterargument published in literature?',
        technical: 'What are the main failure modes when this system scales or encounters edge cases?',
        legal: 'What is the strongest legal precedent that argues against this position?',
        creative: 'What would harsh critics say are the fundamental flaws in this approach?',
        policy: 'What unintended negative consequences could this policy trigger?',
        personal: 'What is the most compelling argument for the opposite choice?',
        business: 'How would a market competitor or disruptive startup attack this strategy?',
        unknown: 'What is the strongest counterargument to this recommendation?',
      };
      return `Identify the most critical counterargument: ${domainSpecific[domain] || domainSpecific.unknown}`;
    },

    biasCheckPrompt: (domain: DomainType) => {
      const domainSpecific: Record<DomainType, string> = {
        medical: 'Are we anchoring on familiar treatments? Missing rare but highly effective alternatives? Ignoring patient subgroups?',
        academic: 'Are we subject to publication bias? Are we over-weighting recent studies? Missing contradicting evidence?',
        technical: 'Are we trend-chasing? Over-optimizing prematurely? Ignoring operational complexity?',
        legal: 'Are we anchoring on opening position? Ignoring stronger precedents? Underestimating opponent?',
        creative: 'Are we following trends blindly? Missing the unique angle? Over-consulting the same peer group?',
        policy: 'Are we subject to political pressure? Lobbyist influence? Ignoring vulnerable populations?',
        personal: 'Are we overweighting recent events (recency bias)? Sunk cost fallacy? Status quo bias?',
        business: 'Are we ignoring how competitors will respond? Focusing only on success stories? Missing market shifts?',
        unknown: 'Check for confirmation bias, groupthink, and narrow perspective.',
      };
      return `${domainSpecific[domain] || domainSpecific.unknown}`;
    },

    accountabilityPrompt: (domain: DomainType) => {
      const domainSpecific: Record<DomainType, string> = {
        medical: 'If this treatment fails and the patient is harmed, could you defend your recommendation to a medical board?',
        academic: 'If other researchers found flaws in this analysis, could you defend it in peer review?',
        technical: 'If this causes a 4-hour production outage, could you defend the architectural choice?',
        legal: 'If you lose this case, could you defend your strategy to the client?',
        creative: 'If this project fails critically, could you defend your creative choices?',
        policy: 'If this policy causes unintended harm, could you defend it to affected communities?',
        personal: 'If in 5 years this turns out to be the wrong choice, would you regret it?',
        business: 'If this strategy loses $5M in market share, could you defend it to investors?',
        unknown: 'If this fails, could you defend your recommendation?',
      };
      return `Before finalizing: ${domainSpecific[domain] || domainSpecific.unknown}`;
    },

    gapCheckPrompt: (domain: DomainType) => {
      const domainSpecific: Record<DomainType, string> = {
        medical: 'What patient populations, rare conditions, or unexpected interactions could we be missing?',
        academic: 'What experimental design flaws, methodological limitations, or alternative explanations haven\'t we considered?',
        technical: 'What operational risks, maintenance burdens, or future compatibility issues are we not accounting for?',
        legal: 'What regulatory changes, enforcement precedents, or jurisdictional conflicts could we be overlooking?',
        creative: 'What audience segments, cultural sensitivities, or artistic nuances are we underexploring?',
        policy: 'What vulnerable populations, regional variations, or unintended economic consequences are we not adequately addressing?',
        personal: 'What long-term consequences, relationship impacts, or personal values conflicts haven\'t we fully explored?',
        business: 'What regulatory shifts, supply chain disruptions, or talent acquisition challenges could derail this plan?',
        unknown: 'What critical information or perspectives are we overlooking that could fundamentally change our recommendation?',
      };
      return `Identify implementation gaps: ${domainSpecific[domain] || domainSpecific.unknown}`;
    },

    estimatedImpactLevel: 'high',
  },

  critical: {
    label: 'Critical Stakes',
    description: 'Health/safety/legal decisions. Models will apply maximum rigor. ✓ Identify worst-case scenarios ✓ Surface knowledge gaps and limitations ✓ Cross-check reasoning for flaws',
    mainPrompt: `This decision affects health, safety, legal standing, or major life outcomes.
Consequences of being wrong are severe and potentially irreversible.
This analysis will be relied upon for consequential action.
Be appropriately rigorous, thorough, and explicitly identify assumptions and limitations.
Assume worst-case scenarios when evaluating safety and risk.`,

    adversarialPrompt: (domain: DomainType) => {
      const domainSpecific: Record<DomainType, string> = {
        medical: 'What are ALL potential serious adverse effects, contraindications, and patient populations this might harm?',
        academic: 'What fundamental methodological flaws could invalidate this entire analysis?',
        technical: 'Under what specific conditions would this architecture fail catastrophically?',
        legal: 'What are the most damaging precedents or legal theories opposing this position?',
        creative: 'What are the fundamental creative and commercial weaknesses that could cause this to fail?',
        policy: 'What are the most serious unintended consequences this could trigger for vulnerable groups?',
        personal: 'What is the most compelling life-altering argument for the opposite choice?',
        business: 'What could cause this business plan to fail spectacularly?',
        unknown: 'What could cause this to fail catastrophically?',
      };
      return domainSpecific[domain] || domainSpecific.unknown;
    },

    biasCheckPrompt: (domain: DomainType) => {
      const domainSpecific: Record<DomainType, string> = {
        medical: 'Could we be missing rare but serious side effects? Ignoring vulnerable patient populations? Anchoring on optimistic outcomes?',
        academic: 'Could we be missing contradicting evidence? Subject to publication bias? Overconfident in methodology?',
        technical: 'Could we be underestimating operational complexity? Ignoring security implications? Over-optimizing?',
        legal: 'Could we be ignoring stronger counterarguments? Anchoring incorrectly? Missing procedural risks?',
        creative: 'Could we be missing fundamental narrative flaws? Over-confident in concept? Ignoring audience?',
        policy: 'Could we be ignoring impacts on vulnerable groups? Subject to political pressure? Missing implementation failures?',
        personal: 'Could we be rationalizing a bad choice? Ignoring intuition? Subject to sunk cost fallacy?',
        business: 'Could we be ignoring competitive response? Missing market shifts? Over-optimistic on execution?',
        unknown: 'Rigorously check for all potential biases and blindspots.',
      };
      return `CRITICAL: ${domainSpecific[domain] || domainSpecific.unknown}`;
    },

    accountabilityPrompt: (domain: DomainType) => {
      const domainSpecific: Record<DomainType, string> = {
        medical: 'Would you recommend this to your own family member? If it causes harm, could you live with that?',
        academic: 'Would you stake your academic career on this analysis being correct?',
        technical: 'Would you be comfortable with this system handling critical infrastructure?',
        legal: 'Would you stake your bar license and professional reputation on this argument?',
        creative: 'Would you be proud to have this represent your best work?',
        policy: 'Would you be willing to publicly defend this to affected communities if it causes harm?',
        personal: 'Can you truly commit to living with this decision for the next 20 years?',
        business: 'Would you invest your entire net worth in this strategy?',
        unknown: 'Can you fully stand behind this recommendation with complete confidence?',
      };
      return `${domainSpecific[domain] || domainSpecific.unknown}`;
    },

    gapCheckPrompt: (domain: DomainType) => {
      const domainSpecific: Record<DomainType, string> = {
        medical: 'What safety data gaps exist? What patient populations might respond differently? What rare but serious complications could we be missing?',
        academic: 'What fundamental assumptions haven\'t been validated? What alternative explanations could account for the data? What replication attempts have failed?',
        technical: 'What failure modes haven\'t been tested? What edge cases could cause critical system failures? What security vulnerabilities could exist?',
        legal: 'What legal doctrines or precedents directly contradict our position? What jurisdiction or procedural issues could invalidate our approach?',
        creative: 'What core concept flaws could undermine the entire work? What ethical concerns haven\'t been addressed? What audience trust could be violated?',
        policy: 'What demographic groups bear disproportionate harm? What enforcement challenges could emerge? What second and third-order effects are we missing?',
        personal: 'What fundamental life values might be violated by this choice? What relationships could be damaged? What opportunities might be permanently lost?',
        business: 'What existential risks to the organization could this create? What regulatory scenarios could eliminate this market? What talent losses could occur?',
        unknown: 'What is the single most critical thing we haven\'t adequately considered?',
      };
      return `Critical gaps to address: ${domainSpecific[domain] || domainSpecific.unknown}`;
    },

    estimatedImpactLevel: 'critical',
  },

  timeCritical: {
    label: 'Time-Critical',
    description: 'Decision needed within 48 hours. Models prioritize critical insights. ✓ Focus on highest-risk assumptions ✓ Rapid synthesis without sacrificing safety',
    mainPrompt: `This decision is time-critical (needed within 48 hours).
Prioritize the most critical insights and actionable recommendations first.
Briefly explain assumptions and trade-offs but focus on practical next steps.
Structure response for rapid decision-making by stakeholders under time pressure.`,

    adversarialPrompt: (domain: DomainType) => {
      return 'What are the highest-risk assumptions in this analysis that could be proven wrong?';
    },

    biasCheckPrompt: (domain: DomainType) => {
      return 'Are we rushing into a decision without sufficient scrutiny? What are we not considering due to time pressure?';
    },

    accountabilityPrompt: (domain: DomainType) => {
      return 'If this time-critical decision turns out to be wrong, would you still feel comfortable with the analysis process given the time constraints?';
    },

    gapCheckPrompt: (domain: DomainType) => {
      const domainSpecific: Record<DomainType, string> = {
        medical: 'What critical patient information didn\'t we have time to review? What follow-ups need immediate attention?',
        academic: 'What recent publications might contradict our rapid analysis? What methodological shortcuts could we take?',
        technical: 'What system dependencies or failure scenarios didn\'t we have time to model? What post-incident reviews should we schedule?',
        legal: 'What jurisdictional edge cases or legal precedents didn\'t we fully explore? What follow-up legal review is needed?',
        creative: 'What refinements to the concept would we make with more time? What feedback should we actively seek?',
        policy: 'What stakeholder groups didn\'t we adequately consult? What monitoring and adjustment mechanisms should we establish?',
        personal: 'What sleep-on-it consideration might change this decision? What contingency planning should we do?',
        business: 'What competitive or market developments should we monitor closely? What decision points should trigger a reassessment?',
        unknown: 'What would we do differently if we had more time for this decision?',
      };
      return `Urgent gaps to monitor: ${domainSpecific[domain] || domainSpecific.unknown}`;
    },

    estimatedImpactLevel: 'high',
  },

  resourceConstrained: {
    label: 'Resource-Constrained',
    description: 'Limited resources. Models balance optimization with constraints. ✓ Identify safe shortcuts ✓ Check for critical dependencies that could break',
    mainPrompt: `This decision must work within significant resource constraints (budget, time, or personnel).
Provide recommendations that are practical and implementable given limitations.
Focus on highest-impact, lowest-cost solutions.
Be realistic about what can be accomplished with constrained resources.`,

    adversarialPrompt: (domain: DomainType) => {
      return 'If resources were even more constrained, what would break first in this plan?';
    },

    biasCheckPrompt: (domain: DomainType) => {
      return 'Are we over-scoping the solution? Forgetting that constraints eliminate "perfect" options?';
    },

    accountabilityPrompt: (domain: DomainType) => {
      return 'If we cannot afford to implement this fully, do we have a viable Phase 1?';
    },

    gapCheckPrompt: (domain: DomainType) => {
      const domainSpecific: Record<DomainType, string> = {
        medical: 'What lower-cost treatment alternatives are we missing? What essential vs. optional components could be deprioritized?',
        academic: 'What lower-cost research methodologies could still answer the core question? What collaborations could reduce costs?',
        technical: 'What open-source or existing solutions could reduce development costs? What minimal viable architecture could we deploy first?',
        legal: 'What less expensive legal strategies or self-help options exist? What cost-sharing arrangements could work?',
        creative: 'What lower-budget approaches could still achieve creative impact? What collaborative partnerships could reduce costs?',
        policy: 'What phased implementation could reduce upfront costs? What pilot programs could test effectiveness first?',
        personal: 'What lower-cost versions of this choice exist? What could we accomplish with more modest resource commitment?',
        business: 'What MVP approach could test this with minimal spend? What partnerships or revenue streams could fund this?',
        unknown: 'What essential components cannot be compromised? What aspects are truly optional under budget constraints?',
      };
      return `Resource-efficient options: ${domainSpecific[domain] || domainSpecific.unknown}`;
    },

    estimatedImpactLevel: 'medium',
  },
};

export function getStakeContext(stakeLevel: string): StakeContext {
  return stakeContexts[stakeLevel] || stakeContexts.exploratory;
}

export function getAllStakeContexts(): Record<string, StakeContext> {
  return stakeContexts;
}
