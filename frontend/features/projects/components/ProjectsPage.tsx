'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { projectApi } from '@/features/projects/services/project.service';
import type { ProjectFilters, ProjectCategory, DifficultyLevel } from '@/features/projects/types/project.types';
import { ProjectCard } from '@/features/projects/components/ProjectCard';
import { Input } from '@/components/ui/input';
import Text3DFlip from '@/components/ui/text-3d-flip';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Loader2,
  ChevronRight,
  ChevronDown,
  Cpu,
  Layers,
  Circle,
} from 'lucide-react';
import { ProjectCategory as PC, DifficultyLevel as DL } from '@/features/projects/types/project.types';
import { getCategoryLabel, getDifficultyLabel } from '@/features/projects/data/project-utils';

const SIDEBAR_CATEGORIES: PC[] = [
  PC.ROBOTICS,
  PC.IOT,
  PC.DRONE,
  PC.AUTOMATION,
  PC.SMART_HOME,
  PC.AI_ML,
  PC.COMPUTER_VISION,
  PC.EDUCATION,
  PC.HEALTH,
  PC.ENVIRONMENT,
];

const DIFFICULTIES: DL[] = [DL.BEGINNER, DL.INTERMEDIATE, DL.ADVANCED];

type SortKey = 'createdAt' | 'title' | 'viewCount' | 'buildCount' | 'estimatedCostCents';

const SORT_OPTIONS: { label: string; value: `${SortKey}-${'asc' | 'desc'}` }[] = [
  { label: 'Newest First', value: 'createdAt-desc' },
  { label: 'Oldest First', value: 'createdAt-asc' },
  { label: 'Name (A–Z)', value: 'title-asc' },
  { label: 'Most Viewed', value: 'viewCount-desc' },
  { label: 'Most Built', value: 'buildCount-desc' },
  { label: 'Cost: Low to High', value: 'estimatedCostCents-asc' },
  { label: 'Cost: High to Low', value: 'estimatedCostCents-desc' },
];

