
import type { LucideIcon } from "lucide-react";

type AdminStatCardProps = {
  title: string;
  value: number | string;
  description: string;
  icon: LucideIcon;
  accent: "blue" | "green" | "amber" | "purple";
  loading?: boolean;
};

const accentStyles = {
  blue: "bg-blue-500/10 text-blue-400",
  green: "bg-emerald-500/10 text-emerald-400",
  amber: "bg-amber-500/10 text-amber-400",
  purple: "bg-purple-500/10 text-purple-400",
};

export default function AdminStatCard({
  title,
  value,
  description,
  icon: Icon,
  accent,
  loading = false,
}: AdminStatCardProps) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-[#101f33] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-400">
            {title}
          </p>
          {loading ? (
            <div className="mt-3 h-9 w-20 animate-pulse rounded bg-slate-700" />
          ) : (
            <p className="mt-3 text-3xl font-bold tracking-tight text-white">
              {value}
            </p>
          )}
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${accentStyles[accent]}`}
        >
          <Icon size={21} />
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        {description}
      </p>
    </article>
  );
}
 