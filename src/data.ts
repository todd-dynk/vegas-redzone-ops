// Seed data for the Vegas Red Zone ops console prototype.
// Tracks reflect actual BetMakers / Vegas Red Zone partners + flavour additions.

import type { AppState, Track, Screen, ChannelQueue, UpcomingRace } from "./types";

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
    id: "kty",
    name: "Kentucky Downs",
    status: { kind: "racing" },
    liveOn: "featured",
    scheduledOn: null,
    race: "R4 · Big 10 Leg 7",
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
    id: "sar",
    name: "Saratoga",
    status: { kind: "to-jump", minutes: 7 },
    liveOn: null,
    scheduledOn: "ch3",
    race: "R9 · Allowance",
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

export const seedUpcoming: UpcomingRace[] = [
  // Imminent — on tiles
  { id: "up-prx-r8",  trackName: "Parx",            raceNumber: "R8",  minutesToPost: 3,  scheduledOn: "ch1",      region: "USA" },
  { id: "up-mth-r6",  trackName: "Monmouth",        raceNumber: "R6",  minutesToPost: 5,  scheduledOn: "ch2",      region: "USA" },
  { id: "up-sar-r9",  trackName: "Saratoga",        raceNumber: "R9",  raceLabel: "Allowance", minutesToPost: 7, scheduledOn: "ch3", region: "USA" },

  // Next 15 — the body of the book
  { id: "up-cdx-r5",  trackName: "Churchill Downs", raceNumber: "R5",  minutesToPost: 9,  scheduledOn: "featured", tag: "big10",  region: "USA" },
  { id: "up-glf-r7",  trackName: "Gulfstream Park", raceNumber: "R7",  minutesToPost: 11, scheduledOn: "ch1",      region: "USA" },
  { id: "up-tam-r4",  trackName: "Tampa Bay Downs", raceNumber: "R4",  minutesToPost: 13, scheduledOn: "ch2",      region: "USA" },
  { id: "up-kty-r5",  trackName: "Kentucky Downs",  raceNumber: "R5",  raceLabel: "Big 10 Leg 8", minutesToPost: 14, scheduledOn: "featured", tag: "big10", region: "USA" },
  { id: "up-aqu-r6",  trackName: "Aqueduct",        raceNumber: "R6",  minutesToPost: 16, scheduledOn: "ch3",      region: "USA" },
  { id: "up-wbn-r6",  trackName: "Woodbine",        raceNumber: "R6",  raceLabel: "Pattison Canadian Intl", minutesToPost: 17, scheduledOn: "ch1", tag: "feature", region: "CAN" },
  { id: "up-sa-r3",   trackName: "Santa Anita",     raceNumber: "R3",  minutesToPost: 19, scheduledOn: "ch2",      region: "USA" },
  { id: "up-dmr-r5",  trackName: "Del Mar",         raceNumber: "R5",  minutesToPost: 22, scheduledOn: "ch3",      region: "USA" },
  { id: "up-fgr-r4",  trackName: "Fair Grounds",    raceNumber: "R4",  minutesToPost: 24, scheduledOn: null,       region: "USA" },
  { id: "up-kty-r6",  trackName: "Kentucky Downs",  raceNumber: "R6",  raceLabel: "Big 10 Leg 9", minutesToPost: 26, scheduledOn: "featured", tag: "big10", region: "USA" },
  { id: "up-pen-r8",  trackName: "Penn National",   raceNumber: "R8",  minutesToPost: 28, scheduledOn: "ch1",      region: "USA" },
  { id: "up-bel-r5",  trackName: "Belmont at Aqueduct", raceNumber: "R5", minutesToPost: 31, scheduledOn: "ch2",   region: "USA" },
  { id: "up-lrl-r4",  trackName: "Laurel Park",     raceNumber: "R4",  minutesToPost: 33, scheduledOn: null,       region: "USA" },
  { id: "up-tgg-r7",  trackName: "Turfway Park",    raceNumber: "R7",  minutesToPost: 35, scheduledOn: "ch3",      region: "USA" },
  { id: "up-kty-r7",  trackName: "Kentucky Downs",  raceNumber: "R7",  raceLabel: "Big 10 Leg 10 · Final", minutesToPost: 38, scheduledOn: "featured", tag: "big10", region: "USA" },
  { id: "up-mth-r7",  trackName: "Monmouth",        raceNumber: "R7",  minutesToPost: 41, scheduledOn: null,       region: "USA" },
  { id: "up-prx-r9",  trackName: "Parx",            raceNumber: "R9",  minutesToPost: 44, scheduledOn: "ch1",      region: "USA" },

  // Tail — international + late US
  { id: "up-mwc-r2",  trackName: "Meydan",          raceNumber: "R2",  minutesToPost: 48, scheduledOn: null,       region: "UAE" },
  { id: "up-flm-r6",  trackName: "Flemington",      raceNumber: "R6",  minutesToPost: 52, scheduledOn: "ch2",      region: "AUS" },
  { id: "up-rwk-r5",  trackName: "Randwick",        raceNumber: "R5",  minutesToPost: 57, scheduledOn: null,       region: "AUS" },
  { id: "up-glf-r8",  trackName: "Gulfstream Park", raceNumber: "R8",  minutesToPost: 62, scheduledOn: "ch3",      region: "USA" },
  { id: "up-sar-r10", trackName: "Saratoga",        raceNumber: "R10", raceLabel: "Travers Prep", minutesToPost: 68, scheduledOn: "featured", tag: "feature", region: "USA" },
  { id: "up-cdx-r6",  trackName: "Churchill Downs", raceNumber: "R6",  minutesToPost: 73, scheduledOn: "ch1",      region: "USA" },
  { id: "up-asc-r4",  trackName: "Ascot",           raceNumber: "R4",  minutesToPost: 81, scheduledOn: null,       region: "GBR" },
  { id: "up-lon-r3",  trackName: "Longchamp",       raceNumber: "R3",  minutesToPost: 89, scheduledOn: null,       region: "FRA" },
];

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
  upcoming: seedUpcoming,
};
