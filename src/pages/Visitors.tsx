import { useState } from "react";
import Modal from "../components/ui/Modal";
import type { Visitor, VisitorStatus } from "../types";

const INITIAL_VISITORS: Visitor[] = [
  { id: 1, name: "Ravi Teja", phone: "+92 300 1234567", host: "Rahul Sharma", purpose: "Study Group / Project Discussion", since: "09:25", notif: null, status: "pending" },
  { id: 2, name: "Anjali Singh", phone: "+92 321 9876543", host: "Priya Kapoor", purpose: "Family Visit", since: "09:10", notif: "Telegram", status: "approved" },
  { id: 3, name: "Kumar Patel", phone: "+92 333 4567890", host: "Dev Mishra", purpose: "Package Delivery", since: "08:55", notif: "Email", status: "checked-in" },
  { id: 4, name: "Sonal Mehta", phone: "+92 312 8765432", host: "Nisha Reddy", purpose: "Interview Preparation", since: "08:30", notif: null, status: "rejected" },
  { id: 5, name: "Tariq Hassan", phone: "+92 345 6789012", host: "Arun Mehta", purpose: "Library Book Exchange", since: "08:15", notif: null, status: "pending" },
];

export default function Visitors() {
  const [visitors, setVisitors] = useState(INITIAL_VISITORS);
  const [filter, setFilter] = useState<string>("All");
  const [newModalOpen, setNewModalOpen] = useState(false);

  // New Visitor Form State
  const [formName, setFormName] = useState("");
  const [formHost, setFormHost] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formPurpose, setFormPurpose] = useState("");

  const approve = (id: number) =>
    setVisitors(v =>
      v.map(x => (x.id === id ? { ...x, status: "approved" as VisitorStatus, notif: "Telegram" } : x)),
    );

  const reject = (id: number) =>
    setVisitors(v =>
      v.map(x => (x.id === id ? { ...x, status: "rejected" as VisitorStatus } : x)),
    );

  const checkIn = (id: number) =>
    setVisitors(v =>
      v.map(x => (x.id === id ? { ...x, status: "checked-in" as VisitorStatus } : x)),
    );

  const handleCreateVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formHost.trim()) return;

    const newEntry: Visitor = {
      id: Date.now(),
      name: formName,
      host: formHost,
      phone: formPhone || "+92 300 0000000",
      purpose: formPurpose || "General Visit",
      since: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }),
      notif: "Telegram",
      status: "pending",
    };

    setVisitors([newEntry, ...visitors]);
    setFormName("");
    setFormHost("");
    setFormPhone("");
    setFormPurpose("");
    setNewModalOpen(false);
  };

  const filtered = visitors.filter(v => (filter === "All" ? true : v.status === filter));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case "approved": return "text-green-500 bg-green-500/10 border-green-500/20";
      case "rejected": return "text-red-500 bg-red-500/10 border-red-500/20";
      case "checked-in": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      default: return "text-ng-muted bg-ng-elevated border-ng-border";
    }
  };
  
  const getDotColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]";
      case "approved": return "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]";
      case "rejected": return "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]";
      case "checked-in": return "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]";
      default: return "bg-ng-orange shadow-[0_0_8px_rgba(255,107,0,0.5)]";
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none">
      {/* Top Status Counters & Action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          {(["All", "pending", "approved", "checked-in", "rejected"] as const).map(s => {
            const count = s === "All" ? visitors.length : visitors.filter(v => v.status === s).length;
            const isSelected = filter === s;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all text-xs font-display font-medium ${
                  isSelected ? "bg-ng-orange/10 border-ng-orange/30 shadow-[0_0_15px_rgba(255,107,0,0.1)]" : "bg-ng-panel border-ng-border hover:bg-ng-elevated"
                }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${getDotColor(s)}`} />
                <span className={`capitalize ${isSelected ? "text-ng-text" : "text-ng-secondary"}`}>
                  {s}
                </span>
                <span className={`font-mono font-bold ml-1 ${isSelected ? "text-ng-orange" : "text-ng-text"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setNewModalOpen(true)}
          className="px-5 py-3 rounded-xl text-xs font-display font-semibold text-white border-none cursor-pointer transition-all flex items-center gap-2 bg-ng-orange shadow-[0_0_15px_rgba(255,107,0,0.3)] hover:brightness-110"
        >
          <span className="text-sm">+</span> Register New Visitor
        </button>
      </div>

      {/* Visitors List Card */}
      <div className="rounded-[2rem] border border-ng-border overflow-hidden shadow-2xl bg-ng-panel">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-ng-border bg-ng-elevated/30">
                {["Visitor Name", "Host Resident", "Purpose", "Arrival", "Alert Notification", "Status", "Actions"].map(
                  (h, i) => (
                    <th
                      key={i}
                      className="px-5 py-4 text-[10px] font-mono uppercase tracking-widest font-bold text-ng-muted"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-ng-border">
              {filtered.map(v => (
                <tr
                  key={v.id}
                  className="transition-colors bg-transparent hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm select-none shrink-0 bg-ng-elevated text-ng-secondary border border-ng-border shadow-inner font-display">
                        {v.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <div className="text-sm font-semibold font-display text-ng-text mb-0.5">
                          {v.name}
                        </div>
                        {v.phone && (
                          <div className="text-[10px] font-mono text-ng-muted tracking-tight">
                            {v.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs font-body text-ng-secondary font-medium">
                    {v.host}
                  </td>
                  <td className="px-5 py-4 text-xs font-body text-ng-secondary">
                    {v.purpose}
                  </td>
                  <td className="px-5 py-4 text-xs font-mono text-ng-muted">
                    {v.since}
                  </td>
                  <td className="px-5 py-4">
                    {v.notif ? (
                      <span className="text-[10px] font-mono px-2.5 py-1 rounded-md border border-green-500/20 bg-green-500/10 text-green-500 font-bold">
                        via {v.notif}
                      </span>
                    ) : (
                      <span className="text-xs text-ng-muted font-mono">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-2 text-[10px] font-mono font-bold px-2.5 py-1 rounded-md border ${getStatusColor(v.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getDotColor(v.status)}`} />
                      <span className="uppercase tracking-widest">{v.status}</span>
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {v.status === "pending" && (
                        <>
                          <button
                            onClick={() => approve(v.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border cursor-pointer transition-colors bg-green-500/10 border-green-500/30 text-green-500 hover:bg-green-500/20"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => reject(v.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border cursor-pointer transition-colors bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {v.status === "approved" && (
                        <button
                          onClick={() => checkIn(v.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border cursor-pointer transition-colors bg-blue-500/10 border-blue-500/30 text-blue-500 hover:bg-blue-500/20"
                        >
                          Mark Check-In
                        </button>
                      )}
                      {v.status === "checked-in" && (
                        <span className="text-[10px] font-mono font-bold text-green-500 uppercase tracking-widest">
                          Inside Campus
                        </span>
                      )}
                      {v.status === "rejected" && (
                        <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest">
                          Denied Entry
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Visitor Registration Modal */}
      <Modal
        isOpen={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        title="Register New Visitor"
        subtitle="Log visitor entry request and trigger resident Telegram verification"
      >
        <form onSubmit={handleCreateVisitor} className="flex flex-col gap-5 text-sm">
          <div>
            <label className="block font-mono text-[10px] font-bold uppercase tracking-widest mb-1.5 text-ng-muted">
              Visitor Full Name
            </label>
            <input
              required
              value={formName}
              onChange={e => setFormName(e.target.value)}
              placeholder="e.g. Tariq Mehmood"
              className="w-full rounded-xl px-4 py-3 text-sm border outline-none bg-ng-elevated border-ng-border text-ng-text font-body focus:border-ng-orange focus:shadow-[0_0_10px_rgba(255,107,0,0.15)] transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[10px] font-bold uppercase tracking-widest mb-1.5 text-ng-muted">
                Host Student / Resident
              </label>
              <input
                required
                value={formHost}
                onChange={e => setFormHost(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full rounded-xl px-4 py-3 text-sm border outline-none bg-ng-elevated border-ng-border text-ng-text font-body focus:border-ng-orange focus:shadow-[0_0_10px_rgba(255,107,0,0.15)] transition-all"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] font-bold uppercase tracking-widest mb-1.5 text-ng-muted">
                Phone Number
              </label>
              <input
                value={formPhone}
                onChange={e => setFormPhone(e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full rounded-xl px-4 py-3 text-sm border outline-none bg-ng-elevated border-ng-border text-ng-text font-body focus:border-ng-orange focus:shadow-[0_0_10px_rgba(255,107,0,0.15)] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[10px] font-bold uppercase tracking-widest mb-1.5 text-ng-muted">
              Purpose of Visit
            </label>
            <input
              value={formPurpose}
              onChange={e => setFormPurpose(e.target.value)}
              placeholder="e.g. Academic project discussion"
              className="w-full rounded-xl px-4 py-3 text-sm border outline-none bg-ng-elevated border-ng-border text-ng-text font-body focus:border-ng-orange focus:shadow-[0_0_10px_rgba(255,107,0,0.15)] transition-all"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-ng-border mt-2">
            <button
              type="button"
              onClick={() => setNewModalOpen(false)}
              className="px-6 py-2.5 rounded-xl font-display font-medium text-sm border cursor-pointer bg-ng-elevated border-ng-border text-ng-text hover:bg-white/[0.05] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl font-display font-semibold text-sm text-white border-none cursor-pointer bg-ng-orange shadow-[0_0_15px_rgba(255,107,0,0.3)] hover:brightness-110 transition-all"
            >
              Issue Gate Pass
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
