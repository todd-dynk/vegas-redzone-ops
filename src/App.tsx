import { useEffect, useMemo, useState } from "react";
import {
  initialState,
  GTX_PLAYER_BASE,
  TRACK_FEED_PARAM,
  TRACK_FEED_REAL,
  TRACK_AUTOPLAY_IDS,
} from "./data";
import {
  loadSavedState,
  saveState,
  clearSavedState,
  formatSavedAt,
  type SaveMeta,
} from "./persistence";
import type {
  AppState,
  ChannelId,
  Screen,
  Track,
  TrackStatus,
  QueueSlot,
  UpcomingRace,
} from "./types";
import { CHANNEL_LABELS } from "./types";
import "./App.css";

function formatStatus(s: TrackStatus): { label: string; tone: string } {
  switch (s.kind) {
    case "racing":
      return { label: "RACING", tone: "tone-live" };
    case "to-jump":
      return { label: `${s.minutes}min to jump`, tone: "tone-soon" };
    case "result":
      return { label: "RESULT", tone: "tone-done" };
    case "delay":
      return { label: "DELAY", tone: "tone-warn" };
    case "scratched":
      return { label: "SCRATCHED", tone: "tone-muted" };
  }
}

function findScreen(screens: Screen[], id: string): Screen | undefined {
  return screens.find((s) => s.id === id);
}

