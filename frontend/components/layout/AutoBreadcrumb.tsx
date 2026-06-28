'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

// Human-readable labels for known path segments
const SEGMENT_LABELS: Record<string, string> = {
  components:        'Components',
  categories:        'Categories',
  projects:          'Projects',
  cart:              'Cart',
  checkout:          'Checkout',
  payment:           'Payment',
  success:           'Order Confirmed',
  orders:            'Orders',
  profile:           'Profile',
  settings:          'Settings',
  wishlist:          'Wishlist',
  about:             'About',
  contact:           'Contact',
  faq:               'FAQ',
  help:              'Help Center',
  privacy:           'Privacy Policy',
  terms:             'Terms of Service',
  shipping:          'Shipping Policy',
  returns:           'Returns',
  'refund-policy':   'Refund Policy',
  'robomaniac-store':'STEM Store',
  'stem-store':      'STEM Store',
};

// Context-aware labels when the segment is a DB id
const ID_PARENT_LABELS: Record<string, string> = {
  projects:   'Project',
  components: 'Component',
  orders:     'Order',
  payment:    'Payment',
};

// Pages that should not show the global breadcrumb
const HIDDEN_PATHS = new Set(['/', '/login', '/register', '/callback']);

function looksLikeId(segment: string): boolean {
  // UUID  (36 chars with dashes)
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) return true;
  // MongoDB ObjectId (24 hex chars)
  if (/^[0-9a-f]{24}$/i.test(segment)) return true;
  // Any 20+ char hex-only string
  if (/^[0-9a-f]{20,}$/i.test(segment)) return true;
  return false;
}

function segmentLabel(segment: string, parentSegment?: string): string {
  if (looksLikeId(segment)) {
    return parentSegment ? (ID_PARENT_LABELS[parentSegment] ?? 'Details') : 'Details';
  }
  if (SEGMENT_LABELS[segment]) return SEGMENT_LABELS[segment];
  // Prettify slug: "my-page-name" → "My Page Name"
  return segment
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function AutoBreadcrumb() {
  const pathname = usePathname();

  if (HIDDEN_PATHS.has(pathname)) return null;

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return null;

  const crumbs = segments.map((seg, i) => ({
    href: '/' + segments.slice(0, i + 1).join('/'),
    label: segmentLabel(seg, segments[i - 1]),
    isLast: i === segments.length - 1,
  }));

  return (
    <div className="bg-[#f2f2f0] border-b border-[#E8E8DC] px-6 py-2">
      <div className="max-w-[1500px] mx-auto">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs font-medium text-gray-500 flex-wrap">
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-[#222222] transition-colors shrink-0"
            aria-label="Home"
          >
            <Home className="w-3 h-3" />
            <span>Home</span>
          </Link>

          {crumbs.map(({ href, label, isLast }) => (
            <span key={href} className="flex items-center gap-1 min-w-0">
              <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
              {isLast ? (
                <span
                  className="text-[#222222] font-semibold truncate max-w-[220px]"
                  aria-current="page"
                >
                  {label}
                </span>
              ) : (
                <Link
                  href={href}
                  className="hover:text-[#222222] transition-colors truncate max-w-[220px]"
                >
                  {label}
                </Link>
              )}
            </span>
          ))}
        </nav>
      </div>
    </div>
  );
}
