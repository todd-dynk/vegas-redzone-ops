import { useEffect, useMemo, useState } from "react";
import { initialState } from "./data";
import type {
  AppState,
  ChannelId,
  Screen,
  Track,
  TrackStatus,
  QueueSlot,
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
  const [state, setState] = useState<AppState>(initialState);
  const [now, setNow] = useState<Date>(new Date());
  const [draggingScreenId, setDraggingScreenId] = useState<string | null>(null);

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
  return (
    <div className={`track-tile ${status.tone}`}>
      <div className="track-tile-head">
        <span className="track-name">{track.name}</span>
        {track.liveOn ? <span className="badge badge-live">LIVE · {chShort(track.liveOn)}</span> : null}
      </div>
      <div className="track-video">
        <div className="track-video-inner">
          {track.status.kind === "racing" ? "▶ Live feed" : track.status.kind === "result" ? "RESULT" : "Preview"}
        </div>
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

function UpcomingSidebar({ state }: { state: AppState }) {
  const upcoming = state.tracks
    .filter((t) => t.status.kind === "to-jump")
    .sort((a, b) => {
      const am = a.status.kind === "to-jump" ? a.status.minutes : 99;
      const bm = b.status.kind === "to-jump" ? b.status.minutes : 99;
      return am - bm;
    });
  return (
    <aside className="upcoming">
      <div className="upcoming-head">Upcoming races · Screen Displays</div>
      <ul>
        {upcoming.length === 0 && <li className="upcoming-empty">No upcoming races queued</li>}
        {upcoming.map((t) => {
          const mins = t.status.kind === "to-jump" ? t.status.minutes : 0;
          return (
            <li key={t.id}>
              <div className="upcoming-track">{t.name}</div>
              <div className="upcoming-meta">
                <span>{t.race}</span>
                <span className="upcoming-tag">{mins}m</span>
              </div>
              <div className="upcoming-dest">→ {t.scheduledOn ? CHANNEL_LABELS[t.scheduledOn] : "—"}</div>
            </li>
          );
        })}
      </ul>
    </aside>
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
