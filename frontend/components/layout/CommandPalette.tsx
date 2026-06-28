"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BookOpen,
  Box,
  ChevronRight,
  Cpu,
  Heart,
  Home,
  Layers,
  PackageCheck,
  Search,
  Settings,
  ShoppingCart,
  Star,
  User,
  Wrench,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { componentApi } from "@/features/products/services/product.service";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home, group: "nav" },
  { label: "Browse Components", href: "/components", icon: Cpu, group: "nav" },
  { label: "All Categories", href: "/categories", icon: Layers, group: "nav" },
  { label: "Projects", href: "/projects", icon: BookOpen, group: "nav" },
  { label: "STEM Store", href: "/stem-store", icon: Box, group: "nav" },
  { label: "Cart", href: "/cart", icon: ShoppingCart, group: "nav" },
  { label: "Wishlist", href: "/wishlist", icon: Heart, group: "nav" },
  { label: "My Orders", href: "/orders", icon: PackageCheck, group: "nav" },
  { label: "Profile", href: "/profile", icon: User, group: "nav" },
  { label: "Settings", href: "/settings", icon: Settings, group: "nav" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    function handleOpenEvent() {
      setOpen(true);
    }
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("command-palette:open", handleOpenEvent);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("command-palette:open", handleOpenEvent);
    };
  }, []);

  const { data: categoryTree = [] } = useQuery({
    queryKey: ["component-category-tree"],
    queryFn: componentApi.getCategoryTree,
    staleTime: 5 * 60 * 1000,
  });

  const run = useCallback((fn: () => void) => {
    setOpen(false);
    setSearchValue("");
    fn();
  }, []);

  function handleSearch() {
    const q = searchValue.trim();
    if (!q) return;
    run(() => router.push(`/components?search=${encodeURIComponent(q)}`));
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Command Palette"
      description="Search categories, components, and navigate quickly"
      className="max-w-2xl"
    >
      <CommandInput
        placeholder="Search servo motors, Arduino, ESP32..."
        value={searchValue}
        onValueChange={setSearchValue}
        onKeyDown={(e) => {
          if (e.key === "Enter" && searchValue.trim()) {
            e.preventDefault();
            handleSearch();
          }
        }}
      />
      <CommandList className="max-h-[420px]">
        <CommandEmpty>
          {searchValue.trim() ? (
            <div
              className="flex cursor-pointer flex-col items-center gap-3 py-10 text-sm"
              onClick={handleSearch}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1CA2D1]/10">
                <Search className="h-5 w-5 text-[#1CA2D1]" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-[#222222]">
                  Search for &ldquo;{searchValue}&rdquo;
                </p>
                <p className="text-xs text-muted-foreground">Browse matching components →</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-10 text-sm text-muted-foreground">
              <Cpu className="h-9 w-9 opacity-20" />
              <span>No results found.</span>
            </div>
          )}
        </CommandEmpty>

        {/* Search action — always shown when typing */}
        {searchValue.trim() && (
          <CommandGroup heading="Search">
            <CommandItem
              value={`search:${searchValue}`}
              onSelect={handleSearch}
              className="gap-3 cursor-pointer"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1CA2D1]/10 shrink-0">
                <Search className="h-3.5 w-3.5 text-[#1CA2D1]" />
              </div>
              <span className="font-medium">
                Search &ldquo;<span className="text-[#1CA2D1]">{searchValue}</span>&rdquo; in Components
              </span>
              <ArrowRight className="ml-auto h-3 w-3 text-[#1CA2D1]" />
            </CommandItem>
          </CommandGroup>
        )}

        {searchValue.trim() && <CommandSeparator />}

        {/* Navigation */}
        <CommandGroup heading="Navigation">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
            <CommandItem
              key={href}
              value={label}
              onSelect={() => run(() => router.push(href))}
              className="gap-3 cursor-pointer"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted shrink-0">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <span className="font-medium">{label}</span>
              <ArrowRight className="ml-auto h-3 w-3 opacity-30" />
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Categories */}
        {categoryTree.length > 0 && (
          <CommandGroup heading="Categories">
            {categoryTree.map((cat) => (
              <CommandItem
                key={cat.category}
                value={cat.category}
                onSelect={() =>
                  run(() =>
                    router.push(`/components?category=${encodeURIComponent(cat.category)}`)
                  )
                }
                className="gap-3 cursor-pointer"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1CA2D1]/10 shrink-0">
                  <Layers className="h-3.5 w-3.5 text-[#1CA2D1]" />
                </div>
                <span className="font-medium">{cat.category}</span>
                <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                  {cat.count} items
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandSeparator />

        {/* Subcategories */}
        {categoryTree.length > 0 && (
          <CommandGroup heading="Subcategories">
            {categoryTree.flatMap((cat) =>
              cat.subcategories.map((sub) => (
                <CommandItem
                  key={`${cat.category}/${sub.name}`}
                  value={`${sub.name} ${cat.category}`}
                  onSelect={() =>
                    run(() =>
                      router.push(
                        `/components?category=${encodeURIComponent(cat.category)}&subcategory=${encodeURIComponent(sub.name)}`
                      )
                    )
                  }
                  className="gap-3 cursor-pointer"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span>
                    <span className="text-muted-foreground text-xs">{cat.category} / </span>
                    <span className="font-medium">{sub.name}</span>
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                    {sub.count}
                  </span>
                </CommandItem>
              ))
            )}
          </CommandGroup>
        )}

        <CommandSeparator />

        {/* Quick Actions */}
        <CommandGroup heading="Quick Actions">
          <CommandItem
            value="best sellers bestsellers popular trending"
            onSelect={() => run(() => router.push("/components?isBestSeller=true"))}
            className="gap-3 cursor-pointer"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 shrink-0">
              <Star className="h-3.5 w-3.5 text-amber-500" />
            </div>
            <span className="font-medium">Best Sellers</span>
          </CommandItem>
          <CommandItem
            value="starter builds beginner projects easy simple"
            onSelect={() => run(() => router.push("/projects?difficulty=BEGINNER"))}
            className="gap-3 cursor-pointer"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 shrink-0">
              <Wrench className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <span className="font-medium">Starter Builds</span>
          </CommandItem>
          <CommandItem
            value="stem store kits courses books learning"
            onSelect={() => run(() => router.push("/stem-store"))}
            className="gap-3 cursor-pointer"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 shrink-0">
              <BookOpen className="h-3.5 w-3.5 text-rose-500" />
            </div>
            <span className="font-medium">STEM Store</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>

      {/* Footer hints */}
      <div className="flex items-center gap-4 border-t border-border px-4 py-2.5 text-[10px] text-muted-foreground">
        <span>
          <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">↑↓</kbd> navigate
        </span>
        <span>
          <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">↵</kbd> select
        </span>
        <span>
          <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">esc</kbd> close
        </span>
      </div>
    </CommandDialog>
  );
}
