import type { AssetCandidate, RankingContext } from './types';

function scoreForLicense(candidate: AssetCandidate, preference: RankingContext['licensePreference']): number {
  if (!candidate.license || !preference || preference === 'any') {
    return 0;
  }
  const license = candidate.license.toLowerCase();
  if (preference === 'public-domain') {
    return license.includes('public') || license.includes('cc0') ? 12 : -10;
  }
  if (preference === 'cc') {
    return license.includes('cc') ? 6 : -4;
  }
  return 0;
}

function scoreForTags(candidate: AssetCandidate, desiredTags: string[]): number {
  if (!desiredTags.length) return 0;
  const candidateTags = (candidate.tags ?? []).map(tag => tag.toLowerCase());
  let score = 0;
  for (const tag of desiredTags) {
    if (candidateTags.includes(tag.toLowerCase())) {
      score += 4;
    }
  }
  return score;
}

function scoreForProvider(candidate: AssetCandidate): number {
  if (candidate.provider === 'official') {
    return 100;
  }
  if (candidate.provider === 'pack') {
    return 75;
  }
  if (candidate.provider === 'wikimedia') {
    return 10;
  }
  return 0;
}

export function rankCandidates(candidates: AssetCandidate[], context: RankingContext): AssetCandidate[] {
  const scored = candidates.map(candidate => {
    let score = candidate.confidence ?? 0;
    score += scoreForProvider(candidate);
    score += scoreForLicense(candidate, context.licensePreference);
    score += scoreForTags(candidate, context.desiredTags);

    if (candidate.locked) {
      score += 200;
    }

    return {
      ...candidate,
      confidence: score,
    } satisfies AssetCandidate;
  });

  return scored.sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0));
}
