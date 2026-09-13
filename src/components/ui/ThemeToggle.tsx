import { useEffect, useState } from "react";
import { C } from "../../lib/constants";

/** Sliding light/dark switch. Persists choice and toggles `.light` on <html>. */
export default function ThemeToggle() {
  const [dark, setDark] = useState(
    () => !document.documentElement.classList.contains("light"),
  );

  useEffect(() => {
    document.documentElement.classList.toggle("light", !dark);
    localStorage.setItem("ng-theme", dark ? "dark" : "light");
  }, [dark]);

  const W = 52;
  const KNOB = 22;
  const PAD = 3;

  return (
    <button
      onClick={() => setDark(d => !d)}
      role="switch"
      aria-checked={!dark}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      style={{
        position: "relative",
        width: W,
        height: 28,
        borderRadius: 999,
        border: `1px solid ${C.border}`,
        background: C.elevated,
        cursor: "pointer",
        padding: 0,
        flexShrink: 0,
        transition: "background 0.2s ease, border-color 0.2s ease",
      }}
    >
      {/* Track icons */}
      <span
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 8,
          display: "flex",
          alignItems: "center",
          fontSize: 11,
          color: dark ? C.muted : "transparent",
          transition: "color 0.2s",
        }}
      >
        ☾
      </span>
      <span
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          right: 8,
          display: "flex",
          alignItems: "center",
          fontSize: 11,
          color: dark ? "transparent" : C.amber,
          transition: "color 0.2s",
        }}
      >
        ☀
      </span>

      {/* Knob */}
      <span
        style={{
          position: "absolute",
          top: PAD,
          left: dark ? PAD : W - KNOB - PAD,
          width: KNOB,
          height: KNOB,
          borderRadius: "50%",
          background: `linear-gradient(145deg, ${C.orange}, ${C.orangeDeep})`,
          boxShadow: `0 1px 4px rgba(0,0,0,0.4), 0 0 8px -2px ${C.orange}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10,
          color: "#fff",
          transition: "left 0.2s cubic-bezier(0.4,0.2,0.2,1)",
        }}
      >
        {dark ? "☾" : "☀"}
      </span>
    </button>
  );
}
