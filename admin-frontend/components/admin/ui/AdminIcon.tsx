import type React from "react";
import type { AdminIconName } from "@/config/navigation";

type AdminIconProps = {
  name: AdminIconName;
  className?: string;
};

export function AdminIcon({ name, className = "h-5 w-5" }: AdminIconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {iconPaths[name]}
    </svg>
  );
}

const iconPaths: Record<AdminIconName, React.ReactNode> = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="8" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="15" width="7" height="6" rx="1.5" />
    </>
  ),
  catalog: (
    <>
      <path d="M4 5h16" />
      <path d="M4 12h16" />
      <path d="M4 19h16" />
      <path d="M7 5v14" />
    </>
  ),
  products: (
    <>
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="M4.5 8 12 12.25 19.5 8" />
      <path d="M12 21v-8.75" />
    </>
  ),
  categories: (
    <>
      <rect x="3" y="4" width="7" height="7" rx="1.5" />
      <rect x="14" y="4" width="7" height="7" rx="1.5" />
      <rect x="3" y="15" width="7" height="5" rx="1.5" />
      <rect x="14" y="15" width="7" height="5" rx="1.5" />
    </>
  ),
  subcategories: (
    <>
      <path d="M5 5h5v5H5z" />
      <path d="M14 4h5" />
      <path d="M14 8h7" />
      <path d="M5 15h5v5H5z" />
      <path d="M14 15h5" />
      <path d="M14 19h7" />
    </>
  ),
  projects: (
    <>
      <path d="M4 6h16" />
      <path d="M6 6v14" />
      <path d="M18 6v14" />
      <path d="M8 20h8" />
      <path d="m10 10 4 2-4 2v-4Z" />
    </>
  ),
  orders: (
    <>
      <path d="M7 4h10l2 17H5L7 4Z" />
      <path d="M9 8a3 3 0 0 0 6 0" />
    </>
  ),
  coupons: (
    <>
      <path d="M20 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" />
      <path d="M4 8h10" />
      <path d="M4 12h10" />
      <path d="M4 16h14" />
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M20 8v.01" />
    </>
  ),
  careers: (
    <>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </>
  ),
  media: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8" cy="10" r="1.5" />
      <path d="m21 16-5.5-5.5L7 19" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3" />
      <path d="M12 19v3" />
      <path d="M2 12h3" />
      <path d="M19 12h3" />
      <path d="m4.9 4.9 2.1 2.1" />
      <path d="m17 17 2.1 2.1" />
      <path d="m19.1 4.9-2.1 2.1" />
      <path d="m7 17-2.1 2.1" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </>
  ),
  close: (
    <>
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </>
  ),
  collapse: (
    <>
      <path d="m15 6-6 6 6 6" />
      <path d="M20 12H9" />
    </>
  ),
  expand: (
    <>
      <path d="m9 6 6 6-6 6" />
      <path d="M4 12h11" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 6v5h-5" />
      <path d="M4 18v-5h5" />
      <path d="M18 9a7 7 0 0 0-11.8-2.8L4 8" />
      <path d="M6 15a7 7 0 0 0 11.8 2.8L20 16" />
    </>
  ),
  storefront: (
    <>
      <path d="M4 10h16l-1.5-5h-13L4 10Z" />
      <path d="M6 10v10h12V10" />
      <path d="M9 20v-5h6v5" />
    </>
  ),
  logout: (
    <>
      <path d="M10 5H5v14h5" />
      <path d="M14 8l4 4-4 4" />
      <path d="M18 12H9" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M5 20h14" />
    </>
  ),
  activity: (
    <>
      <path d="M4 12h4l2-6 4 12 2-6h4" />
    </>
  ),
  stock: (
    <>
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M8 16V9" />
      <path d="M12 16V6" />
      <path d="M16 16v-4" />
    </>
  ),
  currency: (
    <>
      <path d="M6 5h9a4 4 0 0 1 0 8H9l7 6" />
      <path d="M6 9h12" />
      <path d="M6 13h8" />
    </>
  ),
  bestSeller: (
    <>
      <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />
    </>
  ),
  warning: (
    <>
      <path d="M12 3 2.8 20h18.4L12 3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </>
  ),
};
