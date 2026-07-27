export interface BriefSnapshot {
  gapLabel: string;
  rankPosition: number | null;
  aioPresent: boolean | null;
  clientCited: boolean | null;
  mentionedInText: boolean | null;
  citedDomainCount: number;
  citedDomainsHash: string;
}

export interface CurrentSignals {
  gapLabel: string;
  rankPosition: number | null;
  aioPresent: boolean | null;
  clientCited: boolean | null;
  mentionedInText: boolean | null;
  citedDomains: string[];
}

// Practical thresholds: ignore noisy 1-position rank wobbles and minor
// citation-list shuffles. A brief is "outdated" only when something the
// recommended actions would actually change reacts to.
const RANK_DELTA_THRESHOLD = 3;
const CITED_COUNT_DELTA_THRESHOLD = 2;
const MAX_AGE_DAYS = 14;

/**
 * Determine whether a saved brief's snapshot is meaningfully out of date.
 * Returns false if no brief exists, or if changes are within tolerance.
 */
export function isBriefStale(
  snapshot: BriefSnapshot | null | undefined,
  current: CurrentSignals,
  briefCreatedAt?: string | null
): boolean {
  if (!snapshot) return false;

  // Gap category flipped — playbook changes.
  if (snapshot.gapLabel !== current.gapLabel) return true;

  // Citation status flipped — biggest signal change possible.
  if (snapshot.clientCited !== current.clientCited) return true;
  if (snapshot.aioPresent !== current.aioPresent) return true;

  // Rank moved by 3+ positions in either direction.
  const a = snapshot.rankPosition;
  const b = current.rankPosition;
  if (a == null && b != null) return true;
  if (a != null && b == null) return true;
  if (a != null && b != null && Math.abs(a - b) >= RANK_DELTA_THRESHOLD) return true;

  // Competitor citation pool shifted by 2+ domains.
  if (Math.abs(snapshot.citedDomainCount - current.citedDomains.length) >= CITED_COUNT_DELTA_THRESHOLD) {
    return true;
  }

  // Age fallback — even if signals look stable, refresh after 14 days.
  if (briefCreatedAt) {
    const ageMs = Date.now() - new Date(briefCreatedAt).getTime();
    if (ageMs > MAX_AGE_DAYS * 86400 * 1000) return true;
  }

  return false;
}