export function ProjectsPage() {
  const [filters, setFilters] = useState<ProjectFilters>(() => {
    const params =
      typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : undefined;
    return {
      page: 1,
      limit: 12,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      isPublic: true,
      search: params?.get('search') || undefined,
      category: (params?.get('category') as PC | null) || undefined,
      difficulty: (params?.get('difficulty') as DL | null) || undefined,
    };
  });
  const [searchInput, setSearchInput] = useState('');
  const [activeCategory, setActiveCategory] = useState<PC | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['projects', filters],
    queryFn: () => projectApi.getProjects(filters),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchInput || undefined, page: 1 }));
  };

  const setCategory = (cat: PC | null) => {
    setActiveCategory(cat);
    setFilters((prev) => ({ ...prev, category: cat || undefined, page: 1 }));
  };

  const toggleDifficulty = (d: DL) => {
    const cur = filters.difficulty;
    const arr = Array.isArray(cur) ? cur : cur ? [cur] : [];
    const next = arr.includes(d) ? arr.filter((x) => x !== d) : [...arr, d];
    setFilters((prev) => ({ ...prev, difficulty: next.length ? next : undefined, page: 1 }));
  };

  const isDifficultyChecked = (d: DL) => {
    const cur = filters.difficulty;
    return Array.isArray(cur) ? cur.includes(d) : cur === d;
  };

  const setSort = (val: string) => {
    const [sortBy, sortOrder] = val.split('-') as [SortKey, 'asc' | 'desc'];
    setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
  };

  const currentSort = `${filters.sortBy}-${filters.sortOrder}`;
  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === currentSort)?.label ?? 'Newest First';

  const activeCategoryLabel = activeCategory ? getCategoryLabel(activeCategory) : 'All Projects';
  const activeDifficultyLabels = (() => {
    const d = filters.difficulty;
    if (!d) return null;
    const arr = Array.isArray(d) ? d : [d];
    return arr.map(getDifficultyLabel).join(', ');
  })();

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f2f2f0]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* ── Dark Hero Header ── */}
      <div className="bg-[#222222] rounded-b-[2.5rem] px-6 py-12 pb-14">
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center gap-6">
          {/* Label */}
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-[var(--brand-primary)]" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Robotics & Electronics
            </span>
          </div>

          {/* Title */}
          <Text3DFlip
            as="h1"
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight justify-center"
            textClassName="text-white"
            flipTextClassName="text-[var(--brand-primary)]"
            staggerDuration={0.025}
            rotateDirection="bottom"
          >
            Featured Projects
          </Text3DFlip>

          <p className="text-zinc-400 text-base max-w-xl">
            Step-by-step guides, component kits, and video walkthroughs for every skill level.
          </p>

          {/* Centered search with hover animation */}
          <form onSubmit={handleSearch} className="w-full max-w-xl">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileFocus={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="relative flex items-center"
            >
              <Search className="absolute left-4 h-4 w-4 text-zinc-400 pointer-events-none z-10" />
              <Input
                type="text"
                placeholder="Search projects..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-11 pr-4 h-12 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-zinc-400 focus:bg-white/15 focus:border-[var(--brand-primary)]/60 transition-all text-sm"
              />
              <button
                type="submit"
                className="absolute right-2 h-8 px-4 rounded-full bg-[var(--brand-primary)] text-white text-xs font-semibold hover:bg-[#1590bb] transition-colors"
              >
                Search
              </button>
            </motion.div>
          </form>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-[1500px] mx-auto px-6 py-8 flex gap-8">
        {/* ── Sidebar Nav ── */}
        <aside className="hidden lg:flex flex-col w-56 xl:w-64 shrink-0">
          <div className="sticky top-24">
            {/* Sidebar header */}
            <div className="flex items-center gap-2.5 px-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-[#222222] flex items-center justify-center shrink-0">
                <Cpu className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-[#222222] text-sm">Projects</span>
            </div>

            {/* All */}
            <div className="mb-1">
              <button
                onClick={() => setCategory(null)}
                className={`flex items-center justify-between w-full px-2 py-2 rounded-lg text-sm transition-colors ${
                  !activeCategory
                    ? 'text-[#222222] font-semibold'
                    : 'text-gray-500 hover:text-[#222222] font-medium'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 shrink-0" />
                  <span>All Projects</span>
                </div>
                {data && (
                  <span className="text-xs text-gray-400">
                    {data.total}
                  </span>
                )}
              </button>
            </div>

            {/* Categories */}
            <div className="mb-5">
              <p className="px-2 mb-1 mt-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Category
              </p>
              <nav className="space-y-0.5">
                {SIDEBAR_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(activeCategory === cat ? null : cat)}
                    className={`flex items-center w-full px-2 py-2 rounded-lg text-sm transition-colors ${
                      activeCategory === cat
                        ? 'text-[#222222] font-semibold'
                        : 'text-gray-500 hover:text-[#222222]'
                    }`}
                  >
                    <ChevronRight
                      className={`w-3.5 h-3.5 mr-2 shrink-0 transition-transform ${
                        activeCategory === cat ? 'rotate-90 text-[var(--brand-primary)]' : 'text-gray-400'
                      }`}
                    />
                    {getCategoryLabel(cat)}
                  </button>
                ))}
              </nav>
            </div>

            {/* Difficulty */}
            <div className="mb-5">
              <p className="px-2 mb-1 mt-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Difficulty
              </p>
              <nav className="space-y-0.5">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    onClick={() => toggleDifficulty(d)}
                    className={`flex items-center w-full px-2 py-2 rounded-lg text-sm transition-colors ${
                      isDifficultyChecked(d)
                        ? 'text-[#222222] font-semibold'
                        : 'text-gray-500 hover:text-[#222222]'
                    }`}
                  >
                    <Circle
                      className={`w-2 h-2 mr-2.5 shrink-0 fill-current ${
                        isDifficultyChecked(d) ? 'text-[var(--brand-primary)]' : 'text-gray-300'
                      }`}
                    />
                    {getDifficultyLabel(d)}
                  </button>
                ))}
              </nav>
            </div>

            {/* Quick */}
            <div>
              <p className="px-2 mb-1 mt-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Quick
              </p>
              <nav className="space-y-0.5">
                <button
                  onClick={() => setFilters((p) => ({ ...p, isFeatured: p.isFeatured ? undefined : true, page: 1 }))}
                  className={`flex items-center w-full px-2 py-2 rounded-lg text-sm transition-colors ${
                    filters.isFeatured
                      ? 'text-[#222222] font-semibold'
                      : 'text-gray-500 hover:text-[#222222]'
                  }`}
                >
                  <Circle
                    className={`w-2 h-2 mr-2.5 shrink-0 fill-current ${
                      filters.isFeatured ? 'text-[var(--brand-primary)]' : 'text-gray-300'
                    }`}
                  />
                  Featured Only
                </button>
                <button
                  onClick={() => setFilters((p) => ({ ...p, preBuiltAvailable: p.preBuiltAvailable ? undefined : true, page: 1 }))}
                  className={`flex items-center w-full px-2 py-2 rounded-lg text-sm transition-colors ${
                    filters.preBuiltAvailable
                      ? 'text-[#222222] font-semibold'
                      : 'text-gray-500 hover:text-[#222222]'
                  }`}
                >
                  <Circle
                    className={`w-2 h-2 mr-2.5 shrink-0 fill-current ${
                      filters.preBuiltAvailable ? 'text-[var(--brand-primary)]' : 'text-gray-300'
                    }`}
                  />
                  Pre-Built Available
                </button>
              </nav>
            </div>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 min-w-0">
          {/* Title row */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-[#222222] tracking-tight">
              {activeCategoryLabel}
            </h2>
          </div>

          {/* Dropdown filter bar */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {/* Category dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                  activeCategory
                    ? 'border-[#222222] bg-[#222222] text-white'
                    : 'border-[#d0d0d0] bg-white text-[#222222] hover:border-[#222222]'
                }`}>
                  {activeCategory ? getCategoryLabel(activeCategory) : 'Category'}
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 rounded-xl border border-gray-200 shadow-lg bg-white p-1">
                <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-gray-400 px-2">
                  Category
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={!activeCategory}
                  onCheckedChange={() => setCategory(null)}
                  className="rounded-lg text-sm text-[#222222]"
                >
                  All Projects
                </DropdownMenuCheckboxItem>
                {SIDEBAR_CATEGORIES.map((cat) => (
                  <DropdownMenuCheckboxItem
                    key={cat}
                    checked={activeCategory === cat}
                    onCheckedChange={() => setCategory(activeCategory === cat ? null : cat)}
                    className="rounded-lg text-sm text-[#222222]"
                  >
                    {getCategoryLabel(cat)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Difficulty dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                  filters.difficulty
                    ? 'border-[#222222] bg-[#222222] text-white'
                    : 'border-[#d0d0d0] bg-white text-[#222222] hover:border-[#222222]'
                }`}>
                  {activeDifficultyLabels ?? 'Difficulty'}
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-44 rounded-xl border border-gray-200 shadow-lg bg-white p-1">
                <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-gray-400 px-2">
                  Difficulty
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {DIFFICULTIES.map((d) => (
                  <DropdownMenuCheckboxItem
                    key={d}
                    checked={isDifficultyChecked(d)}
                    onCheckedChange={() => toggleDifficulty(d)}
                    className="rounded-lg text-sm text-[#222222]"
                  >
                    {getDifficultyLabel(d)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#d0d0d0] bg-white text-[#222222] text-sm font-medium hover:border-[#222222] transition-colors">
                  {currentSortLabel}
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 rounded-xl border border-gray-200 shadow-lg bg-white p-1">
                <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-gray-400 px-2">
                  Sort by
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={currentSort} onValueChange={setSort}>
                  {SORT_OPTIONS.map((o) => (
                    <DropdownMenuRadioItem
                      key={o.value}
                      value={o.value}
                      className="rounded-lg text-sm text-[#222222]"
                    >
                      {o.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Count */}
            <span className="ml-auto text-sm text-gray-400 font-medium">
              {data ? `${data.total} Project${data.total !== 1 ? 's' : ''}` : ''}
            </span>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-primary)]" />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
              <p className="font-bold text-red-700">Failed to load projects</p>
              <p className="text-sm text-red-400 mt-1">Please try again later</p>
            </div>
          )}

          {/* Empty */}
          {data && data.projects.length === 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
              <p className="text-xl font-bold text-[#222222]">No projects found</p>
              <p className="text-sm text-gray-400 mt-2">Try adjusting your filters</p>
            </div>
          )}

          {/* Cards */}
          {data && data.projects.length > 0 && (
            <>
              <div className="flex flex-col gap-5">
                {data.projects.map((project, i) => (
                  <ProjectCard key={project.id} project={project} index={i} />
                ))}
              </div>

              {/* Pagination */}
              {data.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
                  <button
                    onClick={() => handlePageChange(filters.page! - 1)}
                    disabled={filters.page === 1}
                    className="px-4 h-9 rounded-lg border border-[#d0d0d0] bg-white text-sm font-semibold text-[#222222] hover:border-[#222222] disabled:opacity-40 transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                        filters.page === page
                          ? 'bg-[#222222] text-white'
                          : 'border border-[#d0d0d0] bg-white text-[#222222] hover:border-[#222222]'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(filters.page! + 1)}
                    disabled={filters.page === data.totalPages}
                    className="px-4 h-9 rounded-lg border border-[#d0d0d0] bg-white text-sm font-semibold text-[#222222] hover:border-[#222222] disabled:opacity-40 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
