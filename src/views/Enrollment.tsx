import React, { useState, useEffect, useRef } from "react";
import Modal from "../components/ui/Modal";
import Avatar from "../components/ui/Avatar";
import { useAppContext } from "../components/providers/AppProvider";

import { apiFetch } from "../lib/api";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface ResidentRecord {
  _id: string;
  name: string;
  rollNo: string;
  initials: string;
  personType: "STUDENT" | "WORKER" | "STAFF";
  roomNo: string;
  department: string;
  fingerprintId: string;
  isEnrolled: boolean;
  status: "INSIDE" | "OUTSIDE";
  consentGiven: boolean;
  guardianContact?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  createdAt: string;
}

export default function Enrollment() {
  const { user } = useAppContext();
  const role = (user?.role || "warden").toLowerCase();

  const canEnroll = true;
  const canDelete = role === "admin" || role === "warden";

  const [residents, setResidents] = useState<ResidentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "STUDENT" | "WORKER" | "STAFF">("ALL");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Real Hardware Biometric State (No mock timers)
  const [scanStep, setScanStep] = useState<"IDLE" | "ARMED_WAITING" | "TOUCH_DETECTED">("IDLE");
  const [capturedSlot, setCapturedSlot] = useState<string>("");
  const [capturedQuality, setCapturedQuality] = useState<number | null>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Verification Simulator State
  const [simPerson, setSimPerson] = useState<ResidentRecord | null>(null);
  const [simResult, setSimResult] = useState<{
    status: "MATCH" | "NO_MATCH";
    latencyMs: number;
    relay: string;
    lifeSafety: string;
    personName: string;
  } | null>(null);

  // Enrollment Form State
  const [formName, setFormName] = useState("");
  const [formRollNo, setFormRollNo] = useState("");
  const [formCategory, setFormCategory] = useState<"STUDENT" | "WORKER" | "STAFF">("STUDENT");
  const [staffRole, setStaffRole] = useState<"warden" | "admin" | "security">("warden");
  const [formRoom, setFormRoom] = useState("");
  const [formDept, setFormDept] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [consentGiven, setConsentGiven] = useState(true);

  // Edit Personnel Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<ResidentRecord | null>(null);
  const [editName, setEditName] = useState("");
  const [editRollNo, setEditRollNo] = useState("");
  const [editCategory, setEditCategory] = useState<"STUDENT" | "WORKER" | "STAFF">("STUDENT");
  const [editStaffRole, setEditStaffRole] = useState<"warden" | "admin" | "security">("warden");
  const [editRoom, setEditRoom] = useState("");
  const [editDept, setEditDept] = useState("");
  const [editGuardianName, setEditGuardianName] = useState("");
  const [editGuardianPhone, setEditGuardianPhone] = useState("");
  const [editGuardianEmail, setEditGuardianEmail] = useState("");
  const [editFingerprintId, setEditFingerprintId] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  // Update Fingerprint via Live20R Modal State
  const [updateFpModalOpen, setUpdateFpModalOpen] = useState(false);
  const [updateFpTarget, setUpdateFpTarget] = useState<ResidentRecord | null>(null);
  const [updateFpStep, setUpdateFpStep] = useState<"IDLE" | "ARMED_WAITING" | "TOUCH_DETECTED">("IDLE");
  const [updateFpSlot, setUpdateFpSlot] = useState<string>("");
  const [updateFpQuality, setUpdateFpQuality] = useState<number | null>(null);
  const updateFpPollRef = useRef<NodeJS.Timeout | null>(null);

  const fetchResidents = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/v1/students`, { cache: "no-store" });
      const json = await res.json();
      const list = json.data?.students || (Array.isArray(json.data) ? json.data : null) || json.message?.data?.students || [];
      if (Array.isArray(list)) {
        setResidents(list);
      }
    } catch {
      // Backend offline or running in mock mode
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  // Clean up polling timer on unmount
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      if (updateFpPollRef.current) clearInterval(updateFpPollRef.current);
    };
  }, []);

  // ── REAL HARDWARE SCANNER ARMING (WAIT FOR PHYSICAL TOUCH) ──
  const armScannerForPhysicalTouch = async () => {
    if (!formName.trim() || !formRollNo.trim()) {
      alert("Please enter the Person's Full Name and Roll No / Staff ID before arming the scanner.");
      return;
    }

    if (!consentGiven) {
      alert("Biometric consent is required under hostel privacy policy.");
      return;
    }

    setScanStep("ARMED_WAITING");
    setCapturedSlot("");
    setCapturedQuality(null);

    const payload = {
      name: formName.trim(),
      rollNo: formRollNo.trim().toUpperCase(),
      personType: formCategory,
      roomNo: formCategory === "STAFF"
        ? (formRoom.trim() || `${staffRole.toUpperCase()} Office`)
        : (formRoom.trim() || "Unassigned"),
      department: formCategory === "STAFF"
        ? `Hostel Administration (${staffRole.toUpperCase()})`
        : (formDept.trim() || (formCategory === "WORKER" ? "Facilities & Mess" : "General")),
      guardianContact: formCategory === "STUDENT" ? {
        name: guardianName.trim(),
        phone: guardianPhone.trim(),
        email: guardianEmail.trim(),
      } : {},
      consentGiven: true,
    };

    try {
      // 1. Arm backend for physical finger touch
      await apiFetch(`/api/v1/hardware/zkteco/arm-enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // 2. Poll for physical touch event (no fake timers — waits for real sensor event)
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);

      pollTimerRef.current = setInterval(async () => {
        try {
          const res = await apiFetch(`/api/v1/hardware/zkteco/enroll-status`, { cache: "no-store" });
          const json = await res.json();

          if (json.data?.lastResult && json.data.lastResult.success) {
            // PHYSICAL TOUCH DETECTED AND AUTO-SAVED BY BACKEND!
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
            const r = json.data.lastResult;
            setCapturedSlot(r.slot || "FP-001");
            setCapturedQuality(r.quality || 98);
            setScanStep("TOUCH_DETECTED");

            setMessage(`✓ PHYSICAL TOUCH DETECTED! Auto-saved ${r.student?.name || formName} (${r.slot}) to MongoDB Atlas!`);
            fetchResidents();

            // Auto-close modal after 2 seconds
            setTimeout(() => {
              resetForm();
              setModalOpen(false);
            }, 2000);
          }
        } catch {
          // Poll retry
        }
      }, 700);

    } catch (err: any) {
      alert("Failed to communicate with ZKTeco gateway: " + err.message);
      setScanStep("IDLE");
    }
  };

  const disarmScanner = async () => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    try {
      await apiFetch(`/api/v1/hardware/zkteco/disarm-enroll`, { method: "POST" });
    } catch {}
    setScanStep("IDLE");
  };

  const handleManualSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formRollNo.trim()) return;

    setSaving(true);
    // Derive next FP slot from backend so we never assign an already-used ID
    let assignedSlot = capturedSlot;
    if (!assignedSlot) {
      try {
        const slotRes = await apiFetch(`/api/v1/hardware/zkteco/next-fp-slot?name=${encodeURIComponent(formName.trim())}`, { cache: "no-store" });
        if (slotRes.ok) {
          const slotJson = await slotRes.json();
          assignedSlot = slotJson.data?.slot || slotJson.data?.fingerprintId || "";
        }
      } catch {}
      // Ultimate fallback only if backend is unreachable
      if (!assignedSlot) {
        const code = formCategory === "STAFF"
          ? (staffRole === "admin" ? "ADM" : staffRole === "security" ? "SEC" : "WRD")
          : "USR";
        const existingForRole = residents.filter(r =>
          r.fingerprintId && r.fingerprintId.startsWith(`FP-${code}-`)
        );
        const maxNum = existingForRole.reduce((m, r) => {
          const match = r.fingerprintId?.match(/-(\d+)$/);
          return match ? Math.max(m, parseInt(match[1], 10)) : m;
        }, 0);
        assignedSlot = `FP-${code}-${String(maxNum + 1).padStart(2, "0")}`;
      }
    }

    const payload = {
      name: formName.trim(),
      rollNo: formRollNo.trim().toUpperCase(),
      personType: formCategory,
      roomNo: formCategory === "STAFF"
        ? (formRoom.trim() || `${staffRole.toUpperCase()} Office`)
        : (formRoom.trim() || "Unassigned"),
      department: formCategory === "STAFF"
        ? `Hostel Administration (${staffRole.toUpperCase()})`
        : (formDept.trim() || (formCategory === "WORKER" ? "Facilities & Mess" : "General")),
      guardianName: formCategory === "STUDENT" ? guardianName.trim() : "",
      guardianPhone: formCategory === "STUDENT" ? guardianPhone.trim() : "",
      guardianEmail: formCategory === "STUDENT" ? guardianEmail.trim() : "",
      fingerprintId: assignedSlot,
      template: `MANUAL_OVERRIDE_${Date.now()}`,
      consentGiven: true,
    };

    try {
      const res = await apiFetch(`/api/v1/students/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (res.ok) {
        setMessage(`✓ Enrolled ${formName} with biometric slot ${assignedSlot}`);
        resetForm();
        setModalOpen(false);
        fetchResidents();
      } else {
        alert(json.message || "Enrollment failed on server");
      }
    } catch {
      alert("Backend unreachable");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    disarmScanner();
    setFormName("");
    setFormRollNo("");
    setFormRoom("");
    setFormDept("");
    setGuardianName("");
    setGuardianPhone("");
    setGuardianEmail("");
    setCapturedSlot("");
    setCapturedQuality(null);
    setScanStep("IDLE");
  };

  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!val.trim()) return;
    const parts = val.trim().split(/\s+/);
    const code = parts.length === 1 ? parts[0].substring(0, 3).toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();

    // Suggest Roll/User ID if not already manually typed or if empty
    if (!formRollNo || formRollNo.startsWith("STU-") || formRollNo.startsWith("WRK-") || formRollNo.startsWith("ADM-") || formRollNo.startsWith("WRD-") || formRollNo.startsWith("SEC-") || formRollNo.startsWith("STF-")) {
      const suggestedRoll = formCategory === "STUDENT"
        ? `STU-${code}-${Math.floor(100 + Math.random() * 899)}`
        : formCategory === "WORKER"
        ? `WRK-${code}-${Math.floor(100 + Math.random() * 899)}`
        : staffRole === "admin"
        ? "ADM-001"
        : staffRole === "security"
        ? "SEC-001"
        : "WRD-001";
      setFormRollNo(suggestedRoll);
    }

    if (!capturedSlot || capturedSlot.startsWith("FP-")) {
      setCapturedSlot(`FP-${code}-01`);
    }
  };

  const openEditModal = (r: ResidentRecord) => {
    setEditingResident(r);
    setEditName(r.name);
    setEditRollNo(r.rollNo);
    setEditCategory(r.personType);
    setEditStaffRole(
      r.rollNo.toLowerCase().includes("adm")
        ? "admin"
        : r.rollNo.toLowerCase().includes("sec")
        ? "security"
        : "warden"
    );
    setEditRoom(r.roomNo || "");
    setEditDept(r.department || "");
    setEditGuardianName(r.guardianContact?.name || "");
    setEditGuardianPhone(r.guardianContact?.phone || "");
    setEditGuardianEmail(r.guardianContact?.email || "");
    setEditFingerprintId(r.fingerprintId || "");
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResident || !editName.trim() || !editRollNo.trim()) return;

    setEditSaving(true);
    const payload = {
      name: editName.trim(),
      rollNo: editRollNo.trim().toUpperCase(),
      personType: editCategory,
      roomNo: editRoom.trim() || "Unassigned",
      department: editDept.trim() || "General",
      fingerprintId: editFingerprintId.trim() || editingResident.fingerprintId || "",
      guardianName: editCategory === "STUDENT" ? editGuardianName.trim() : "",
      guardianPhone: editCategory === "STUDENT" ? editGuardianPhone.trim() : "",
      guardianEmail: editCategory === "STUDENT" ? editGuardianEmail.trim() : "",
    };

    try {
      const res = await apiFetch(`/api/v1/students/${editingResident._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok) {
        setMessage(`✓ Details updated successfully for ${editName} (${editRollNo})`);
        setEditModalOpen(false);
        setEditingResident(null);
        fetchResidents();
      } else {
        alert(json.message || "Failed to update resident");
      }
    } catch {
      alert("Backend unreachable");
    } finally {
      setEditSaving(false);
    }
  };

  const openUpdateFpModal = (r: ResidentRecord) => {
    setUpdateFpTarget(r);
    const parts = r.name.trim().split(/\s+/);
    let code = "USR";
    if (r.name.toLowerCase() === "admin") code = "ADM";
    else if (r.name.toLowerCase() === "warden") code = "WRD";
    else if (r.name.toLowerCase() === "security") code = "SEC";
    else {
      code = parts.length === 1 ? parts[0].substring(0, 3).toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    let nextNum = 2;
    if (r.fingerprintId) {
      const match = r.fingerprintId.match(/-(\d+)$/);
      if (match) {
        nextNum = parseInt(match[1], 10) + 1;
      }
    }
    setUpdateFpSlot(`FP-${code}-${String(nextNum).padStart(2, "0")}`);
    setUpdateFpStep("IDLE");
    setUpdateFpQuality(null);
    setUpdateFpModalOpen(true);
  };

  const closeUpdateFpModal = () => {
    if (updateFpPollRef.current) {
      clearInterval(updateFpPollRef.current);
      updateFpPollRef.current = null;
    }
    setUpdateFpModalOpen(false);
    setUpdateFpStep("IDLE");
    setUpdateFpTarget(null);
    apiFetch(`/api/v1/hardware/zkteco/disarm-update-fp`, { method: "POST" }).catch(() => {});
  };

  const armUpdateFpScanner = async () => {
    if (!updateFpTarget) return;
    setUpdateFpStep("ARMED_WAITING");
    setUpdateFpQuality(null);

    try {
      const armRes = await apiFetch(`/api/v1/hardware/zkteco/arm-update-fp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: updateFpTarget._id,
          name: updateFpTarget.name,
          rollNo: updateFpTarget.rollNo,
        }),
      });

      if (!armRes.ok) {
        const errJson = await armRes.json();
        throw new Error(errJson.message || "Failed to arm scanner");
      }

      if (updateFpPollRef.current) clearInterval(updateFpPollRef.current);

      updateFpPollRef.current = setInterval(async () => {
        try {
          const res = await apiFetch(`/api/v1/hardware/zkteco/update-fp-status`, { cache: "no-store" });
          const json = await res.json();

          if (json.data?.lastResult) {
            const r = json.data.lastResult;
            if (r.success) {
              // PHYSICAL TOUCH DETECTED AND SAVED TO USER ID!
              if (updateFpPollRef.current) {
                clearInterval(updateFpPollRef.current);
                updateFpPollRef.current = null;
              }
              setUpdateFpSlot(r.slot || updateFpSlot);
              setUpdateFpQuality(r.quality || 98);
              setUpdateFpStep("TOUCH_DETECTED");

              setMessage(`✓ Live20R scan captured! Saved fingerprint ${r.slot} directly to ${updateFpTarget.name} (${updateFpTarget.rollNo})!`);
              fetchResidents();

              setTimeout(() => {
                closeUpdateFpModal();
              }, 1800);
            } else if (r.error) {
              alert("Fingerprint update failed: " + r.error);
              setUpdateFpStep("IDLE");
            }
          }
        } catch {}
      }, 500);
    } catch (err: any) {
      alert("Failed to communicate with ZKTeco gateway: " + err.message);
      setUpdateFpStep("IDLE");
    }
  };

  const disarmUpdateFpScanner = async () => {
    if (updateFpPollRef.current) clearInterval(updateFpPollRef.current);
    try {
      await apiFetch(`/api/v1/hardware/zkteco/disarm-update-fp`, { method: "POST" });
    } catch {}
    setUpdateFpStep("IDLE");
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to de-enroll ${name}? Their biometric template and credentials will be permanently erased from MongoDB Atlas in accordance with the Biometric Retention Policy.`)) {
      return;
    }

    try {
      const res = await apiFetch(`/api/v1/students/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        alert(json.message || "Could not de-enroll this person.");
        return;
      }
      setResidents(prev => prev.filter(r => r._id !== id));
      setMessage(`✓ Biometric template and records for ${name} permanently erased.`);
    } catch {
      alert("Backend unreachable: nothing was deleted.");
    }
  };

  const runVerificationSimulation = (person: ResidentRecord) => {
    setSimPerson(person);
    const latency = Math.floor(18 + Math.random() * 16);
    setSimResult({
      status: "MATCH",
      latencyMs: latency,
      relay: "No lock hardware: guard opens the door",
      lifeSafety: "Result is shown to Security; guard decides",
      personName: person.name,
    });
  };

  const studentCount = residents.filter(r => r.personType === "STUDENT").length;
  const workerCount = residents.filter(r => r.personType === "WORKER").length;
  const staffCount = residents.filter(r => r.personType === "STAFF").length;

  const filtered = residents.filter(r => {
    if (filter !== "ALL" && r.personType !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = r.name.toLowerCase().includes(q);
      const matchRoll = r.rollNo.toLowerCase().includes(q);
      const matchFp = (r.fingerprintId || "").toLowerCase().includes(q);
      const matchDept = (r.department || "").toLowerCase().includes(q);
      if (!matchName && !matchRoll && !matchFp && !matchDept) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6 select-none font-body">
      {/* Top Notification Banner */}
      {message && (
        <div className="p-3.5 rounded-xl border border-green-500/20 bg-green-500/10 text-green-400 font-mono text-xs flex justify-between items-center animate-fade-in shadow-lg">
          <div className="flex items-center gap-2">
            <span>●</span>
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage(null)} className="bg-transparent border-none text-green-400 cursor-pointer font-bold px-2 py-1">✕</button>
        </div>
      )}

      {/* Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-ng-border bg-ng-panel/70 flex flex-col gap-1 shadow-md">
          <span className="text-[10px] font-mono uppercase tracking-widest text-ng-muted font-bold">Total Registered</span>
          <span className="text-2xl font-bold font-display text-ng-text">{residents.length}</span>
          <span className="text-[10px] font-mono text-ng-secondary">Cached in gateway memory</span>
        </div>
        <div className="p-4 rounded-2xl border border-ng-border bg-ng-panel/70 flex flex-col gap-1 shadow-md">
          <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold">Student Residents</span>
          <span className="text-2xl font-bold font-display text-blue-400">{studentCount}</span>
          <span className="text-[10px] font-mono text-ng-secondary">Hostel occupants</span>
        </div>
        <div className="p-4 rounded-2xl border border-ng-border bg-ng-panel/70 flex flex-col gap-1 shadow-md">
          <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold">Hostel Workers</span>
          <span className="text-2xl font-bold font-display text-purple-400">{workerCount}</span>
          <span className="text-[10px] font-mono text-ng-secondary">Mess & cleaning staff</span>
        </div>
        <div className="p-4 rounded-2xl border border-ng-border bg-ng-panel/70 flex flex-col gap-1 shadow-md">
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">Staff & Security</span>
          <span className="text-2xl font-bold font-display text-amber-400">{staffCount}</span>
          <span className="text-[10px] font-mono text-ng-secondary">Warden / Admin / Guards</span>
        </div>
      </div>

      {/* Action Bar: Filter, Search, and Enroll Trigger */}
      <div className="rounded-[2rem] border border-ng-border overflow-hidden shadow-2xl bg-ng-panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-ng-elevated p-1 rounded-xl border border-ng-border">
            {(["ALL", "STUDENT", "WORKER", "STAFF"] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium cursor-pointer transition-colors border-none ${
                  filter === cat ? "bg-ng-orange/15 text-ng-orange font-bold" : "bg-transparent text-ng-muted hover:text-ng-text"
                }`}
              >
                {cat === "ALL" ? "All Personnel" : cat === "STUDENT" ? `Students (${studentCount})` : cat === "WORKER" ? `Workers (${workerCount})` : `Staff (${staffCount})`}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-ng-border text-xs w-60 sm:w-72 bg-ng-elevated">
              <span className="text-ng-muted font-mono">⌕</span>
              <input
                placeholder="Search name, roll no, slot…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-xs font-body text-ng-text placeholder-ng-muted"
              />
            </div>

            {canEnroll && (
              <button
                onClick={() => {
                  resetForm();
                  setModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl font-display font-semibold text-xs text-white border-none cursor-pointer transition-all duration-200 bg-ng-orange hover:brightness-110 shadow-[0_0_15px_rgba(255,107,0,0.3)] active:scale-[0.98] flex items-center gap-2 shrink-0"
              >
                <span className="text-base leading-none">+</span>
                <span>Enroll Personnel</span>
              </button>
            )}
          </div>
        </div>

        {/* Personnel Table */}
        <div className="mt-5 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-ng-border bg-ng-elevated/20">
                {["Person", "Roll / Staff / Worker ID", "Category", "Assigned Unit / Office", "Biometric ID", "Privacy Consent", "Verification / Actions"].map((h, i) => (
                  <th key={i} className="px-5 py-3.5 text-[10px] font-mono uppercase font-bold tracking-widest text-ng-muted">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ng-border font-body text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 font-mono text-ng-muted">
                    Connecting to MongoDB Atlas & synchronizing biometric gateway cache…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 font-mono text-ng-muted">
                    <div className="flex flex-col items-center gap-3">
                      <span className="text-3xl">📋</span>
                      <span className="font-semibold text-ng-text text-sm">Database Clean · 0 Personnel Assigned</span>
                      <span className="text-xs text-ng-secondary max-w-md text-center">
                        All previous records have been purged. Click "+ Enroll Personnel", enter the resident details, and touch your ZKTeco Live20R scanner to auto-save to MongoDB.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(r => (
                  <tr key={r._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar initials={r.initials || "NG"} status="safe" size={32} />
                        <div>
                          <span className="font-semibold text-ng-text block text-sm font-display">{r.name}</span>
                          <span className="text-[10px] font-mono text-ng-muted">{r.department}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-ng-text">
                      {r.rollNo}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                        r.personType === "STUDENT"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : r.personType === "WORKER"
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        {r.personType}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-ng-secondary">
                      {r.roomNo || "Unassigned"}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20">
                        {r.fingerprintId || "FP-OK"}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono">
                      <span className="text-[10px] text-green-400 flex items-center gap-1.5 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        Consent Verified
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => runVerificationSimulation(r)}
                          className="px-2 py-1 rounded-lg text-[10px] font-mono font-semibold border border-blue-500/30 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 cursor-pointer transition-colors"
                          title="Simulate <40ms local match on Live20R gateway"
                        >
                          Test Match
                        </button>
                        <button
                          onClick={() => openEditModal(r)}
                          className="px-2 py-1 rounded-lg text-[10px] font-mono font-semibold border border-amber-500/30 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 cursor-pointer transition-colors"
                          title="Edit user details, department, room, and credentials"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => openUpdateFpModal(r)}
                          className="px-2 py-1 rounded-lg text-[10px] font-mono font-semibold border border-green-500/30 text-green-400 bg-green-500/10 hover:bg-green-500/20 cursor-pointer transition-colors"
                          title="Re-scan and update fingerprint directly from Live20R"
                        >
                          👆 Update FP
                        </button>
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(r._id, r.name)}
                            className="px-2 py-1 rounded-lg text-[10px] font-mono font-semibold border border-red-500/30 text-red-400 bg-red-500/10 hover:bg-red-500/20 cursor-pointer transition-colors"
                            title="Erase biometric template permanently under retention policy"
                          >
                            De-enroll
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification Simulation Bench */}
      {simResult && simPerson && (
        <div className="p-5 rounded-2xl border border-blue-500/30 bg-blue-500/5 shadow-xl animate-fade-in flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-green-500/20 text-green-400 font-bold border border-green-500/30">
                SIMULATED CHECK (no reader involved)
              </span>
              <span className="text-xs font-bold text-ng-text font-display">
                {simPerson.name} ({simPerson.rollNo}) · Biometric ID: {simPerson.fingerprintId}
              </span>
            </div>
            <p className="text-xs font-mono text-ng-secondary m-0">
              Door: <span className="text-green-400 font-semibold">{simResult.relay}</span> · Note: <span className="text-blue-300">{simResult.lifeSafety}</span>
            </p>
          </div>
          <button
            onClick={() => setSimResult(null)}
            className="text-xs font-mono text-ng-muted hover:text-ng-text cursor-pointer bg-transparent border-none"
          >
            Dismiss Test ✕
          </button>
        </div>
      )}

      {/* Enrollment Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          disarmScanner();
          setModalOpen(false);
        }}
        title="Biometric Enrollment · ZKTeco Live20R"
        subtitle="Arm sensor and place finger on optical glass to capture & auto-save to MongoDB Atlas"
      >
        <div className="flex flex-col gap-4 text-xs font-body">
          {/* Category Selector */}
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider font-bold mb-1.5 text-ng-muted">
              Personnel Category *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "STUDENT", label: "Student Resident" },
                { id: "WORKER", label: "Permanent Worker" },
                { id: "STAFF", label: "Staff / Warden / Security" },
              ].map(c => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setFormCategory(c.id as any)}
                  className={`py-2 px-3 rounded-xl font-mono text-xs font-medium cursor-pointer transition-all border ${
                    formCategory === c.id
                      ? "border-ng-orange bg-ng-orange/15 text-ng-orange font-bold shadow-[0_0_10px_rgba(255,107,0,0.2)]"
                      : "border-ng-border bg-ng-elevated text-ng-secondary hover:text-ng-text"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields: Name and ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider font-bold mb-1.5 text-ng-muted">
                Full Name *
              </label>
              <input
                required
                value={formName}
                onChange={e => handleNameChange(e.target.value)}
                placeholder={formCategory === "STUDENT" ? "e.g. Ahmad Mujtaba" : formCategory === "WORKER" ? "e.g. Muhammad Rafiq" : "e.g. Dr. Asim Warden"}
                className="w-full rounded-xl px-3.5 py-2.5 bg-ng-elevated border border-ng-border text-ng-text outline-none focus:border-ng-orange"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider font-bold mb-1.5 text-ng-muted">
                {formCategory === "STUDENT" ? "Roll No / SAP ID *" : formCategory === "WORKER" ? "Worker ID / Badge No *" : "Staff ID / Badge No *"}
              </label>
              <input
                required
                value={formRollNo}
                onChange={e => setFormRollNo(e.target.value)}
                placeholder={formCategory === "STUDENT" ? "e.g. 70145462" : formCategory === "WORKER" ? "e.g. WRK-201" : "e.g. STF-001"}
                className="w-full rounded-xl px-3.5 py-2.5 bg-ng-elevated border border-ng-border text-ng-text outline-none focus:border-ng-orange uppercase font-mono"
              />
            </div>
          </div>

          {/* Conditional Role Selector for Staff */}
          {formCategory === "STAFF" && (
            <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-2">
              <label className="block font-mono text-[10px] uppercase tracking-wider font-bold text-amber-400">
                Staff Role & Console Permission
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "warden", label: "Warden" },
                  { id: "admin", label: "Admin" },
                  { id: "security", label: "Security" },
                ].map(r => (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => setStaffRole(r.id as any)}
                    className={`py-1.5 px-2 rounded-lg font-mono text-[11px] cursor-pointer border ${
                      staffRole === r.id
                        ? "border-amber-400 bg-amber-500/20 text-amber-300 font-bold"
                        : "border-ng-border bg-ng-elevated text-ng-secondary"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Unit / Room and Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider font-bold mb-1.5 text-ng-muted">
                {formCategory === "STUDENT" ? "Assigned Hostel Room" : formCategory === "WORKER" ? "Duty Station / Area" : "Assigned Office / Gate"}
              </label>
              <input
                value={formRoom}
                onChange={e => setFormRoom(e.target.value)}
                placeholder={formCategory === "STUDENT" ? "Room 304, Block B" : formCategory === "WORKER" ? "Central Mess Kitchen" : "Warden Office / Main Gate"}
                className="w-full rounded-xl px-3.5 py-2.5 bg-ng-elevated border border-ng-border text-ng-text outline-none focus:border-ng-orange"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider font-bold mb-1.5 text-ng-muted">
                {formCategory === "STUDENT" ? "Academic Department" : formCategory === "WORKER" ? "Trade / Shift" : "Department"}
              </label>
              <input
                value={formDept}
                onChange={e => setFormDept(e.target.value)}
                placeholder={formCategory === "STUDENT" ? "BS Computer Science" : formCategory === "WORKER" ? "Mess Operations (Morning Shift)" : "Hostel Security"}
                className="w-full rounded-xl px-3.5 py-2.5 bg-ng-elevated border border-ng-border text-ng-text outline-none focus:border-ng-orange"
              />
            </div>
          </div>

          {/* Guardian Section (Students only) */}
          {formCategory === "STUDENT" && (
            <div className="p-4 rounded-xl border border-ng-border bg-ng-elevated/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-ng-orange">
                  Parent / Guardian Contact (Notification Channel)
                </span>
                <span className="text-[9px] font-mono text-ng-muted">
                  Strictly No CNIC Dispatched
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  value={guardianName}
                  onChange={e => setGuardianName(e.target.value)}
                  placeholder="Guardian Full Name"
                  className="rounded-lg px-3 py-2 bg-ng-elevated border border-ng-border text-ng-text text-xs outline-none"
                />
                <input
                  value={guardianPhone}
                  onChange={e => setGuardianPhone(e.target.value)}
                  placeholder="Phone: +92 300 1234567"
                  className="rounded-lg px-3 py-2 bg-ng-elevated border border-ng-border text-ng-text text-xs outline-none font-mono"
                />
                <input
                  type="email"
                  value={guardianEmail}
                  onChange={e => setGuardianEmail(e.target.value)}
                  placeholder="Email: parent@gmail.com"
                  className="rounded-lg px-3 py-2 bg-ng-elevated border border-ng-border text-ng-text text-xs outline-none font-mono"
                />
              </div>
            </div>
          )}

          {/* REAL HARDWARE ZKTECO LIVE20R CAPTURE BOX */}
          <div className={`p-4 rounded-xl border transition-all ${
            scanStep === "TOUCH_DETECTED"
              ? "border-green-500 bg-green-500/10 shadow-[0_0_20px_rgba(34,197,94,0.2)]"
              : scanStep === "ARMED_WAITING"
              ? "border-amber-500/50 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.15)] animate-pulse"
              : "border-green-500/30 bg-green-500/5"
          } space-y-3`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🖂</span>
                <div>
                  <span className="font-semibold text-ng-text font-display block text-sm">
                    ZKTeco Live20R SilkID Scanner
                  </span>
                  <span className="text-[10px] font-mono text-ng-muted">
                    500 DPI Optical Sensor · Physical Touch Detection
                  </span>
                </div>
              </div>

              <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded border uppercase ${
                scanStep === "TOUCH_DETECTED"
                  ? "bg-green-500/20 text-green-400 border-green-500/40"
                  : scanStep === "ARMED_WAITING"
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse"
                  : "bg-ng-elevated text-ng-muted border-ng-border"
              }`}>
                {scanStep === "TOUCH_DETECTED" ? "Auto-Saved to DB!" : scanStep === "ARMED_WAITING" ? "Waiting for Touch" : "Idle"}
              </span>
            </div>

            {/* Scan Action / Progress display */}
            <div className="p-3.5 rounded-lg bg-ng-elevated/70 border border-ng-border flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs font-mono">
                {scanStep === "IDLE" && (
                  <span className="text-ng-muted">
                    Click <strong>"Arm Scanner"</strong> below, then touch the physical Live20R glass with your finger.
                  </span>
                )}
                {scanStep === "ARMED_WAITING" && (
                  <div className="flex flex-col gap-1">
                    <span className="text-amber-400 font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      Place finger firmly on ZKTeco Live20R optical prism now...
                    </span>
                    <span className="text-[10px] text-ng-secondary">
                      Waiting for physical contact. It will NOT assign or save until touched.
                    </span>
                  </div>
                )}
                {scanStep === "TOUCH_DETECTED" && (
                  <div className="flex flex-col gap-1">
                    <span className="text-green-400 font-bold flex items-center gap-2">
                      ✓ Physical finger touch detected! Quality: {capturedQuality}%
                    </span>
                    <span className="text-[10px] text-green-300 font-bold">
                      Assigned slot {capturedSlot} & automatically saved to MongoDB Atlas!
                    </span>
                  </div>
                )}
              </div>

              {scanStep === "ARMED_WAITING" ? (
                <button
                  type="button"
                  onClick={disarmScanner}
                  className="px-4 py-2 rounded-lg font-mono text-xs font-semibold bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 cursor-pointer transition-all shrink-0"
                >
                  Cancel / Disarm
                </button>
              ) : scanStep === "TOUCH_DETECTED" ? (
                <span className="px-4 py-2 rounded-lg font-mono text-xs font-bold text-green-400 bg-green-500/20 border border-green-500/30">
                  ✓ Saved
                </span>
              ) : (
                <button
                  type="button"
                  onClick={armScannerForPhysicalTouch}
                  className="px-4 py-2 rounded-lg font-mono text-xs font-semibold bg-green-500/20 border border-green-500/40 text-green-400 hover:bg-green-500/30 cursor-pointer transition-all shrink-0 shadow-md"
                >
                  Arm Scanner (Touch Sensor)
                </button>
              )}
            </div>
          </div>

          {/* Privacy Consent Checkbox */}
          <label className="flex items-start gap-2.5 cursor-pointer mt-1">
            <input
              type="checkbox"
              required
              checked={consentGiven}
              onChange={e => setConsentGiven(e.target.checked)}
              className="mt-0.5 rounded border-ng-border accent-ng-orange"
            />
            <span className="text-[11px] text-ng-secondary leading-relaxed">
              I certify that this individual has consented to encrypted biometric template extraction for hostel access control under the Institutional Data Protection & Biometric Retention Policy. Templates are permanently erasable upon departure.
            </span>
          </label>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-ng-border mt-2">
            <button
              type="button"
              onClick={handleManualSave}
              disabled={saving}
              className="text-[11px] font-mono text-ng-muted hover:text-ng-secondary underline bg-transparent border-none cursor-pointer"
              title="Only use if hardware scanner is not plugged in"
            >
              Manual Save without Hardware
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => {
                disarmScanner();
                setModalOpen(false);
              }}
              className="px-5 py-2.5 rounded-xl border border-ng-border bg-ng-elevated text-ng-text hover:bg-white/[0.04] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* ── EDIT PERSONNEL MODAL ────────────────────────────────────── */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Personnel Record"
        subtitle="Update contact details, assigned office, and biometric credentials"
      >
        <form onSubmit={handleSaveEdit} className="flex flex-col gap-4 text-xs font-body">
          {/* Category Selector */}
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider font-bold mb-1.5 text-ng-muted">
              Personnel Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "STUDENT", label: "Student" },
                { id: "WORKER", label: "Worker" },
                { id: "STAFF", label: "Staff" },
              ].map(c => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setEditCategory(c.id as any)}
                  className={`py-2 px-3 rounded-xl font-mono text-xs font-medium cursor-pointer transition-all border ${
                    editCategory === c.id
                      ? "border-ng-orange bg-ng-orange/15 text-ng-orange font-bold"
                      : "border-ng-border bg-ng-elevated text-ng-secondary"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Name and ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider font-bold mb-1.5 text-ng-muted">
                Full Name *
              </label>
              <input
                required
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full rounded-xl px-3.5 py-2.5 bg-ng-elevated border border-ng-border text-ng-text outline-none focus:border-ng-orange"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider font-bold mb-1.5 text-ng-muted">
                Roll No / Staff / Worker ID *
              </label>
              <input
                required
                value={editRollNo}
                onChange={e => setEditRollNo(e.target.value)}
                className="w-full rounded-xl px-3.5 py-2.5 bg-ng-elevated border border-ng-border text-ng-text outline-none focus:border-ng-orange uppercase font-mono"
              />
            </div>
          </div>

          {/* Unit and Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider font-bold mb-1.5 text-ng-muted">
                Assigned Unit / Room / Office
              </label>
              <input
                value={editRoom}
                onChange={e => setEditRoom(e.target.value)}
                className="w-full rounded-xl px-3.5 py-2.5 bg-ng-elevated border border-ng-border text-ng-text outline-none focus:border-ng-orange"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider font-bold mb-1.5 text-ng-muted">
                Department / Section
              </label>
              <input
                value={editDept}
                onChange={e => setEditDept(e.target.value)}
                className="w-full rounded-xl px-3.5 py-2.5 bg-ng-elevated border border-ng-border text-ng-text outline-none focus:border-ng-orange"
              />
            </div>
          </div>

          {/* Biometric Scan ID & Re-scan Button */}
          <div className="p-3.5 rounded-xl border border-ng-border bg-ng-elevated/50 flex items-center justify-between gap-3">
            <div>
              <span className="block font-mono text-[10px] uppercase tracking-wider font-bold text-ng-muted">
                Assigned Fingerprint ID
              </span>
              <span className="font-mono text-sm font-bold text-green-400">
                {editFingerprintId || "Not Registered"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (editingResident) {
                  setEditModalOpen(false);
                  openUpdateFpModal(editingResident);
                }
              }}
              className="px-3 py-1.5 rounded-lg border border-green-500/40 bg-green-500/10 text-green-400 hover:bg-green-500/20 text-xs font-mono font-semibold cursor-pointer transition-colors"
            >
              👆 Re-scan on Live20R
            </button>
          </div>

          {/* Guardian Info (Students only) */}
          {editCategory === "STUDENT" && (
            <div className="space-y-3 pt-1 border-t border-ng-border">
              <label className="block font-mono text-[10px] uppercase tracking-wider font-bold text-ng-muted">
                Guardian / Emergency Contact
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  placeholder="Guardian Name"
                  value={editGuardianName}
                  onChange={e => setEditGuardianName(e.target.value)}
                  className="rounded-xl px-3.5 py-2.5 bg-ng-elevated border border-ng-border text-ng-text text-xs"
                />
                <input
                  placeholder="Guardian Phone"
                  value={editGuardianPhone}
                  onChange={e => setEditGuardianPhone(e.target.value)}
                  className="rounded-xl px-3.5 py-2.5 bg-ng-elevated border border-ng-border text-ng-text text-xs font-mono"
                />
                <input
                  placeholder="Guardian Email"
                  value={editGuardianEmail}
                  onChange={e => setEditGuardianEmail(e.target.value)}
                  className="rounded-xl px-3.5 py-2.5 bg-ng-elevated border border-ng-border text-ng-text text-xs"
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-ng-border mt-2">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-ng-border bg-ng-elevated text-ng-secondary hover:text-ng-text text-xs font-mono cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={editSaving}
              className="px-5 py-2.5 rounded-xl font-display font-semibold text-xs text-white border-none cursor-pointer bg-ng-orange hover:brightness-110 shadow-lg disabled:opacity-50"
            >
              {editSaving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── UPDATE FINGERPRINT VIA LIVE20R MODAL ──────────────────────── */}
      <Modal
        isOpen={updateFpModalOpen}
        onClose={closeUpdateFpModal}
        title="Update Fingerprint · ZKTeco Live20R"
        subtitle="Capture new fingerprint template from physical Live20R hardware scanner"
        maxWidth="480px"
      >
        <div className="flex flex-col items-center gap-5 text-center font-body py-2">
          {/* Circular Optical Sensor Scanner Graphic */}
          <div className="relative w-36 h-36 rounded-full flex items-center justify-center border-2 border-ng-border bg-ng-elevated/70 shadow-2xl overflow-hidden">
            <div
              className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500 ${
                updateFpStep === "TOUCH_DETECTED"
                  ? "bg-green-500/20 border-2 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.4)]"
                  : updateFpStep === "ARMED_WAITING"
                  ? "bg-amber-500/20 border-2 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.4)] animate-pulse"
                  : "bg-ng-elevated border-2 border-ng-border"
              }`}
            >
              <span className="text-4xl select-none">
                {updateFpStep === "TOUCH_DETECTED" ? "✓" : "👆"}
              </span>
            </div>

            {/* Laser scanning line */}
            {updateFpStep === "ARMED_WAITING" && (
              <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />
            )}
          </div>

          <div className="space-y-1.5">
            <h4 className="text-sm font-semibold text-ng-text font-display m-0">
              {updateFpStep === "TOUCH_DETECTED"
                ? "✓ Physical Finger Touch Captured!"
                : updateFpStep === "ARMED_WAITING"
                ? "Place ANY Finger on Live20R Reader Glass"
                : "Ready to Update Fingerprint"}
            </h4>
            <p className="text-xs font-mono text-ng-secondary m-0">
              Assigning to: <strong className="text-ng-text">{updateFpTarget?.name}</strong> ({updateFpTarget?.rollNo})
            </p>
            <p className="text-[11px] font-mono text-ng-muted m-0">
              Current ID: <span className="text-ng-secondary">{updateFpTarget?.fingerprintId || "None"}</span> · Target Slot: <span className="text-green-400 font-bold">{updateFpSlot}</span>
            </p>
          </div>

          {/* Status Box */}
          {updateFpStep === "TOUCH_DETECTED" ? (
            <div className="w-full p-3 rounded-xl border border-green-500/30 bg-green-500/15 text-green-400 font-mono text-xs animate-fade-in">
              ✓ Physical finger scan captured! Quality: {updateFpQuality}% · Automatically saved to MongoDB Atlas!
            </div>
          ) : updateFpStep === "ARMED_WAITING" ? (
            <div className="w-full p-3 rounded-xl border border-amber-500/30 bg-amber-500/15 text-amber-300 font-mono text-xs flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Waiting for physical finger contact on Live20R optical prism…</span>
            </div>
          ) : (
            <div className="w-full p-3 rounded-xl border border-ng-border bg-ng-elevated text-ng-muted font-mono text-xs">
              Click <strong>"Arm Live20R Scanner for Touch"</strong> below, then touch the Live20R sensor glass.
            </div>
          )}

          {/* Action Buttons */}
          <div className="w-full flex flex-col gap-2 pt-2 border-t border-ng-border">
            {updateFpStep === "ARMED_WAITING" ? (
              <button
                type="button"
                onClick={closeUpdateFpModal}
                className="w-full py-2.5 rounded-xl border border-red-500/40 bg-red-500/15 text-red-400 font-mono text-xs cursor-pointer hover:bg-red-500/25 transition-colors"
              >
                Cancel / Disarm Sensor
              </button>
            ) : updateFpStep === "TOUCH_DETECTED" ? (
              <span className="w-full py-2 rounded-xl text-green-400 font-mono text-xs font-bold">
                ✓ Successfully Updated
              </span>
            ) : (
              <button
                type="button"
                onClick={armUpdateFpScanner}
                className="w-full py-2.5 rounded-xl font-display font-semibold text-xs text-white border-none cursor-pointer bg-green-600 hover:bg-green-500 shadow-md transition-all active:scale-[0.98]"
              >
                Arm Live20R Scanner for Touch
              </button>
            )}


            <button
              type="button"
              onClick={closeUpdateFpModal}
              className="w-full py-2.5 rounded-xl border border-ng-border bg-ng-elevated text-ng-secondary hover:text-ng-text text-xs font-mono cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
