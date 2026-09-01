'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/lib/store/authStore';
import { useCartStore } from '@/lib/store/cartStore';
import { useQuery } from '@tanstack/react-query';
import { componentApi } from '@/lib/api/marketplace.api';
import type { ComponentCategoryNode } from '@/lib/types/marketplace.types';
import { UserMenu } from './UserMenu';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  ChevronDown,
  Cpu,
  Heart,
  Mail,
  Menu,
  PackageCheck,
  Search,
  ShoppingBag,
  ShoppingCart,
  UserRound,
  Wrench,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ANNOUNCEMENTS = [
  { icon: '🚚', text: 'Free Shipping on orders above ₹499' },
  { icon: '💵', text: 'Cash on Delivery Available' },
  { icon: '🇮🇳', text: 'All Over India Supply' },
];

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
    setMounted(true);
    const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
    setShortcutKey(isMac ? '⌘K' : 'Ctrl K');
  }, []);

  const { data: categoryTree = [] } = useQuery({
    queryKey: ['component-category-tree'],
    queryFn: componentApi.getCategoryTree,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#D2D2D0] bg-[#F2F2F0] text-zinc-950">
      <AnnouncementBar />

      <div className="border-b border-[#D2D2D0]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <a
            href="mailto:support@roboroot.in"
            className="hidden items-center gap-2 text-sm font-semibold text-zinc-500 sm:flex"
          >
            <Mail className="h-4 w-4" />
            support@roboroot.in
          </a>

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
              className="flex w-full max-w-xl items-center gap-2 overflow-hidden rounded-full border border-[#D2D2D0] bg-[#F2F2F0] pl-5 pr-2 shadow-sm transition hover:border-[var(--brand-primary)]/40 hover:shadow-md h-12 text-left"
            >
              <Search className="h-4 w-4 shrink-0 text-zinc-400" />
              <span className="flex-1 text-sm font-medium text-zinc-400">
                Search Arduino, ESP32, sensors...
              </span>
              {shortcutKey && (
                <kbd className="shrink-0 hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold text-zinc-400 bg-[#E8E8E6] border border-[#D2D2D0] rounded-md leading-none select-none">
                  {shortcutKey}
                </kbd>
              )}
            </button>
          </div>

          <div className="flex items-center gap-1">
            <Link href="/components" className="hidden md:block">
              <Button variant="ghost" size="icon" aria-label="Components" className="border border-transparent hover:border-zinc-950 hover:shadow-sm transition-all">
                <Cpu className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/projects" className="hidden md:block">
              <Button variant="ghost" size="icon" aria-label="Projects" className="border border-transparent hover:border-zinc-950 hover:shadow-sm transition-all">
                <BookOpen className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" aria-label="Wishlist" className="hidden md:inline-flex border border-transparent hover:border-zinc-950 hover:shadow-sm transition-all">
              <Heart className="h-5 w-5" />
            </Button>
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative border border-transparent hover:border-zinc-950 hover:shadow-sm transition-all" aria-label="Cart">
                <ShoppingCart className="h-5 w-5" />
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

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden border border-transparent hover:border-zinc-950 hover:shadow-sm transition-all"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="hidden border-b border-[#D2D2D0] lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4">
          <nav className="flex h-14 items-center text-sm font-bold text-zinc-800">
            <div
              className="relative flex h-full items-center"
              onMouseEnter={() => setOpenMenu('catalog')}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <Link href="/categories" className="flex h-full items-center gap-2 bg-[#E8E8E6] px-5 text-zinc-950 link-underline-left transition" onClick={() => setOpenMenu(null)}>
                <Menu className="h-5 w-5" />
                All Categories
                <ChevronDown className="h-4 w-4" />
              </Link>
              {openMenu === 'catalog' && (
                <CatalogMegaMenu categories={categoryTree} onClose={() => setOpenMenu(null)} />
              )}
            </div>
            <Link href="/" className="flex h-full items-center px-5 text-[var(--brand-primary)] link-underline-left transition hover:text-zinc-950">
              Home
            </Link>
            <Link href="/projects" className="flex h-full items-center px-5 link-underline-left transition hover:text-zinc-950">
              Projects
            </Link>
            <div
              className="relative flex h-full items-center"
              onMouseEnter={() => setOpenMenu('shop')}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <Link href="/components" className="flex h-full items-center gap-1 px-5 link-underline-left transition hover:text-zinc-950" onClick={() => setOpenMenu(null)}>
                Shop Parts
                <ChevronDown className="h-4 w-4" />
              </Link>
              {openMenu === 'shop' && (
                <CatalogMegaMenu categories={categoryTree} align="wide" onClose={() => setOpenMenu(null)} />
              )}
            </div>
            <Link href="/categories" className="flex h-full items-center px-5 link-underline-left transition hover:text-zinc-950">
              Categories
            </Link>
            <Link href="/projects?difficulty=BEGINNER" className="flex h-full items-center px-5 link-underline-left transition hover:text-zinc-950">
              Starter Builds
            </Link>
            <Link href="/robomaniac-store" className="flex h-full items-center px-5 link-underline-left transition hover:text-zinc-950">
              Robomaniac Store
            </Link>
            <Link href="/projects?category=ROBOTICS" className="flex h-full items-center px-5 link-underline-left transition hover:text-zinc-950">
              Robotics Kits
            </Link>
          </nav>
          <Link href="/components" className="btn-underline-white flex h-14 items-center gap-2 border-x border-[#D2D2D0] bg-[var(--brand-primary)] px-5 text-sm font-bold text-white transition hover:opacity-90">
            <ShoppingBag className="h-5 w-5" />
            Browse Store
          </Link>
        </div>
      </div>

      <div className="lg:hidden">
        {mobileMenuOpen && (
          <div className="space-y-2 border-t border-[#D2D2D0] bg-[#F2F2F0] px-4 py-4">
            <form action="/components" className="flex overflow-hidden rounded-md border border-[#D2D2D0]">
              <input
                name="search"
                aria-label="Search components"
                placeholder="Search parts"
                className="h-11 min-w-0 flex-1 bg-[#F2F2F0] px-3 text-sm outline-none"
              />
              <button className="bg-[var(--brand-primary)] px-4 text-sm font-bold text-white">
                <Search className="h-4 w-4" />
              </button>
            </form>
            <Link
              href="/components"
              className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-bold text-zinc-800 hover:text-zinc-950"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Cpu className="h-4 w-4" />
              Components
            </Link>
            <Link
              href="/categories"
              className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-bold text-zinc-800 hover:text-zinc-950"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Menu className="h-5 w-5" />
              All Categories
            </Link>
            {categoryTree.length > 0 && (
              <div className="rounded-md border border-[#D2D2D0] bg-[#F2F2F0] p-3">
                <p className="mb-2 text-xs font-black uppercase tracking-wide text-[var(--brand-primary)]">
                  Category tree
                </p>
                <div className="grid gap-2">
                  {categoryTree.slice(0, 5).map((cat) => (
                    <Link
                      key={cat.category}
                      href={`/components?category=${encodeURIComponent(cat.category)}`}
                      className="rounded-md bg-[#F2F2F0] px-3 py-2 text-sm font-bold text-zinc-800"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {cat.category}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <Link
              href="/robomaniac-store"
              className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-bold text-zinc-800 hover:text-zinc-950"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ShoppingBag className="h-4 w-4" />
              Robomaniac Store
            </Link>
            <Link
              href="/projects"
              className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-bold text-zinc-800 hover:text-zinc-950"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Wrench className="h-4 w-4" />
              Projects
            </Link>
            <Link
              href="/projects?difficulty=BEGINNER"
              className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-bold text-zinc-800 hover:text-zinc-950"
              onClick={() => setMobileMenuOpen(false)}
            >
              <PackageCheck className="h-4 w-4" />
              Starter Builds
            </Link>
            <Link
              href="/cart"
              className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-bold text-zinc-800 hover:text-zinc-950"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ShoppingCart className="h-4 w-4" />
              Cart
            </Link>

            {!isAuthenticated && (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link href="/login" className="block">
                  <Button variant="outline" className="w-full border-[#D2D2D0]">
                    Login
                  </Button>
                </Link>
                <Link href="/register" className="block">
                  <Button className="w-full bg-[var(--brand-primary)] text-white">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

function CatalogMegaMenu({
  categories,
  align = 'left',
  onClose,
}: {
  categories: ComponentCategoryNode[];
  align?: 'left' | 'wide';
  onClose: () => void;
}) {
  const totalSubcategories = categories.reduce((acc, c) => acc + c.subcategories.length, 0);

  return (
    <div className={`absolute top-full z-50 pt-2 ${align === 'wide' ? '-left-72' : 'left-0'}`}>
      <div className="w-[960px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-[#D2D2D0] bg-[#F2F2F0] shadow-2xl shadow-zinc-200/60">

        <div className="flex items-center justify-between border-b border-[#D2D2D0] bg-[#F2F2F0] px-6 py-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.20em] text-[var(--brand-primary)]">
              Browse Catalog
            </p>
            <p className="mt-0.5 text-sm font-semibold text-zinc-600">
              Categories, subcategories, and Robomaniac products.
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

        <div className="grid gap-6 p-6 md:grid-cols-4">
          {categories.map((cat, idx) => (
            <div key={cat.category}>
              <Link
                href={`/components?category=${encodeURIComponent(cat.category)}`}
                onClick={onClose}
                className="group/cat flex items-center gap-2 pb-0.5"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary)]/15 text-[9px] font-black text-[var(--brand-primary)]">
                  {idx + 1}
                </span>
                <span className="text-sm font-black text-zinc-950 transition-colors group-hover/cat:text-[var(--brand-primary)]">
                  {cat.category}
                </span>
              </Link>
              <p className="mb-3 pl-7 text-[11px] font-medium leading-4 text-zinc-400">
                {cat.count} products
              </p>
              <div className="space-y-0.5 pl-1">
                {cat.subcategories.map((sub) => (
                  <Link
                    key={sub.name}
                    href={`/components?category=${encodeURIComponent(cat.category)}&subcategory=${encodeURIComponent(sub.name)}`}
                    onClick={onClose}
                    className="block rounded-lg px-3 py-1.5 text-[11.5px] font-semibold text-zinc-600 transition-all hover:bg-[var(--brand-primary)]/10 hover:text-[var(--brand-primary)]"
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-[#D2D2D0] bg-[#F2F2F0]/80 px-6 py-3">
          <div className="flex items-center gap-5 text-[11px] font-bold text-zinc-500">
            <Link href="/components?isBestSeller=true" onClick={onClose} className="transition-colors hover:text-[var(--brand-primary)]">↗ Best Sellers</Link>
            <Link href="/projects" onClick={onClose} className="transition-colors hover:text-[var(--brand-primary)]">↗ Projects</Link>
            <Link href="/robomaniac-store" onClick={onClose} className="transition-colors hover:text-[var(--brand-primary)]">↗ Robomaniac Store</Link>
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
