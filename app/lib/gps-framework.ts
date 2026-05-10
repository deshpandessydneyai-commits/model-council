// GPS Framework Phase Information
// G = Gather diverse perspectives
// P = Probe weaknesses and assumptions
// S = Synthesize final positions

export const GPS_PHASES = {
  1: {
    phase: 'Gather',
    emoji: '🎯',
    gpsLetter: 'G',
    description: 'Models independently form their initial perspectives without being influenced by others',
    what_happens: [
      'Each model analyzes the question from first principles',
      'No model can see what others are thinking yet',
      'Creates baseline to identify real disagreements vs. groupthink'
    ]
  },
  2: {
    phase: 'Probe',
    emoji: '⚔️',
    gpsLetter: 'P',
    description: 'Models read other perspectives and challenge weak points and assumptions',
    what_happens: [
      'Models review all Round 1 positions',
      'Active questioning: "What could go wrong?" "What am I missing?"',
      'Intensity determined by stakes level (critical stakes = more rigorous probing)',
      'Forces models to defend their positions against adversarial challenges'
    ]
  },
  3: {
    phase: 'Synthesize',
    emoji: '✨',
    gpsLetter: 'S',
    description: 'Models review their own reasoning for bias and blind spots before finalizing',
    what_happens: [
      'Check thinking for cognitive biases and logical flaws',
      'Consider accountability: "Would I defend this decision?"',
      'Identify knowledge gaps and limitations',
      'Synthesizer (Claude Opus) integrates all perspectives into final verdict'
    ]
  },
} as const;

export const STAKE_IMPACT = {
  exploratory: {
    label: 'Exploratory',
    intensity: 'Mild',
    description: 'Intellectual exploration, curiosity-driven, low pressure',
    what_changes: {
      round_2: 'Models gently explore alternative viewpoints and potential weaknesses',
      round_3: 'Models check for obvious biases and echo chamber thinking',
      focus: 'Breadth of perspective over decisiveness'
    }
  },
  implemented: {
    label: 'Implementation',
    intensity: 'Standard',
    description: 'This decision will be acted upon. Real consequences depend on accuracy.',
    what_changes: {
      round_2: 'Models stress-test for implementation failures and unintended consequences',
      round_3: 'Models carefully review for practical risks and operational blind spots',
      focus: 'Practical feasibility and real-world consequences'
    }
  },
  critical: {
    label: 'Critical Stakes',
    intensity: 'Rigorous',
    description: 'Health, safety, legal, or major life consequences. High precision required.',
    what_changes: {
      round_2: 'Models apply maximum rigor to identify serious risks and worst-case scenarios',
      round_3: 'Models thoroughly check for hidden assumptions, cognitive biases, and knowledge gaps',
      focus: 'Safety, accuracy, and complete accountability'
    }
  },
  timeCritical: {
    label: 'Time-Critical',
    intensity: 'Rapid',
    description: 'Decision needed within 48 hours. Prioritize most critical insights.',
    what_changes: {
      round_2: 'Focused questioning on highest-risk assumptions only',
      round_3: 'Rapid bias check on critical decision points',
      focus: 'Speed without sacrificing safety'
    }
  },
  resourceConstrained: {
    label: 'Resource-Constrained',
    intensity: 'Practical',
    description: 'Limited budget, time, or personnel. Optimize for constraints.',
    what_changes: {
      round_2: 'Models identify which corners could be safely cut',
      round_3: 'Check for hidden dependencies that could break with resource loss',
      focus: 'Efficiency and minimal viable approach'
    }
  },
} as const;

export type StakeLevelKey = keyof typeof STAKE_IMPACT;
export type GPSPhaseNumber = 1 | 2 | 3;

export function getGPSPhaseInfo(round: number) {
  const phase = GPS_PHASES[round as GPSPhaseNumber];
  return phase || null;
}

export function getStakeImpact(stakeLevel: string) {
  return STAKE_IMPACT[stakeLevel as StakeLevelKey] || null;
}

export function getStakeIntensity(stakeLevel: string): string {
  const impact = getStakeImpact(stakeLevel);
  return impact?.intensity || 'Unknown';
}
