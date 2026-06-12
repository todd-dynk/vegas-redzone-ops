// Vegas Red Zone — Ops Console types

export type TrackStatus =
  | { kind: "racing" }
  | { kind: "to-jump"; minutes: number }
  | { kind: "result" }
  | { kind: "delay"; reason?: string }
  | { kind: "scratched" };

export type ChannelId = "ch1" | "ch2" | "ch3" | "featured";

export const CHANNEL_LABELS: Record<ChannelId, string> = {
  ch1: "Channel 1",
  ch2: "Channel 2",
  ch3: "Channel 3",
  featured: "Featured · Vegas Red Zone",
};

export interface Track {
  id: string;
  name: string;
  status: TrackStatus;
  // Which channel is this track currently playing on (if any)
  liveOn: ChannelId | null;
  // Which channel is this track scheduled for next (if any)
  scheduledOn: ChannelId | null;
  // Race number / context
  race?: string;
}

// A "screen" is a unit of content that can be queued to a channel.
// It could be a live track feed, a result, an overlay card, a sponsor, etc.
export type ScreenKind =
  | "live-track"
  | "result"
  | "form-card"
  | "sponsor"
  | "leaderboard"
  | "big10-status"
  | "tournament"
  | "replay"
  | "promo";

export interface Screen {
  id: string;
  kind: ScreenKind;
  label: string;
  // For live-track or result screens, link to a track
  trackId?: string;
  // For sponsor/promo, a brand name
  brand?: string;
  // Optional accent for visual differentiation
  accent?: "red" | "amber" | "green" | "blue" | "purple" | "neutral";
}

// A queued slot on a channel: which screen plays next, and in how many seconds.
export interface QueueSlot {
  screenId: string;
  // 0 = playing now; >0 = seconds from now
  inSeconds: number;
}

export type ChannelQueue = QueueSlot[];

export interface AppState {
  tracks: Track[];
  screens: Screen[]; // library of available screens
  channelQueues: Record<ChannelId, ChannelQueue>;
  // Currently selected channel for the "Next screens" middle row
  activeChannel: ChannelId;
}
