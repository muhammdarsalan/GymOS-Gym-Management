// GymOS database schema.
//
// Every business table is scoped to a gym via a `gymId` foreign key back to
// gymsTable — that's what makes gym/workspace isolation enforceable once the
// API filters every query by the authenticated request's gym id (see the
// auth phase). Table shapes are modeled directly on the existing app types
// in artifacts/gymos/lib/gymos-data.ts so the API layer can map between them
// with minimal translation.

export * from "./gyms";
export * from "./users";
export * from "./plans";
export * from "./trainers";
export * from "./members";
export * from "./memberships";
export * from "./payments";
export * from "./attendance";
export * from "./audit-logs";
export * from "./notifications";
export * from "./relations";
