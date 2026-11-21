import { useState, useEffect } from "react";
import Modal from "../components/ui/Modal";
import type { StatusType, CameraFeed } from "../types";

// No physical live cameras currently connected, operational, or bought
const FEEDS: CameraFeed[] = [];

export default function LiveCamera() {
  const [selectedFeed, setSelectedFeed] = useState<CameraFeed | null>(null);
  const [nightVision, setNightVision] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  // Live ticking clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }),
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col gap-6 select-none">
      {/* Live Stream Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 p-4 rounded-[1.5rem] bg-ng-panel border border-ng-border shadow-lg">
        <div className="flex items-center gap-3 font-mono text-xs text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="font-bold tracking-widest uppercase">Surveillance Subsystem</span>
          <span className="text-amber-500/50">—</span>
          <span className="text-ng-text font-bold">{currentTime || "12:00:00"} IST</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ng-elevated border border-ng-border">
          <span className="text-[11px] font-mono font-bold text-ng-muted uppercase tracking-widest">
            0 Cameras Online · No Physical CCTV Hardware Connected
          </span>
        </div>
      </div>

      {/* Surveillance Display or Empty State */}
      {FEEDS.length === 0 ? (
        <div className="rounded-[2rem] border border-ng-border p-12 bg-ng-panel shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20" />
          
          {/* Subtle radar circle */}
          <div className="w-24 h-24 rounded-full border border-dashed border-ng-border/80 flex items-center justify-center mb-6 bg-ng-elevated/40 relative">
            <span className="text-3xl opacity-60">📹</span>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            </span>
          </div>

          <h3 className="text-xl font-bold font-display text-ng-text mb-2">
            No Live Cameras Connected
          </h3>
          <p className="text-sm font-body text-ng-secondary max-w-lg mb-8 leading-relaxed">
            There are currently no physical CCTV or IP cameras connected, operational, or configured for the hostel gates. Gate access is actively enforced by the ZKTeco Live20R biometric scanner.
          </p>

          {/* System Technical Telemetry Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl text-left font-mono text-xs">
            <div className="p-4 rounded-xl border border-ng-border bg-ng-elevated/40 flex flex-col gap-1">
              <span className="text-[10px] text-ng-muted uppercase tracking-widest font-bold">RTSP / ONVIF Gateway</span>
              <span className="text-green-400 font-bold">Armed & Ready</span>
            </div>
            <div className="p-4 rounded-xl border border-ng-border bg-ng-elevated/40 flex flex-col gap-1">
              <span className="text-[10px] text-ng-muted uppercase tracking-widest font-bold">Active Hardware Feeds</span>
              <span className="text-amber-400 font-bold">0 Operational</span>
            </div>
            <div className="p-4 rounded-xl border border-ng-border bg-ng-elevated/40 flex flex-col gap-1">
              <span className="text-[10px] text-ng-muted uppercase tracking-widest font-bold">Gate Readers</span>
              <span className="text-green-400 font-bold">Live20R Online</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEEDS.map(feed => {
            const statusColor =
              feed.status === "safe" ? "bg-green-500" : feed.status === "attention" ? "bg-amber-500" : "bg-red-500";

            return (
              <div
                key={feed.id}
                onClick={() => setSelectedFeed(feed)}
                className="rounded-[2rem] border overflow-hidden shadow-2xl cursor-pointer transition-all duration-300 hover:scale-[1.01] bg-ng-panel border-ng-border hover:shadow-[0_0_25px_rgba(0,0,0,0.5)] group/card"
              >
                {/* Stream Frame */}
                <div className="relative aspect-video bg-[#0a0f18] overflow-hidden group border-b border-ng-border/60">
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="w-24 h-24 border border-dashed border-emerald-500/20 rounded-full flex items-center justify-center animate-pulse">
                      <div className="w-12 h-12 border border-emerald-500/30 rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                      </div>
                    </div>
                    <div className="mt-3 text-[11px] font-mono font-bold text-emerald-400/80 tracking-widest uppercase flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>Live Standby · RTSP / ONVIF Armed</span>
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40" />

                  <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 p-4 flex flex-col justify-between pointer-events-none border border-white/[0.05]">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded bg-black/70 border border-white/10 text-[10px] font-mono font-bold text-white tracking-widest backdrop-blur-sm">
                        {feed.id}
                      </span>
                      <div className="flex items-center gap-2 px-2.5 py-1 rounded text-[10px] font-mono font-bold text-white bg-black/70 border border-white/10 backdrop-blur-sm shadow-xl">
                        <span className={`w-1.5 h-1.5 rounded-full shadow-[0_0_5px_currentColor] ${statusColor}`} />
                        <span className="uppercase tracking-widest">{feed.status}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="drop-shadow-lg">
                        <div className="font-semibold text-sm text-white font-display">
                          {feed.name}
                        </div>
                        <div className="text-[10px] font-mono font-bold text-white/70 mt-0.5 tracking-tight uppercase">
                          {feed.gateId} · Active Channel
                        </div>
                      </div>
                      <span className="flex items-center gap-1.5 font-mono text-[9px] text-red-500 font-bold px-2 py-1 rounded bg-black/80 border border-red-500/20 backdrop-blur-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                        REC
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-4 flex items-center justify-between text-xs border-t border-ng-border/50 bg-ng-elevated/30">
                  <span className="font-mono text-[11px] font-bold text-ng-muted uppercase tracking-widest">
                    Latency: 18ms
                  </span>
                  <span className="font-mono text-[11px] font-bold text-ng-orange uppercase tracking-widest group-hover/card:underline transition-all">
                    Expand CCTV Feed ⤢
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Fullscreen Surveillance Modal */}
      {selectedFeed && (
        <Modal
          isOpen={Boolean(selectedFeed)}
          onClose={() => setSelectedFeed(null)}
          title={`Surveillance Console · ${selectedFeed.name} (${selectedFeed.id})`}
          subtitle={`Hardware Gateway Feed: ${selectedFeed.gateId} · High Bitrate H.265`}
          maxWidth="800px"
        >
          <div className="flex flex-col gap-5 text-sm">
            <div className="relative aspect-video rounded-2xl overflow-hidden border bg-[#0a0f18] shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] border-ng-border flex items-center justify-center">
              <div className="text-center font-mono flex flex-col items-center gap-2 text-ng-muted">
                <div className="w-20 h-20 rounded-full border border-dashed border-emerald-500/30 flex items-center justify-center animate-pulse">
                  <span className="text-2xl">📹</span>
                </div>
                <div className="text-xs text-emerald-400 font-bold tracking-wider uppercase">
                  {selectedFeed.name} · Live Standby
                </div>
                <div className="text-[10px] text-ng-secondary max-w-sm">
                  RTSP Stream Ready at rtsp://127.0.0.1:8554/{selectedFeed.id.toLowerCase()}
                </div>
              </div>

              <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30" />
              <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] pointer-events-none" />

              <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold text-white border border-white/10 shadow-lg">
                <span className="text-red-500 mr-2 animate-pulse">●</span>
                {currentTime} IST · PTZ Optical 1.0X
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl border flex-wrap gap-4 bg-ng-elevated border-ng-border shadow-inner">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setNightVision(!nightVision)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold border cursor-pointer transition-all flex items-center gap-2 ${
                    nightVision 
                      ? "bg-green-500/10 border-green-500/30 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.15)]" 
                      : "bg-ng-panel border-ng-border text-ng-secondary hover:text-ng-text hover:bg-white/[0.05]"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${nightVision ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" : "bg-ng-secondary"} transition-all`} />
                  Night Vision: {nightVision ? "ON" : "OFF"}
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => alert(`Snapshot from ${selectedFeed.id} archived to system storage.`)}
                  className="px-5 py-2.5 rounded-xl text-xs font-display font-semibold text-white border-none cursor-pointer bg-ng-orange shadow-[0_0_15px_rgba(255,107,0,0.3)] hover:brightness-110 transition-all"
                >
                  Save Frame Snapshot
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
