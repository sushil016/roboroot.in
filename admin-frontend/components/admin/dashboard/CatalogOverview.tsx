import { catalogOverviewItems } from "@/config/dashboard";
import { AdminIcon } from "@/components/admin/ui/AdminIcon";

export type CatalogOverviewValues = Record<(typeof catalogOverviewItems)[number]["id"], number>;

export function CatalogOverview({ values }: { values: CatalogOverviewValues }) {
  const maxValue = Math.max(...catalogOverviewItems.map((item) => values[item.id]), 1);

  return (
    <section className="admin-panel">
      <div className="admin-panel-heading">
        <p className="admin-eyebrow">Catalog Overview</p>
        <h3>Store structure</h3>
      </div>
      <div className="mt-5 space-y-4">
        {catalogOverviewItems.map((item) => {
          const value = values[item.id];
          const width = Math.max(8, Math.round((value / maxValue) * 100));

          return (
            <div key={item.id}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm font-bold text-[#222222]">
                  <AdminIcon name={item.icon} className="h-4 w-4" />
                  {item.label}
                </span>
                <span className="text-sm font-extrabold text-[#222222]">{value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#F2F2F0]">
                <div className="h-full rounded-full bg-[#222222]" style={{ width: `${width}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
