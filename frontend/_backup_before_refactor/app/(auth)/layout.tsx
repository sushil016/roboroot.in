import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — RoboRoot",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 overflow-y-auto"
      style={{ background: "#F2F2F0" }}
    >
      {/* Subtle grid background */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(var(--brand-primary) 1px, transparent 1px), linear-gradient(to right, var(--brand-primary) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
