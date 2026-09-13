# NestGuard — Smart Hostel Biometric Access Control

NestGuard is an AI-powered smart access control and hardware security management platform tailored for student hostels and campus residences.

## Architecture

```
nestguard-frontend/
├── docs/
│   ├── NEXTJS_GUIDE.md           # Guide for Next.js App Router / Pages migration
│   └── nestguard-ui-design.md     # Design token specification & UI prompt
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx        # Collapsible icon-rail navigation
│   │   │   └── TopBar.tsx         # Global search, alerts popover, theme toggle, admin menu
│   │   └── ui/
│   │       ├── Avatar.tsx         # Reusable initials avatar with status rings
│   │       ├── Icon3D.tsx         # Bespoke volumetric 3D security SVG icons
│   │       ├── Logo.tsx           # Responsive brand mark and horizontal lockup
│   │       ├── Modal.tsx          # Accessible backdrop modal dialogs
│   │       ├── StatusPill.tsx     # Pulsing hardware and security beacon indicators
│   │       └── ThemeToggle.tsx    # Smooth dark/light mode toggle
│   ├── lib/
│   │   ├── constants.ts           # Brand palette, typography tokens, elevation shadows
│   │   └── utils.ts               # Classnames helper, time formatting, CSV export
│   ├── pages/
│   │   ├── AccessLogs.tsx         # Full-audit access review table with CSV export
│   │   ├── Alerts.tsx             # Severity-ranked security incident feed with acknowledgment
│   │   ├── Analytics.tsx          # Multi-timeframe Recharts trend graph & behavioral risk
│   │   ├── Dashboard.tsx          # Operations console, live feed, gate filter, AI review
│   │   ├── DeviceHealth.tsx       # Hardware telemetry (battery, RSSI) & diagnostics
│   │   ├── Gates.tsx              # Gate controllers with emergency unlock & lockdown
│   │   ├── Landing.tsx            # Public marketing info landing page
│   │   ├── LiveCamera.tsx         # 6-grid CCTV surveillance with live clock & focus zoom
│   │   ├── Login.tsx              # Biometric & passcode security console authentication
│   │   └── Visitors.tsx           # Visitor queue with registration modal & check-in
│   ├── types/
│   │   └── index.ts               # Strict TypeScript definitions
│   ├── App.tsx                    # Root shell with global state & view router
│   ├── index.css                  # Tailwind CSS v4 entrypoint & theme variables
│   └── main.tsx                   # React 19 entrypoint
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Tech Stack
- **Framework**: React 19 + TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`) + CSS Custom Properties for dynamic theming
- **Icons**: Handcrafted Tabler outline SVGs + Bespoke 3D volumetric feature icons
- **Charts**: Recharts (`ResponsiveContainer`, `LineChart`)
- **Compatibility**: 100% portable to **Next.js App Router** (see [docs/NEXTJS_GUIDE.md](file:///d:/NestGuard/nestguard-frontend/docs/NEXTJS_GUIDE.md))
