import { useState, useEffect } from "react";
import Modal from "../components/ui/Modal";
import type { StatusType, CameraFeed } from "../types";

const FEEDS: CameraFeed[] = [
  {
    id: "CAM-001",
    name: "Main Gate Entry",
    gateId: "G-001",
    status: "safe" as StatusType,
    time: "09:41:10",
    imgUrl: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&h=350&fit=crop&auto=format",
  },
  {
    id: "CAM-002",
    name: "Block A Vestibule",
    gateId: "G-002",
    status: "attention" as StatusType,
    time: "09:41:05",
    imgUrl: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&h=350&fit=crop&auto=format",
  },
  {
    id: "CAM-003",
    name: "Block B Lobby",
    gateId: "G-003",
    status: "safe" as StatusType,
    time: "09:41:08",
    imgUrl: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&h=350&fit=crop&auto=format",
  },
  {
    id: "CAM-004",
    name: "Block C Corridor",
    gateId: "G-004",
    status: "safe" as StatusType,
    time: "09:40:55",
    imgUrl: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&h=350&fit=crop&auto=format",
  },
  {
    id: "CAM-005",
    name: "Service Entry Dock",
    gateId: "G-005",
    status: "critical" as StatusType,
    time: "09:27:50",
    imgUrl: "https://images.unsplash.com/photo-1494959764136-6be9eb3223d4?w=600&h=350&fit=crop&auto=format",
  },
  {
    id: "CAM-006",
    name: "Rear Perimeter Exit",
    gateId: "G-006",
    status: "safe" as StatusType,
    time: "09:41:02",
    imgUrl: "https://images.unsplash.com/photo-1565336969600-0d20cb84ed14?w=600&h=350&fit=crop&auto=format",
  },
];

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
        <div className="flex items-center gap-3 font-mono text-xs text-green-500 bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
          <span className="w-2.5 h-2.5 rounded-full animate-ping bg-green-500" />
          <span className="font-bold tracking-widest">LIVE SURVEILLANCE FEED</span>
          <span className="text-green-500/50">—</span>
          <span className="text-ng-text font-bold">{currentTime || "17:00:00"} IST</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ng-elevated border border-ng-border">
          <span className="text-[11px] font-mono font-bold text-ng-muted uppercase tracking-widest">
            6 Cameras Online · HD 1080p Stream
          </span>
        </div>
      </div>

      {/* 6-Grid Surveillance Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEEDS.map(feed => {
          const statusColor =
            feed.status === "safe" ? "bg-green-500" : feed.status === "attention" ? "bg-amber-500" : "bg-red-500";

          return (
            <div
              key={feed.id}
              onClick={() => setSelectedFeed(feed)}
              className="rounded-[2rem] border overflow-hidden shadow-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] bg-ng-panel border-ng-border hover:shadow-[0_0_25px_rgba(0,0,0,0.5)] group/card"
            >
              {/* Stream Frame */}
              <div className="relative aspect-video bg-black overflow-hidden group">
                <img
                  src={feed.imgUrl}
                  alt={feed.name}
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:opacity-90"
                  style={{
                    filter: "brightness(0.7) contrast(1.1) saturate(0.5)",
                  }}
                />
                
                {/* Scanline overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20" />

                {/* Surveillance Overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 p-4 flex flex-col justify-between pointer-events-none border border-white/[0.05] shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded bg-black/60 border border-white/10 text-[10px] font-mono font-bold text-white tracking-widest backdrop-blur-sm">
                      {feed.id}
                    </span>
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded text-[10px] font-mono font-bold text-white bg-black/60 border border-white/10 backdrop-blur-sm shadow-xl">
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
                        {feed.gateId} · Active Stream
                      </div>
                    </div>
                    <span className="flex items-center gap-1.5 font-mono text-[9px] text-red-500 font-bold px-2 py-1 rounded bg-black/80 border border-red-500/20 backdrop-blur-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                      REC
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-5 py-4 flex items-center justify-between text-xs border-t border-ng-border/50 bg-ng-elevated/30">
                <span className="font-mono text-[11px] font-bold text-ng-muted uppercase tracking-widest">
                  Latency: 24ms
                </span>
                <span className="font-mono text-[11px] font-bold text-ng-orange uppercase tracking-widest group-hover/card:underline transition-all">
                  Expand CCTV Feed ⤢
                </span>
              </div>
            </div>
          );
        })}
      </div>

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
            {/* Viewport */}
            <div className="relative aspect-video rounded-2xl overflow-hidden border bg-black shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] border-ng-border">
              <img
                src={selectedFeed.imgUrl}
                alt={selectedFeed.name}
                className="w-full h-full object-cover transition-all duration-300"
                style={{
                  filter: nightVision
                    ? "brightness(1.2) contrast(1.5) hue-rotate(90deg) saturate(2)"
                    : "brightness(0.8) contrast(1.1)",
                }}
              />
              
              {/* Scanline overlay for modal */}
              <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30" />
              <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] pointer-events-none" />

              {/* Grid Lines Overlay */}
              <div className="absolute inset-0 pointer-events-none border border-dashed border-white/20 m-8 flex items-center justify-center opacity-50">
                <div className="w-8 h-8 border border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10" />
                <div className="absolute top-0 left-1/2 w-[1px] h-full bg-white/10" />
              </div>

              <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold text-white border border-white/10 shadow-lg">
                <span className="text-red-500 mr-2 animate-pulse">●</span>
                {currentTime} IST · PTZ Optical 1.0X
              </div>
            </div>

            {/* Controls Bar */}
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

                <button className="px-4 py-2.5 rounded-xl text-xs font-mono font-bold border cursor-pointer bg-ng-panel border-ng-border text-ng-text hover:bg-white/[0.05] transition-colors">
                  PTZ Zoom In (+)
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
