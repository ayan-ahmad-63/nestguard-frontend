// Neutral tokens are CSS variables so the light/dark toggle can re-theme the
// whole app (see :root and .light in index.css). Semantic colors stay as hex —
// they read the same in both themes and are used in `+ "22"` alpha concatenation.
export const C = {
  bg: "var(--ng-bg)",
  panel: "var(--ng-panel)",
  elevated: "var(--ng-elevated)",
  border: "var(--ng-border)",
  hairline: "var(--ng-hairline)",
  text: "var(--ng-text)",
  secondary: "var(--ng-secondary)",
  muted: "var(--ng-muted)",
  orange: "#FF6B00",
  orangeDeep: "#E65A00",
  blue: "#4C37D4",
  green: "#3FD068",
  amber: "#E0A72E",
  red: "#FF5A50",
  // elevation & light
  shadow: "var(--ng-shadow)",
  shadowLg: "var(--ng-shadow-lg)",
  frameShadow: "var(--ng-frame-shadow)",
  backdrop: "var(--ng-backdrop)",
  glassPanel: "var(--ng-glass)",
} as const;

export const F = {
  heading: "'Onest', sans-serif",
  body: "'Onest', sans-serif",
  mono: "'Space Mono', monospace",
} as const;
