// Seed data for the Vegas Red Zone ops console prototype.
// Tracks reflect actual BetMakers / Vegas Red Zone partners + flavour additions.

import type { AppState, Track, Screen, ChannelQueue } from "./types";

export const seedTracks: Track[] = [
  {
    id: "wbn",
    name: "Woodbine",
    status: { kind: "racing" },
    liveOn: "ch1",
    scheduledOn: null,
    race: "R5 · The Maple Leaf",
  },
  {
    id: "pen",
    name: "Penn National",
    status: { kind: "racing" },
    liveOn: "ch2",
    scheduledOn: null,
    race: "R7",
  },
  {
    id: "prx",
    name: "Parx",
    status: { kind: "to-jump", minutes: 3 },
    liveOn: null,
    scheduledOn: "ch1",
    race: "R8",
  },
  {
    id: "mth",
    name: "Monmouth",
    status: { kind: "to-jump", minutes: 5 },
    liveOn: null,
    scheduledOn: "ch2",
    race: "R6",
  },
  {
    id: "kty",
    name: "Kentucky Downs",
    status: { kind: "to-jump", minutes: 5 },
    liveOn: null,
    scheduledOn: "featured",
    race: "R4 · Big 10 Leg 7",
  },
];

export const seedScreens: Screen[] = [
  { id: "scr-wbn-live", kind: "live-track", label: "Woodbine — live", trackId: "wbn", accent: "red" },
  { id: "scr-pen-live", kind: "live-track", label: "Penn — live", trackId: "pen", accent: "red" },
  { id: "scr-kty-live", kind: "live-track", label: "Kentucky Downs — live", trackId: "kty", accent: "red" },
  { id: "scr-prx-live", kind: "live-track", label: "Parx — live", trackId: "prx", accent: "red" },
  { id: "scr-mth-live", kind: "live-track", label: "Monmouth — live", trackId: "mth", accent: "red" },
  { id: "scr-form-prx", kind: "form-card", label: "Parx R8 — Form & Odds", trackId: "prx", accent: "blue" },
  { id: "scr-form-mth", kind: "form-card", label: "Monmouth R6 — Form & Odds", trackId: "mth", accent: "blue" },
  { id: "scr-form-kty", kind: "form-card", label: "Kentucky Downs R4 — Form & Odds", trackId: "kty", accent: "blue" },
  { id: "scr-result-wbn", kind: "result", label: "Woodbine R4 — Result & Dividend", trackId: "wbn", accent: "green" },
  { id: "scr-big10", kind: "big10-status", label: "Vegas Big 10 — Live Standings", accent: "purple" },
  { id: "scr-tourney", kind: "tournament", label: "Daily Handicapping — Leaderboard", accent: "purple" },
  { id: "scr-replay-wbn", kind: "replay", label: "Woodbine R4 — Replay", trackId: "wbn", accent: "amber" },
  { id: "scr-sponsor-caesars", kind: "sponsor", label: "Caesars Sportsbook · 30s", brand: "Caesars", accent: "neutral" },
  { id: "scr-sponsor-westgate", kind: "sponsor", label: "Westgate Racebook · 30s", brand: "Westgate", accent: "neutral" },
  { id: "scr-promo-big10", kind: "promo", label: "Big 10 — Tonight's Jackpot Promo", accent: "amber" },
  { id: "scr-leaderboard", kind: "leaderboard", label: "Vegas Red Zone — Network Handle", accent: "purple" },
];

export const seedQueues: Record<string, ChannelQueue> = {
  ch1: [
    { screenId: "scr-wbn-live", inSeconds: 0 },
    { screenId: "scr-form-prx", inSeconds: 5 },
    { screenId: "scr-prx-live", inSeconds: 25 },
    { screenId: "scr-sponsor-caesars", inSeconds: 45 },
  ],
  ch2: [
    { screenId: "scr-pen-live", inSeconds: 0 },
    { screenId: "scr-form-mth", inSeconds: 5 },
    { screenId: "scr-mth-live", inSeconds: 25 },
    { screenId: "scr-sponsor-westgate", inSeconds: 45 },
  ],
  ch3: [
    { screenId: "scr-result-wbn", inSeconds: 0 },
    { screenId: "scr-replay-wbn", inSeconds: 5 },
    { screenId: "scr-leaderboard", inSeconds: 25 },
    { screenId: "scr-promo-big10", inSeconds: 45 },
  ],
  featured: [
    { screenId: "scr-big10", inSeconds: 0 },
    { screenId: "scr-form-kty", inSeconds: 5 },
    { screenId: "scr-kty-live", inSeconds: 25 },
    { screenId: "scr-tourney", inSeconds: 45 },
  ],
};

export const initialState: AppState = {
  tracks: seedTracks,
  screens: seedScreens,
  channelQueues: {
    ch1: seedQueues.ch1,
    ch2: seedQueues.ch2,
    ch3: seedQueues.ch3,
    featured: seedQueues.featured,
  },
  activeChannel: "featured",
};
