// Mirrors makeId() in artifacts/gymos/lib/gymos-data.ts so IDs the server
// generates (e.g. bootstrapping a new gym) look identical to IDs the app
// already generates locally — no dual ID scheme to reconcile later.
export const makeId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
