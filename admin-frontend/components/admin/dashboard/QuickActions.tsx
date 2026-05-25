import { quickActionItems } from "@/config/dashboard";
import type { DashboardActionId } from "@/config/dashboard";
import { AdminIcon } from "@/components/admin/ui/AdminIcon";

export function QuickActions({ onAction }: { onAction: (id: DashboardActionId) => void }) {
  return (
    <section className="admin-panel">
      <div className="admin-panel-heading">
        <p className="admin-eyebrow">Quick Actions</p>
        <h3>Common admin tasks</h3>
      </div>
      <div className="mt-5 grid gap-3">
        {quickActionItems.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => onAction(action.id)}
            className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition ${
              action.primary
                ? "border-[#222222] bg-[#222222] text-white hover:bg-zinc-800"
                : "border-zinc-200 bg-white text-[#222222] hover:border-zinc-300 hover:bg-[#F2F2F0]"
            }`}
          >
            <span className={`grid size-10 place-items-center rounded-lg ${action.primary ? "bg-white/10" : "bg-[#F2F2F0]"}`}>
              <AdminIcon name={action.icon} className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-extrabold">{action.label}</span>
              <span className={`block text-xs font-semibold ${action.primary ? "text-zinc-300" : "text-zinc-500"}`}>
                {action.description}
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
