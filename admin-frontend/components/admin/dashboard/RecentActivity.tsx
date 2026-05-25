import { recentActivityItems } from "@/config/dashboard";
import { AdminIcon } from "@/components/admin/ui/AdminIcon";

export function RecentActivity({ status }: { status: string }) {
  return (
    <section className="admin-panel">
      <div className="admin-panel-heading">
        <p className="admin-eyebrow">Recent Activity</p>
        <h3>Workspace updates</h3>
      </div>
      <div className="mt-5 divide-y divide-zinc-100">
        {recentActivityItems.map((item, index) => (
          <div key={item} className="flex items-center gap-3 py-3">
            <span className="grid size-9 place-items-center rounded-lg bg-[#F2F2F0] text-[#222222]">
              <AdminIcon name="activity" className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[#222222]">{item}</p>
              <p className="text-xs font-semibold text-zinc-500">{index === 0 ? status : "Synced with current dashboard data"}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
