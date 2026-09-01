'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/user.store';
import { useCartStore } from '@/store/cart.store';
import { useQuery } from '@tanstack/react-query';
import { componentApi } from '@/features/products/services/product.service';
import type { ComponentCategoryNode } from '@/types/marketplace.types';
import { UserMenu } from '@/components/layout/UserMenu';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Battery,
  BookOpen,
  Box,
  ChevronDown,
  CircuitBoard,
  Cpu,
  Gauge,
  Heart,
  Menu,
  PackageCheck,
  Radio,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  UserRound,
  Wifi,
  X,
  Zap,
  Info,
  Users,
  Layers,
  type LucideIcon,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ANNOUNCEMENTS = [
  { icon: '🚚', text: 'Free Shipping on orders above ₹999' },
  { icon: '💵', text: 'Cash on Delivery Available' },
  { icon: '🇮🇳', text: 'All Over India Supply' },
];

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/projects', label: 'Projects' },
  { href: '/stem-store', label: 'STEM Store' },
  { href: '/orders', label: 'My Orders' },
  { href: '/bulk-order', label: 'Bulk Order' },
  { href: '/about', label: 'About Us' },
  { href: '/careers', label: 'Careers' },
];

type CategoryBadge = 'Popular' | 'Trending' | 'New';

type HeaderCategoryCard = {
  name: string;
  href: string;
  count: number;
  description: string;
  icon: LucideIcon;
  badge?: CategoryBadge;
  accent: string;
  bg: string;
};

const headerCategoryCards: HeaderCategoryCard[] = [
  {
    name: 'Communication Modules',
    href: '/components?category=Communication%20Modules',
    count: 64,
    description: 'RF, GSM, Bluetooth, LoRa, and serial links',
    icon: Radio,
    badge: 'Popular',
    accent: 'text-cyan-700',
    bg: 'bg-cyan-50',
  },
  {
    name: 'Sensors',
    href: '/components?category=Sensors',
    count: 128,
    description: 'Distance, motion, light, pressure, and environment',
    icon: Gauge,
    badge: 'Trending',
    accent: 'text-sky-700',
    bg: 'bg-sky-50',
  },
  {
    name: 'Motors & Actuators',
    href: '/components?category=Motors%20%26%20Actuators',
    count: 76,
    description: 'Servo, stepper, DC motors, drivers, and motion parts',
    icon: Zap,
    accent: 'text-orange-700',
    bg: 'bg-orange-50',
  },
  {
    name: 'Development Boards',
    href: '/components?category=Development%20Boards',
    count: 42,
    description: 'Arduino, ESP32, Raspberry Pi, and controller boards',
    icon: Cpu,
    badge: 'New',
    accent: 'text-emerald-700',
    bg: 'bg-emerald-50',
  },
  {
    name: 'Power & Batteries',
    href: '/components?category=Power%20%26%20Batteries',
    count: 58,
    description: 'Cells, adapters, BMS, regulators, and charging gear',
    icon: Battery,
    accent: 'text-lime-700',
    bg: 'bg-lime-50',
  },
  {
    name: 'Semiconductors',
    href: '/components?category=Semiconductors',
    count: 112,
    description: 'ICs, MOSFETs, diodes, transistors, and passives',
    icon: CircuitBoard,
    accent: 'text-indigo-700',
    bg: 'bg-indigo-50',
  },
  {
    name: 'Wireless & IoT',
    href: '/components?category=Wireless%20%26%20IoT',
    count: 54,
    description: 'Connected modules for telemetry and smart devices',
    icon: Wifi,
    accent: 'text-teal-700',
    bg: 'bg-teal-50',
  },
  {
    name: 'Tools & Prototyping',
    href: '/components?category=Tools%20%26%20Prototyping',
    count: 31,
    description: 'Meters, soldering tools, breadboards, and fixtures',
    icon: Settings,
    accent: 'text-slate-700',
    bg: 'bg-slate-100',
  },
  {
    name: 'Connectors & Cables',
    href: '/components?category=Connectors%20%26%20Cables',
    count: 95,
    description: 'Headers, JST, jumper wires, ribbon cables, and plugs',
    icon: Layers,
    accent: 'text-amber-700',
    bg: 'bg-amber-50',
  },
  {
    name: 'Robotics Kits',
    href: '/projects?category=ROBOTICS',
    count: 38,
    description: 'Complete kits for bots, arms, rovers, and learning',
    icon: PackageCheck,
    accent: 'text-rose-700',
    bg: 'bg-rose-50',
  },
  {
    name: 'Drones & Aerospace',
    href: '/components?category=Drones%20%26%20Aerospace',
    count: 27,
    description: 'Flight controllers, props, frames, and payload builds',
    icon: Box,
    accent: 'text-violet-700',
    bg: 'bg-violet-50',
  },
  {
    name: 'Education Kits',
    href: '/stem-store',
    count: 44,
    description: 'Course kits, STEM bundles, books, and lab activities',
    icon: BookOpen,
    accent: 'text-fuchsia-700',
    bg: 'bg-fuchsia-50',
  },
  {
    name: 'STEM Store',
    href: '/stem-store',
    count: 24,
    description: 'Lego sets, BlockSquare software, and maker products',
    icon: ShoppingBag,
    accent: 'text-[var(--brand-secondary)]',
    bg: 'bg-[var(--brand-secondary-3)]',
  },
];

