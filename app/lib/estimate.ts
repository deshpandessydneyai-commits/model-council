export interface DebateEstimate {
  timeLabel: string;
  costLabel: string;
  roundsLabel: string;
  estimatedSeconds: number;
  estimatedCost: number;
  numRounds: number;
}

export function estimateDebate(
  prompt: string,
  forceR3: boolean,
  hasDomain: boolean
): DebateEstimate {
  const promptLength = prompt.length;

  // Base estimates
  let timePerRound = 60; // seconds per round
  let costPerRound = 0.10; // dollars per round
  let numRounds = 2; // default to 2 rounds

  // Adjust based on prompt length
  if (promptLength > 500) {
    timePerRound += 30;
    costPerRound += 0.05;
  }

  // Force R3 adds a third round
  if (forceR3) {
    numRounds = 3;
  }

  // Domain detection affects time/cost
  if (hasDomain) {
    timePerRound += 20;
    costPerRound += 0.02;
  }

  const estimatedSeconds = timePerRound * numRounds;
  const estimatedCost = costPerRound * numRounds;

  // Format labels
  const minutes = Math.ceil(estimatedSeconds / 60);
  const timeLabel = minutes === 1 ? "1 min" : `${minutes} mins`;
  const costLabel = `$${estimatedCost.toFixed(2)}`;
  const roundsLabel = numRounds === 1 ? "1 round" : `${numRounds} rounds`;

  return {
    timeLabel,
    costLabel,
    roundsLabel,
    estimatedSeconds,
    estimatedCost,
    numRounds,
  };
}
