import React, { useEffect } from "react";
import { C, F } from "../../lib/constants";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "520px",
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(10, 8, 18, 0.72)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full rounded-2xl border flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={{
          maxWidth,
          background: C.panel,
          borderColor: C.border,
          boxShadow: C.shadowLg,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: C.border }}
        >
          <div>
            <h3
              className="text-base font-semibold m-0"
              style={{ fontFamily: F.heading, color: C.text }}
            >
              {title}
            </h3>
            {subtitle && (
              <p
                className="text-xs m-0 mt-0.5"
                style={{ fontFamily: F.mono, color: C.muted }}
              >
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm border transition-colors cursor-pointer"
            style={{
              borderColor: C.border,
              background: C.elevated,
              color: C.secondary,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = C.text)}
            onMouseLeave={e => (e.currentTarget.style.color = C.secondary)}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[80vh]">{children}</div>
      </div>
    </div>
  );
}
