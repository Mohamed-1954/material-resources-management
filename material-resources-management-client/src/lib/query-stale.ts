/**
 * Per-domain staleTime tiers. Centralised so individual queries don't reinvent
 * cache-freshness policy. Tune here; queries import the tier that matches the
 * change-rate of the underlying entity.
 *
 * | Tier      | staleTime | Use for                                         |
 * |-----------|-----------|-------------------------------------------------|
 * | live      |        0  | high-churn lists (failures, notifications)      |
 * | volatile  |     15 s  | per-keystroke, hot dashboards                   |
 * | standard  |     60 s  | most CRUD lists                                 |
 * | calm      |   5 min   | rarely-changing reference data (departments)    |
 * | reference |  15 min   | append-only / structural (audit, role catalog)  |
 */
export const STALE = {
  live: 0,
  volatile: 15 * 1000,
  standard: 60 * 1000,
  calm: 5 * 60 * 1000,
  reference: 15 * 60 * 1000,
} as const;

export type StaleTier = keyof typeof STALE;