export default function App() {
  // Restore from localStorage if present (recovers from refresh / crash).
  const [state, setState] = useState<AppState>(() => {
    const { state: saved } = loadSavedState();
    return saved ?? initialState;
  });
  const [savedMeta, setSavedMeta] = useState<SaveMeta | null>(() => loadSavedState().meta);
  const [now, setNow] = useState<Date>(new Date());
  const [draggingScreenId, setDraggingScreenId] = useState<string | null>(null);
  const [savedTick, setSavedTick] = useState(0); // re-render "last saved" label

  // Autosave on every state change (debounced to ~750ms).
  useEffect(() => {
    const t = setTimeout(() => {
      const meta = saveState(state);
      setSavedMeta(meta);
    }, 750);
    return () => clearTimeout(t);
  }, [state]);

  // Tick the "last saved Xs ago" label every 10s.
  useEffect(() => {
    const t = setInterval(() => setSavedTick((n) => n + 1), 10_000);
    return () => clearInterval(t);
  }, []);

  // Live clock + tick down the queues every second
  useEffect(() => {
    const t = setInterval(() => {
      setNow(new Date());
      setState((prev) => ({
        ...prev,
        channelQueues: Object.fromEntries(
          Object.entries(prev.channelQueues).map(([ch, slots]) => [
            ch,
            slots.map((s) => ({ ...s, inSeconds: Math.max(0, s.inSeconds - 1) })),
          ]),
        ) as AppState["channelQueues"],
        tracks: prev.tracks.map((t) =>
          t.status.kind === "to-jump" && Math.random() < 0.02
            ? { ...t, status: { kind: "to-jump", minutes: Math.max(1, t.status.minutes - 1) } }
            : t,
        ),
      }));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Tick upcoming-race countdowns every 30s of real time — enough to feel alive
  // without being noisy.
  useEffect(() => {
    const t = setInterval(() => {
      setState((prev) => ({
        ...prev,
        upcoming: prev.upcoming.map((u) => ({
          ...u,
          minutesToPost: Math.max(0, u.minutesToPost - 1),
        })),
      }));
    }, 30000);
    return () => clearInterval(t);
  }, []);

  const activeChannel = state.activeChannel;
  const activeQueue = state.channelQueues[activeChannel];

  const onAirByChannel = useMemo(() => {
    const map: Record<ChannelId, Screen | undefined> = {
      ch1: undefined,
      ch2: undefined,
      ch3: undefined,
      featured: undefined,
    };
    (Object.keys(state.channelQueues) as ChannelId[]).forEach((ch) => {
      const first = state.channelQueues[ch][0];
      if (first) map[ch] = findScreen(state.screens, first.screenId);
    });
    return map;
  }, [state.channelQueues, state.screens]);

  function selectChannel(ch: ChannelId) {
    setState((p) => ({ ...p, activeChannel: ch }));
  }

  function setTrackAction(track: Track, action: "display" | "result" | "delay") {
    setState((p) => ({
      ...p,
      tracks: p.tracks.map((t) =>
        t.id === track.id
          ? {
              ...t,
              status:
                action === "result"
                  ? { kind: "result" }
                  : action === "delay"
                  ? { kind: "delay" }
                  : t.status.kind === "racing"
                  ? { kind: "racing" }
                  : { kind: "to-jump", minutes: 1 },
            }
          : t,
      ),
    }));
  }

  function replaceSlot(channelId: ChannelId, slotIndex: number, newScreenId: string) {
    setState((p) => ({
      ...p,
      channelQueues: {
        ...p.channelQueues,
        [channelId]: p.channelQueues[channelId].map((slot, i) =>
          i === slotIndex ? { ...slot, screenId: newScreenId } : slot,
        ),
      },
    }));
  }

  function onSlotDrop(channelId: ChannelId, slotIndex: number) {
    if (!draggingScreenId) return;
    replaceSlot(channelId, slotIndex, draggingScreenId);
    setDraggingScreenId(null);
  }

  function takeNow(channelId: ChannelId, screenId: string) {
    setState((p) => ({
      ...p,
      channelQueues: {
        ...p.channelQueues,
        [channelId]: [{ screenId, inSeconds: 0 }, ...p.channelQueues[channelId].slice(0, 3)],
      },
    }));
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-pill">VRZ</span>
          <span className="brand-title">VEGAS RED ZONE · OPS CONSOLE</span>
        </div>
        <div className="topbar-right">
          <span className="save-status" title={`Last autosaved ${savedMeta ? new Date(savedMeta.savedAt).toLocaleString() : "never"}`}>
            <span className="save-dot" />
            Saved <span className="save-when">{savedTick >= 0 ? formatSavedAt(savedMeta?.savedAt) : ""}</span>
          </span>
          <button
            className="save-btn"
            onClick={() => { const meta = saveState(state); setSavedMeta(meta); }}
            title="Force-save now"
          >SAVE</button>
          <button
            className="save-btn danger"
            onClick={() => {
              if (confirm("Reset console to defaults? Local autosave will be cleared.")) {
                clearSavedState();
                setState(initialState);
                setSavedMeta(null);
              }
            }}
            title="Reset to defaults & clear autosave"
          >RESET</button>
          <span className="onair">● ON AIR</span>
          <span className="clock">{now.toLocaleTimeString("en-US", { hour12: false })}</span>
        </div>
      </header>

      <div className="main-grid">
        <div className="main-col">
          {/* Row 1: Track tiles */}
          <section className="row row-tracks">
            <div className="row-header">
              <h2>Live streams of upcoming tracks <span className="dim">· time to jump</span></h2>
            </div>
            <div className="track-grid">
              {state.tracks.map((track) => (
                <TrackTile
                  key={track.id}
                  track={track}
                  onDisplay={() => setTrackAction(track, "display")}
                  onResult={() => setTrackAction(track, "result")}
                  onDelay={() => setTrackAction(track, "delay")}
                />
              ))}
            </div>
          </section>

          {/* Row 2: Channel tabs + next-screens queue */}
          <section className="row row-queue">
            <div className="row-header queue-header">
              <h2>Next screens to be displayed</h2>
              <div className="channel-tabs">
                {(Object.keys(CHANNEL_LABELS) as ChannelId[]).map((ch) => (
                  <button
                    key={ch}
                    onClick={() => selectChannel(ch)}
                    className={`channel-tab ${ch === activeChannel ? "active" : ""} ${
                      ch === "featured" ? "featured" : ""
                    }`}
                  >
                    {CHANNEL_LABELS[ch]}
                    {onAirByChannel[ch] ? <span className="tab-onair">●</span> : null}
                  </button>
                ))}
              </div>
            </div>

            <div className="queue-grid">
              {activeQueue.map((slot, i) => {
                const screen = findScreen(state.screens, slot.screenId);
                return (
                  <QueueSlotTile
                    key={`${activeChannel}-${i}`}
                    slot={slot}
                    screen={screen}
                    isLive={i === 0}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => onSlotDrop(activeChannel, i)}
                    isDropTarget={!!draggingScreenId}
                  />
                );
              })}
            </div>
          </section>

          {/* Row 3: Alternate screen library */}
          <section className="row row-alt">
            <div className="row-header">
              <h2>
                Alternate screens
                <span className="dim"> · drag onto a slot, or click TAKE NOW</span>
              </h2>
            </div>
            <div className="alt-grid">
              {state.screens.map((screen) => (
                <AlternateScreenTile
                  key={screen.id}
                  screen={screen}
                  onDragStart={() => setDraggingScreenId(screen.id)}
                  onDragEnd={() => setDraggingScreenId(null)}
                  onTakeNow={() => takeNow(activeChannel, screen.id)}
                  activeChannelLabel={CHANNEL_LABELS[activeChannel]}
                />
              ))}
            </div>
          </section>
        </div>

        {/* Persistent right sidebar */}
        <aside className="main-side">
          <UpcomingSidebar state={state} />
        </aside>
      </div>

      <footer className="footer">
        <span>Vegas Red Zone · Ops v0.1 · prototype only · ⌥+click any tile to inspect</span>
        <span className="footer-r">Studio: Las Vegas · Lead: Dallas Baker</span>
      </footer>
    </div>
  );
}

/* ============ child components ============ */

function TrackTile({
  track,
  onDisplay,
  onResult,
  onDelay,
}: {
  track: Track;
  onDisplay: () => void;
  onResult: () => void;
  onDelay: () => void;
}) {
  const status = formatStatus(track.status);
  const feedParam = TRACK_FEED_PARAM[track.id];
  const isRealFeed = TRACK_FEED_REAL[track.id];
  const feedUrl = feedParam ? `${GTX_PLAYER_BASE}?fm=${feedParam}` : null;
  const autoplay = TRACK_AUTOPLAY_IDS.has(track.id);
  const [hovering, setHovering] = useState(false);
  const playing = autoplay || hovering;
  return (
    <div
      className={`track-tile ${status.tone}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="track-tile-head">
        <span className="track-name">{track.name}</span>
        {track.liveOn ? <span className="badge badge-live">LIVE · {chShort(track.liveOn)}</span> : null}
      </div>
      <div className="track-video">
        {feedUrl && playing ? (
          <iframe
            className="track-video-iframe"
            src={feedUrl}
            title={`${track.name} feed`}
            allow="autoplay; encrypted-media; picture-in-picture"
            loading="lazy"
          />
        ) : feedUrl ? (
          <div className="track-video-poster">
            <div className="poster-glyph">▶</div>
            <div className="poster-label">{track.name}</div>
            <div className="poster-hint">Hover to play</div>
          </div>
        ) : (
          <div className="track-video-inner">No feed</div>
        )}
        {!isRealFeed && feedUrl ? (
          <span className="track-video-mock" title="Using Woodbine feed as placeholder for the demo">MOCK FEED</span>
        ) : null}
        {autoplay ? (
          <span className="track-video-onair" title="Auto-playing">● LIVE</span>
        ) : null}
      </div>
      <div className="track-meta">
        <div className="track-race">{track.race ?? ""}</div>
        <div className={`track-status ${status.tone}`}>{status.label}</div>
      </div>
      <div className="track-actions">
        <button onClick={onDisplay}>Display</button>
        <button onClick={onResult}>Result</button>
        <button onClick={onDelay}>Delay</button>
      </div>
      <div className="track-footnote">
        {track.liveOn ? `Playing ${CHANNEL_LABELS[track.liveOn]}` : track.scheduledOn ? `Scheduled ${CHANNEL_LABELS[track.scheduledOn]}` : "Unassigned"}
      </div>
    </div>
  );
}

type UpcomingFilter = "all" | "scheduled" | "unassigned" | "big10";

function UpcomingSidebar({ state }: { state: AppState }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<UpcomingFilter>("all");

  const upcoming = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.upcoming
      .filter((u) => {
        if (filter === "scheduled" && !u.scheduledOn) return false;
        if (filter === "unassigned" && u.scheduledOn) return false;
        if (filter === "big10" && u.tag !== "big10") return false;
        if (q) {
          const hay = `${u.trackName} ${u.raceNumber} ${u.raceLabel ?? ""}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => a.minutesToPost - b.minutesToPost);
  }, [state.upcoming, query, filter]);

  const counts = useMemo(() => {
    return {
      all: state.upcoming.length,
      scheduled: state.upcoming.filter((u) => u.scheduledOn).length,
      unassigned: state.upcoming.filter((u) => !u.scheduledOn).length,
      big10: state.upcoming.filter((u) => u.tag === "big10").length,
    };
  }, [state.upcoming]);

  return (
    <div className="upcoming">
      <div className="upcoming-head">
        <span>Upcoming races</span>
        <span className="upcoming-count">{upcoming.length}/{counts.all}</span>
      </div>
      <input
        className="upcoming-search"
        placeholder="Filter track or race…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="upcoming-filters">
        {([
          ["all", "All", counts.all],
          ["scheduled", "Scheduled", counts.scheduled],
          ["unassigned", "Unassigned", counts.unassigned],
          ["big10", "Big 10", counts.big10],
        ] as const).map(([key, label, n]) => (
          <button
            key={key}
            className={`upcoming-filter ${filter === key ? "active" : ""}`}
            onClick={() => setFilter(key)}
          >
            {label} <span className="upcoming-filter-n">{n}</span>
          </button>
        ))}
      </div>
      <ul>
        {upcoming.length === 0 && <li className="upcoming-empty">No matches</li>}
        {upcoming.map((u) => (
          <UpcomingRow key={u.id} race={u} />
        ))}
      </ul>
    </div>
  );
}

function UpcomingRow({ race }: { race: UpcomingRace }) {
  const m = race.minutesToPost;
  const tone = m <= 2 ? "hot" : m <= 5 ? "soon" : m <= 15 ? "mid" : "cold";
  return (
    <li className={`upcoming-row tone-${tone} ${race.tag ?? ""}`}>
      <div className="upcoming-row-top">
        <span className="upcoming-track">{race.trackName}</span>
        <span className="upcoming-tag">{m}m</span>
      </div>
      <div className="upcoming-row-mid">
        <span className="upcoming-race">{race.raceNumber}{race.raceLabel ? ` · ${race.raceLabel}` : ""}</span>
        {race.region ? <span className="upcoming-region">{race.region}</span> : null}
      </div>
      <div className="upcoming-row-bot">
        <span className="upcoming-dest">→ {race.scheduledOn ? CHANNEL_LABELS[race.scheduledOn] : "Unassigned"}</span>
        {race.tag === "big10" ? <span className="upcoming-pill pill-big10">BIG 10</span> : null}
        {race.tag === "feature" ? <span className="upcoming-pill pill-feature">FEATURE</span> : null}
      </div>
    </li>
  );
}

function QueueSlotTile({
  slot,
  screen,
  isLive,
  onDragOver,
  onDrop,
  isDropTarget,
}: {
  slot: QueueSlot;
  screen?: Screen;
  isLive: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  isDropTarget: boolean;
}) {
  const accent = screen?.accent ?? "neutral";
  return (
    <div
      className={`queue-slot accent-${accent} ${isLive ? "live" : ""} ${isDropTarget ? "droppable" : ""}`}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="queue-slot-head">
        {isLive ? <span className="badge badge-live">● PLAYING NOW</span> : <span className="queue-countdown">{slot.inSeconds}s</span>}
      </div>
      <div className="queue-slot-body">
        <div className="queue-slot-label">{screen?.label ?? "—"}</div>
        <div className="queue-slot-kind">{screen?.kind ?? ""}</div>
      </div>
      <div className="queue-slot-actions">
        <button>Override</button>
        <button>Skip</button>
      </div>
    </div>
  );
}

function AlternateScreenTile({
  screen,
  onDragStart,
  onDragEnd,
  onTakeNow,
  activeChannelLabel,
}: {
  screen: Screen;
  onDragStart: () => void;
  onDragEnd: () => void;
  onTakeNow: () => void;
  activeChannelLabel: string;
}) {
  return (
    <div
      className={`alt-tile accent-${screen.accent ?? "neutral"}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="alt-tile-kind">{screen.kind.toUpperCase()}</div>
      <div className="alt-tile-label">{screen.label}</div>
      <div className="alt-tile-actions">
        <button onClick={onTakeNow} title={`Take to air on ${activeChannelLabel}`}>TAKE NOW</button>
        <button title="Queue next">QUEUE</button>
      </div>
    </div>
  );
}

function chShort(c: ChannelId): string {
  return c === "featured" ? "VRZ" : c.replace("ch", "Ch");
}