function isActivePath(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function navLinkClass(active: boolean, extra = '') {
  return [
    'flex h-full items-center border-b-2 px-5 transition bg-white',
    active
      ? 'border-[var(--brand-secondary)] text-[var(--brand-secondary)]'
      : 'border-white link-underline-left hover:text-zinc-950',
    extra, 
  ]
    .filter(Boolean)
    .join(' ');
}

function AnnouncementBar() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % ANNOUNCEMENTS.length), 3000);
    return () => clearInterval(id);
  }, []);

  const msg = ANNOUNCEMENTS[idx];

  return (
    <div className="relative h-9 overflow-hidden bg-zinc-950">
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ y: 28, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -28, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex items-center justify-center gap-2 text-sm font-semibold text-[#F2F2F0]"
        >
          <span>{msg.icon}</span>
          <span>{msg.text}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  const cartItemCount = useCartStore((state) => state.getTotalItems());
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<'catalog' | 'shop' | null>(null);
  const [shortcutKey, setShortcutKey] = useState('');

  function openCommandPalette() {
    window.dispatchEvent(new CustomEvent("command-palette:open"));
  }

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMounted(true);
      const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
      setShortcutKey(isMac ? '⌘K' : 'Ctrl K');
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const { data: categoryTree = [] } = useQuery({
    queryKey: ['component-category-tree'],
    queryFn: componentApi.getCategoryTree,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <header className="sticky top-0 z-50 w-full  border-[#e7e7e5] bg-background text-zinc-950">
      <AnnouncementBar />

      <div className="border-b border-[#e7e7e5]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          {/* <a
            href="mailto:support@roboroot.in"
            className="hidden items-center gap-2 text-sm font-semibold text-zinc-500 sm:flex"
          >
            <Mail className="h-4 w-4" />
            support@roboroot.in
          </a> */}

          <Link href="/" className="flex items-center">
            <Image
              src="/roboroot-logo.png"
              alt="RoboRoot"
              width={160}
              height={44}
              className="h-11 w-auto"
              priority
            />
          </Link>

          <div className="hidden min-w-0 flex-1 items-center justify-center px-4 lg:flex">
            <button
              type="button"
              onClick={openCommandPalette}
              aria-label="Open search"
              className="flex w-full max-w-xl items-center gap-2 overflow-hidden rounded-full border-2 border-brand-primary-2/60  bg-[#ffffff] pl-5 pr-2 shadow-2xs transition hover:border-[var(--brand-primary)]/40 hover:shadow-md h-12 text-left"
            >
              <Search className="h-4 w-4 shrink-0 text-zinc-400" />
              <span className="flex-1 text-sm font-medium text-zinc-400">
                Search Arduino, ESP32, sensors...
              </span>
              {shortcutKey && (
                <kbd className="shrink-0 hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold text-zinc-400 bg-[#f7f7f7] border border-[#D2D2D0] rounded-md leading-none select-none">
                  {shortcutKey}
                </kbd>
              )}
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* <Link href="/components" className="hidden md:block">
              <Button variant="ghost" size="icon" aria-label="Components" className="border border-transparent hover:border-zinc-950 hover:shadow-sm transition-all">
                <Cpu className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/projects" className="hidden md:block">
              <Button variant="ghost" size="icon" aria-label="Projects" className="border border-transparent hover:border-zinc-950 hover:shadow-sm transition-all">
                <BookOpen className="h-5 w-5" />
              </Button>
            </Link> */}
            <Button variant="ghost" size="icon" aria-label="Wishlist" className="hidden md:inline-flex border border-transparent hover:border-zinc-950 hover:shadow-sm transition-all">
              <Heart className="h-5 w-5" />
            </Button>
            <Link href="/cart">
              <Button variant="ghost"  className="relative border border-transparent hover:border-zinc-950 hover:shadow-sm transition-all" aria-label="Cart">
                <ShoppingCart className="h-5 w-10" /> Cart 
                {mounted && cartItemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--brand-primary)] text-xs font-bold text-white">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </Button>
            </Link>

            {isAuthenticated && user ? (
              <UserMenu user={user} />
            ) : (
              <Link href="/login" className="hidden md:block">
                <Button variant="ghost" size="icon" aria-label="Login" className="border border-transparent hover:border-zinc-950 hover:shadow-sm transition-all">
                  <UserRound className="h-5 w-5" />
                </Button>
              </Link>
            )}

            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={openCommandPalette}
              className="lg:hidden border border-transparent hover:border-zinc-950 hover:shadow-sm transition-all"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              className="lg:hidden flex items-center gap-1.5 border border-transparent hover:border-zinc-950 hover:shadow-sm transition-all px-2.5 h-10"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
              <span className="text-xs font-black uppercase tracking-wider text-zinc-800">Menu</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="hidden border-b border-[#D2D2D0] lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 relative">
          <nav className="flex h-14 items-center text-sm font-bold ]">
            <div
              className="flex h-full items-center  "
              onMouseEnter={() => setOpenMenu('catalog')}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <Link
                href="/categories"
                className={[
                  'group flex h-full items-center gap-2 rounded-lg border-b-2 bg-brand-primary-2 px-5 font-semibold transition-colors',
                  isActivePath(pathname, '/categories')
                    ? 'border-[var(--brand-secondary)] text-[var(--brand-secondary)]'
                    : 'border-transparent text-[var(--brand-secondary-3)] hover:border-[var(--brand-secondary)] hover:text-[var(--brand-secondary)]',
                ].join(' ')}
                onClick={() => setOpenMenu(null)}
              >
                <Menu className="h-5 w-5 text-current transition-colors" />
                All Categories
                <ChevronDown className="h-4 w-4 text-current transition-colors" />
              </Link>
              {openMenu === 'catalog' && (
                <CatalogMegaMenu categories={categoryTree} onClose={() => setOpenMenu(null)} />
              )}
            </div>
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={navLinkClass(isActivePath(pathname, item.href))}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/components"
            className={[
              'btn-underline-white flex h-14 items-center gap-2 border-x border-[#D2D2D0] px-5 text-sm font-bold text-brand-primary transition hover:opacity-90',
              isActivePath(pathname, '/components')
                ? 'border-b-2 border-b-[var(--brand-secondary)] bg-[var(--brand-secondary)]'
                : 'bg-white text-brand-primary',
            ].join(' ')}
          >
            <ShoppingBag className="h-5 w-5" />
            Browse Store
          </Link>
        </div>
      </div>

      {/* Mobile Drawer Slide-in from Right */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
            />
            {/* Right Slide-in Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 right-0 top-0 z-50 w-80 max-w-[85vw] bg-background p-6 shadow-2xl border-l border-[#D2D2D0] lg:hidden flex flex-col justify-between h-full"
            >
              <div className="flex flex-col h-full justify-between">
                <div>
                  {/* Drawer Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-[#D2D2D0]">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
                        <Menu className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-black uppercase tracking-wider text-zinc-950">Menu</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMobileMenuOpen(false)}
                      className="h-8 w-8 rounded-lg border border-[#D2D2D0] hover:border-zinc-950"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Drawer Body (Scrollable) */}
                  <div className="mt-6 space-y-2.5 overflow-y-auto max-h-[calc(100vh-200px)] pr-1">
                    <Link
                      href="/components"
                      className="flex items-center gap-3 rounded-xl border border-[#D2D2D0]/60 bg-[#F2F2F0]/40 px-4 py-3 text-sm font-bold text-zinc-800 hover:bg-[var(--brand-primary)]/5 hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)]/30 transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Cpu className="h-4 w-4 text-[var(--brand-primary)]" />
                      Components
                    </Link>
                    <Link
                      href="/projects"
                      className="flex items-center gap-3 rounded-xl border border-[#D2D2D0]/60 bg-[#F2F2F0]/40 px-4 py-3 text-sm font-bold text-zinc-800 hover:bg-[var(--brand-primary)]/5 hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)]/30 transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <BookOpen className="h-4 w-4 text-[var(--brand-primary)]" />
                      Projects
                    </Link>
                    <Link
                      href="/stem-store"
                      className="flex items-center gap-3 rounded-xl border border-[#D2D2D0]/60 bg-[#F2F2F0]/40 px-4 py-3 text-sm font-bold text-zinc-800 hover:bg-[var(--brand-primary)]/5 hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)]/30 transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <ShoppingBag className="h-4 w-4 text-[var(--brand-primary)]" />
                      STEM Store
                    </Link>
                    <Link
                      href="/orders"
                      className="flex items-center gap-3 rounded-xl border border-[#D2D2D0]/60 bg-[#F2F2F0]/40 px-4 py-3 text-sm font-bold text-zinc-800 hover:bg-[var(--brand-primary)]/5 hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)]/30 transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <PackageCheck className="h-4 w-4 text-[var(--brand-primary)]" />
                      My Orders
                    </Link>
                    <Link
                      href="/bulk-order"
                      className="flex items-center gap-3 rounded-xl border border-[#D2D2D0]/60 bg-[#F2F2F0]/40 px-4 py-3 text-sm font-bold text-zinc-800 hover:bg-[var(--brand-primary)]/5 hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)]/30 transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Layers className="h-4 w-4 text-[var(--brand-primary)]" />
                      Bulk Order
                    </Link>
                    <Link
                      href="/about"
                      className="flex items-center gap-3 rounded-xl border border-[#D2D2D0]/60 bg-[#F2F2F0]/40 px-4 py-3 text-sm font-bold text-zinc-800 hover:bg-[var(--brand-primary)]/5 hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)]/30 transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Info className="h-4 w-4 text-[var(--brand-primary)]" />
                      About Us
                    </Link>
                    <Link
                      href="/careers"
                      className="flex items-center gap-3 rounded-xl border border-[#D2D2D0]/60 bg-[#F2F2F0]/40 px-4 py-3 text-sm font-bold text-zinc-800 hover:bg-[var(--brand-primary)]/5 hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)]/30 transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Users className="h-4 w-4 text-[var(--brand-primary)]" />
                      Careers
                    </Link>
                    <Link
                      href="/cart"
                      className="flex items-center gap-3 rounded-xl border border-[#D2D2D0]/60 bg-[#F2F2F0]/40 px-4 py-3 text-sm font-bold text-zinc-800 hover:bg-[var(--brand-primary)]/5 hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)]/30 transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <ShoppingCart className="h-4 w-4 text-[var(--brand-primary)]" />
                      Cart
                    </Link>
                  </div>
                </div>

                {/* Drawer Footer */}
                <div className="pt-4 border-t border-[#D2D2D0] space-y-3">
                  {!isAuthenticated ? (
                    <div className="grid grid-cols-2 gap-2">
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block">
                        <Button variant="outline" className="w-full border-[#D2D2D0] rounded-xl font-bold">
                          Login
                        </Button>
                      </Link>
                      <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="block">
                        <Button className="w-full bg-[var(--brand-primary)] text-white rounded-xl font-bold hover:bg-[var(--brand-primary)]/90">
                          Sign Up
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F2F2F0]/60 border border-[#D2D2D0]/60">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-primary)] text-sm font-black text-white">
                        {(user?.name || user?.email || "?")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-zinc-950 truncate">{user?.name || "User"}</p>
                        <p className="text-[11px] font-medium text-zinc-400 truncate">{user?.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

function CatalogMegaMenu({
  categories,
  onClose,
}: {
  categories: ComponentCategoryNode[];
  onClose: () => void;
}) {
  const totalSubcategories = categories.reduce((acc, c) => acc + c.subcategories.length, 0);
  const categoryLookup = new Map(categories.map((cat) => [cat.category.toLowerCase(), cat]));
  const showcaseCategories = headerCategoryCards.map((item) => {
    const liveCategory = categoryLookup.get(item.name.toLowerCase());
    return {
      ...item,
      count: liveCategory?.count ?? item.count,
      description: liveCategory?.description ?? item.description,
    };
  });

  return (
    <div className="absolute left-4 right-4 top-full z-50 pt-2">
      <div className="w-full overflow-hidden rounded-xl border border-[#D2D2D0] bg-[#F2F2F0] shadow-2xl shadow-zinc-200/70">

        <div className="flex items-center justify-between border-b border-[#D2D2D0] bg-background px-6 py-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.20em] text-[var(--brand-primary)]">
              Browse Catalog
            </p>
            <p className="mt-0.5 text-sm font-semibold text-zinc-600">
              Pick a category and jump straight into the parts you need.
            </p>
          </div>
          <Link
            href="/categories"
            onClick={onClose}
            className="btn-underline-white rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-xs font-black text-white transition hover:opacity-90"
          >
            View All
          </Link>
        </div>

        <motion.div
          className="grid max-h-[560px] grid-cols-1 gap-3 overflow-y-auto p-5 sm:grid-cols-2 xl:grid-cols-4"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.035 } } }}
        >
          {showcaseCategories.map((cat) => {
            const Icon = cat.icon;

            return (
              <motion.div
                key={cat.name}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
                whileHover={{ y: -3 }}
                className="min-w-0"
              >
                <Link
                  href={cat.href}
                  onClick={onClose}
                  className="group/cat flex h-full min-h-[118px] flex-col justify-between rounded-xl border border-[#D2D2D0] bg-background/70 p-4 shadow-sm transition-all duration-300 hover:border-[var(--brand-primary)]/30 hover:bg-white hover:shadow-lg hover:shadow-zinc-200/70"
                >
                  <span className="flex items-start justify-between gap-3">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${cat.bg} ${cat.accent} transition-transform duration-300 group-hover/cat:scale-110`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    {cat.badge && (
                      <span className="rounded-full bg-[var(--brand-secondary)]/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-[var(--brand-secondary)]">
                        {cat.badge}
                      </span>
                    )}
                  </span>

                  <span className="mt-3 block">
                    <span className="flex items-center justify-between gap-2">
                      <span className="min-w-0 truncate text-sm font-black text-zinc-950 transition-colors group-hover/cat:text-[var(--brand-primary)]">
                        {cat.name}
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-zinc-300 transition-all duration-300 group-hover/cat:translate-x-0.5 group-hover/cat:text-[var(--brand-primary)]" />
                    </span>
                    <span className="mt-1 line-clamp-2 block min-h-6 text-[11px] font-medium leading-4 text-zinc-500">
                      {cat.description}
                    </span>
                    
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="flex items-center justify-between border-t border-[#D2D2D0] bg-background/80 px-6 py-3">
          <div className="flex items-center gap-5 text-[11px] font-bold text-zinc-500">
            <Link href="/components?isBestSeller=true" onClick={onClose} className="transition-colors hover:text-[var(--brand-primary)]">↗ Best Sellers</Link>
            <Link href="/projects" onClick={onClose} className="transition-colors hover:text-[var(--brand-primary)]">↗ Projects</Link>
            <Link href="/stem-store" onClick={onClose} className="transition-colors hover:text-[var(--brand-primary)]">↗ STEM Store</Link>
            <Link href="/projects?difficulty=BEGINNER" onClick={onClose} className="transition-colors hover:text-[var(--brand-primary)]">↗ Starter Builds</Link>
          </div>
          <span className="text-[10px] font-semibold text-zinc-400">
            {categories.length} categories · {totalSubcategories}+ subcategories
          </span>
        </div>
      </div>
    </div>
  );
}
