import { fsrs, createEmptyCard, Rating, State, type Card, type FSRS } from 'ts-fsrs';

// ─── Central FSRS Configuration ──────────────────────────────────────────────
// All FSRS parameters are configured here. Change these values once
// and every part of the app (queue, rating, rescheduling) picks them up.

const FSRS_PARAMS = {
  request_retention: 0.9,   // Target 90% recall probability
  maximum_interval: 365,    // Cap reviews at 1 year
};

// Singleton instance — reused across the app
let _instance: FSRS | null = null;

export function getFSRS(): FSRS {
  if (!_instance) {
    _instance = fsrs(FSRS_PARAMS);
  }
  return _instance;
}

// ─── Card Helpers ────────────────────────────────────────────────────────────

/**
 * Build an FSRS Card object from a database row.
 * Falls back to a fresh empty card if no row is provided.
 */
export function cardFromRow(row: Record<string, any> | null): Card {
  if (!row) return createEmptyCard();

  const card = createEmptyCard();
  card.due = new Date(row.due);
  card.stability = row.stability ?? 0;
  card.difficulty = row.difficulty ?? 0;
  card.elapsed_days = row.elapsed_days ?? 0;
  card.scheduled_days = row.scheduled_days ?? 0;
  card.reps = row.reps ?? 0;
  card.lapses = row.lapses ?? 0;
  card.state = row.state > 3 ? State.New : (row.state as State) ?? State.New;
  card.last_review = row.last_review ? new Date(row.last_review) : undefined;
  return card;
}

/**
 * Calculate the current retrievability (memory strength) of a card.
 * Returns a string like "87.50%" or "New" for unreviewed cards.
 */
export function getRetrievability(row: Record<string, any>, now: Date = new Date()): { value: number; display: string } {
  const card = cardFromRow(row);
  if (card.state === State.New) {
    return { value: 0, display: "New" };
  }
  
  const f = getFSRS();
  let r = "0.00%";
  try {
    r = (f.get_retrievability(card, now) as string) || "0.00%";
  } catch (e) {
    // Fallback if the FSRS calculation fails
  }
  
  const value = parseFloat(r.replace('%', ''));
  return { value, display: r };
}
