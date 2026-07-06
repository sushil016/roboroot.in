'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/store/user.store';
import { useCartStore } from '@/store/cart.store';
import { useQuery } from '@tanstack/react-query';
import { componentApi } from '@/features/products/services/product.service';
import type { ComponentCategoryNode } from '@/types/marketplace.types';
import { UserMenu } from '@/components/layout/UserMenu';
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
  Info,
  Users,
  Layers,
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
    <header className="sticky top-0 z-50 w-full border-b border-[#D2D2D0] bg-background text-zinc-950">
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
              className="flex w-full max-w-xl items-center gap-2 overflow-hidden rounded-full border border-[#D2D2D0] bg-[#F2F2F0] pl-5 pr-2 shadow-sm transition hover:border-[#1CA2D1]/40 hover:shadow-md h-12 text-left"
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
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#1CA2D1] text-xs font-bold text-white">
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
          <nav className="flex h-14 items-center text-sm font-bold text-zinc-800">
            <div
              className="flex h-full items-center"
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
            <Link href="/" className="flex h-full items-center px-5 text-[#1CA2D1] link-underline-left transition hover:text-zinc-950">
              Home
            </Link>
            <Link href="/projects" className="flex h-full items-center px-5 link-underline-left transition hover:text-zinc-950">
              Projects
            </Link>
            <Link href="/stem-store" className="flex h-full items-center px-5 link-underline-left transition hover:text-zinc-950">
              STEM Store
            </Link>
            <Link href="/track-order" className="flex h-full items-center px-5 link-underline-left transition hover:text-zinc-950">
              Track your order
            </Link>
            <Link href="/bulk-order" className="flex h-full items-center px-5 link-underline-left transition hover:text-zinc-950">
              Bulk Order
            </Link>
            <Link href="/about" className="flex h-full items-center px-5 link-underline-left transition hover:text-zinc-950">
              About Us
            </Link>
            <Link href="/careers" className="flex h-full items-center px-5 link-underline-left transition hover:text-zinc-950">
              Careers
            </Link>
          </nav>
          <Link href="/components" className="btn-underline-white flex h-14 items-center gap-2 border-x border-[#D2D2D0] bg-[#1CA2D1] px-5 text-sm font-bold text-white transition hover:opacity-90">
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
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1CA2D1]/10 text-[#1CA2D1]">
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
                      className="flex items-center gap-3 rounded-xl border border-[#D2D2D0]/60 bg-[#F2F2F0]/40 px-4 py-3 text-sm font-bold text-zinc-800 hover:bg-[#1CA2D1]/5 hover:text-[#1CA2D1] hover:border-[#1CA2D1]/30 transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Cpu className="h-4 w-4 text-[#1CA2D1]" />
                      Components
                    </Link>
                    <Link
                      href="/projects"
                      className="flex items-center gap-3 rounded-xl border border-[#D2D2D0]/60 bg-[#F2F2F0]/40 px-4 py-3 text-sm font-bold text-zinc-800 hover:bg-[#1CA2D1]/5 hover:text-[#1CA2D1] hover:border-[#1CA2D1]/30 transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <BookOpen className="h-4 w-4 text-[#1CA2D1]" />
                      Projects
                    </Link>
                    <Link
                      href="/stem-store"
                      className="flex items-center gap-3 rounded-xl border border-[#D2D2D0]/60 bg-[#F2F2F0]/40 px-4 py-3 text-sm font-bold text-zinc-800 hover:bg-[#1CA2D1]/5 hover:text-[#1CA2D1] hover:border-[#1CA2D1]/30 transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <ShoppingBag className="h-4 w-4 text-[#1CA2D1]" />
                      STEM Store
                    </Link>
                    <Link
                      href="/track-order"
                      className="flex items-center gap-3 rounded-xl border border-[#D2D2D0]/60 bg-[#F2F2F0]/40 px-4 py-3 text-sm font-bold text-zinc-800 hover:bg-[#1CA2D1]/5 hover:text-[#1CA2D1] hover:border-[#1CA2D1]/30 transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <PackageCheck className="h-4 w-4 text-[#1CA2D1]" />
                      Track your order
                    </Link>
                    <Link
                      href="/bulk-order"
                      className="flex items-center gap-3 rounded-xl border border-[#D2D2D0]/60 bg-[#F2F2F0]/40 px-4 py-3 text-sm font-bold text-zinc-800 hover:bg-[#1CA2D1]/5 hover:text-[#1CA2D1] hover:border-[#1CA2D1]/30 transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Layers className="h-4 w-4 text-[#1CA2D1]" />
                      Bulk Order
                    </Link>
                    <Link
                      href="/about"
                      className="flex items-center gap-3 rounded-xl border border-[#D2D2D0]/60 bg-[#F2F2F0]/40 px-4 py-3 text-sm font-bold text-zinc-800 hover:bg-[#1CA2D1]/5 hover:text-[#1CA2D1] hover:border-[#1CA2D1]/30 transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Info className="h-4 w-4 text-[#1CA2D1]" />
                      About Us
                    </Link>
                    <Link
                      href="/careers"
                      className="flex items-center gap-3 rounded-xl border border-[#D2D2D0]/60 bg-[#F2F2F0]/40 px-4 py-3 text-sm font-bold text-zinc-800 hover:bg-[#1CA2D1]/5 hover:text-[#1CA2D1] hover:border-[#1CA2D1]/30 transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Users className="h-4 w-4 text-[#1CA2D1]" />
                      Careers
                    </Link>
                    <Link
                      href="/cart"
                      className="flex items-center gap-3 rounded-xl border border-[#D2D2D0]/60 bg-[#F2F2F0]/40 px-4 py-3 text-sm font-bold text-zinc-800 hover:bg-[#1CA2D1]/5 hover:text-[#1CA2D1] hover:border-[#1CA2D1]/30 transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <ShoppingCart className="h-4 w-4 text-[#1CA2D1]" />
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
                        <Button className="w-full bg-[#1CA2D1] text-white rounded-xl font-bold hover:bg-[#1CA2D1]/90">
                          Sign Up
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F2F2F0]/60 border border-[#D2D2D0]/60">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1CA2D1] text-sm font-black text-white">
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

  return (
    <div className="absolute top-full left-4 right-4 z-50 pt-2">
      <div className="w-full overflow-hidden rounded-xl border border-[#D2D2D0] bg-[#F2F2F0] shadow-2xl shadow-zinc-200/60">

        <div className="flex items-center justify-between border-b border-[#D2D2D0] bg-background px-6 py-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.20em] text-[#1CA2D1]">
              Browse Catalog
            </p>
            <p className="mt-0.5 text-sm font-semibold text-zinc-600">
              Explore all categories and STEM products.
            </p>
          </div>
          <Link
            href="/categories"
            onClick={onClose}
            className="btn-underline-white rounded-xl bg-[#1CA2D1] px-5 py-2.5 text-xs font-black text-white transition hover:opacity-90"
          >
            View All
          </Link>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-4 max-h-[360px] overflow-y-auto">
          {categories.map((cat, idx) => (
            <Link
              key={cat.category}
              href={`/components?category=${encodeURIComponent(cat.category)}`}
              onClick={onClose}
              className="group/cat flex items-center gap-3 rounded-xl border border-[#D2D2D0] bg-background/40 p-3 transition-all hover:bg-[#1CA2D1]/10 hover:border-[#1CA2D1]/30"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1CA2D1]/10 text-xs font-bold text-[#1CA2D1] group-hover/cat:bg-[#1CA2D1] group-hover/cat:text-white transition-colors">
                {idx + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-zinc-950 truncate transition-colors group-hover/cat:text-[#1CA2D1]">
                  {cat.category}
                </p>
                <p className="text-[10px] font-medium text-zinc-400 mt-0.5">
                  {cat.count} products
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-[#D2D2D0] bg-background/80 px-6 py-3">
          <div className="flex items-center gap-5 text-[11px] font-bold text-zinc-500">
            <Link href="/components?isBestSeller=true" onClick={onClose} className="transition-colors hover:text-[#1CA2D1]">↗ Best Sellers</Link>
            <Link href="/projects" onClick={onClose} className="transition-colors hover:text-[#1CA2D1]">↗ Projects</Link>
            <Link href="/stem-store" onClick={onClose} className="transition-colors hover:text-[#1CA2D1]">↗ STEM Store</Link>
            <Link href="/projects?difficulty=BEGINNER" onClick={onClose} className="transition-colors hover:text-[#1CA2D1]">↗ Starter Builds</Link>
          </div>
          <span className="text-[10px] font-semibold text-zinc-400">
            {categories.length} categories · {totalSubcategories}+ subcategories
          </span>
        </div>
      </div>
    </div>
  );
}
