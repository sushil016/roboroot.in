import type { AdminIconName } from "@/config/navigation";
import { AdminIcon } from "@/components/admin/ui/AdminIcon";

export function StatsCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: AdminIconName;
  label: string;
  value: number | string;
  detail: string;
}) {
  return (
    <article className="group rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-bold text-zinc-500">{label}</p>
        <span className="grid size-10 place-items-center rounded-lg bg-[#F2F2F0] text-[#222222]">
          <AdminIcon name={icon} className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-5 text-3xl font-bold text-[#222222]">{value}</p>
      <p className="mt-1 text-sm font-semibold text-zinc-500">{detail}</p>
    </article>
  );
}
