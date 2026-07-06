'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { ProjectCategory, DifficultyLevel, type ProjectFilters } from '@/lib/types/projects.types';
import { getCategoryLabel, getDifficultyLabel } from '@/lib/utils/project-utils';
import { SlidersHorizontal, X } from 'lucide-react';

interface ProjectFiltersComponentProps {
  filters: ProjectFilters;
  onFilterChange: (filters: Partial<ProjectFilters>) => void;
}

const categories: ProjectCategory[] = [
  ProjectCategory.ROBOTICS,
  ProjectCategory.IOT,
  ProjectCategory.DRONE,
  ProjectCategory.AUTOMATION,
  ProjectCategory.SMART_HOME,
  ProjectCategory.AI_ML,
  ProjectCategory.COMPUTER_VISION,
  ProjectCategory.EDUCATION,
  ProjectCategory.HEALTH,
  ProjectCategory.ENVIRONMENT,
];

const difficulties: DifficultyLevel[] = [
  DifficultyLevel.BEGINNER,
  DifficultyLevel.INTERMEDIATE,
  DifficultyLevel.ADVANCED,
];


export function ProjectFiltersComponent({ filters, onFilterChange }: ProjectFiltersComponentProps) {
  const [minCost, setMinCost] = useState(filters.minCost?.toString() || '');
  const [maxCost, setMaxCost] = useState(filters.maxCost?.toString() || '');
  const [minTime, setMinTime] = useState(filters.minBuildTime?.toString() || '');
  const [maxTime, setMaxTime] = useState(filters.maxBuildTime?.toString() || '');

  const handleCategoryToggle = (category: ProjectCategory) => {
    const current = filters.category;
    let newCategories: ProjectCategory[] = [];
    if (Array.isArray(current)) {
      newCategories = current.includes(category)
        ? current.filter((c) => c !== category)
        : [...current, category];
    } else if (current === category) {
      newCategories = [];
    } else {
      newCategories = current ? [current, category] : [category];
    }
    onFilterChange({ category: newCategories.length > 0 ? newCategories : undefined });
  };

  const handleDifficultyToggle = (difficulty: DifficultyLevel) => {
    const current = filters.difficulty;
    let newDifficulties: DifficultyLevel[] = [];
    if (Array.isArray(current)) {
      newDifficulties = current.includes(difficulty)
        ? current.filter((d) => d !== difficulty)
        : [...current, difficulty];
    } else if (current === difficulty) {
      newDifficulties = [];
    } else {
      newDifficulties = current ? [current, difficulty] : [difficulty];
    }
    onFilterChange({ difficulty: newDifficulties.length > 0 ? newDifficulties : undefined });
  };

  const handleCostFilter = () => {
    onFilterChange({
      minCost: minCost ? parseInt(minCost) * 100 : undefined,
      maxCost: maxCost ? parseInt(maxCost) * 100 : undefined,
    });
  };

  const handleTimeFilter = () => {
    onFilterChange({
      minBuildTime: minTime ? parseInt(minTime) : undefined,
      maxBuildTime: maxTime ? parseInt(maxTime) : undefined,
    });
  };

  const clearFilters = () => {
    setMinCost('');
    setMaxCost('');
    setMinTime('');
    setMaxTime('');
    onFilterChange({
      category: undefined,
      difficulty: undefined,
      minCost: undefined,
      maxCost: undefined,
      minBuildTime: undefined,
      maxBuildTime: undefined,
      isFeatured: undefined,
      preBuiltAvailable: undefined,
    });
  };

  const hasActiveFilters =
    filters.category ||
    filters.difficulty ||
    filters.minCost ||
    filters.maxCost ||
    filters.minBuildTime ||
    filters.maxBuildTime ||
    filters.isFeatured ||
    filters.preBuiltAvailable;

  return (
    <div className="rounded-2xl bg-[#F2F2F0] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#D2D2D0] bg-zinc-950">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-[#1CA2D1]" />
          <h2 className="text-xl font-black text-white">Filters</h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm font-black text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>

      <div className="divide-y divide-[#D2D2D0]">
        {/* Category */}
        <div className="px-5 py-5">
          <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-3">
            Category
          </p>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((category) => {
              const isSelected = Array.isArray(filters.category)
                ? filters.category.includes(category)
                : filters.category === category;
              return (
                <button
                  key={category}
                  onClick={() => handleCategoryToggle(category)}
                  className={`px-3 py-1 rounded-lg text-sm font-bold transition-all ${
                    isSelected
                      ? 'bg-[#1CA2D1] text-white'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-[#E8E8E6]'
                  }`}
                >
                  {getCategoryLabel(category)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Difficulty */}
        <div className="px-5 py-5">
          <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-3">
            Difficulty
          </p>
          <div className="flex flex-col gap-1">
            {difficulties.map((difficulty) => {
              const isSelected = Array.isArray(filters.difficulty)
                ? filters.difficulty.includes(difficulty)
                : filters.difficulty === difficulty;
              return (
                <button
                  key={difficulty}
                  onClick={() => handleDifficultyToggle(difficulty)}
                  className={`px-3 py-2 rounded-lg text-sm font-bold text-left transition-all ${
                    isSelected
                      ? 'bg-[#1CA2D1] text-white'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-[#E8E8E6]'
                  }`}
                >
                  {getDifficultyLabel(difficulty)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cost Range */}
        <div className="px-5 py-5">
          <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-3">
            Cost Range (₹)
          </p>
          <div className="flex gap-2 items-center mb-3">
            <Input
              type="number"
              placeholder="Min"
              value={minCost}
              onChange={(e) => setMinCost(e.target.value)}
              min="0"
              className="border border-[#D2D2D0] rounded-lg text-sm font-bold bg-white"
            />
            <span className="text-zinc-400 shrink-0">—</span>
            <Input
              type="number"
              placeholder="Max"
              value={maxCost}
              onChange={(e) => setMaxCost(e.target.value)}
              min="0"
              className="border border-[#D2D2D0] rounded-lg text-sm font-bold bg-white"
            />
          </div>
          <button
            onClick={handleCostFilter}
            className="w-full py-2 rounded-lg text-sm font-black text-[#1CA2D1] hover:bg-[#E8E8E6] transition-colors"
          >
            Apply
          </button>
        </div>

        {/* Build Time */}
        <div className="px-5 py-5">
          <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-3">
            Build Time (min)
          </p>
          <div className="flex gap-2 items-center mb-3">
            <Input
              type="number"
              placeholder="Min"
              value={minTime}
              onChange={(e) => setMinTime(e.target.value)}
              min="0"
              className="border border-[#D2D2D0] rounded-lg text-sm font-bold bg-white"
            />
            <span className="text-zinc-400 shrink-0">—</span>
            <Input
              type="number"
              placeholder="Max"
              value={maxTime}
              onChange={(e) => setMaxTime(e.target.value)}
              min="0"
              className="border border-[#D2D2D0] rounded-lg text-sm font-bold bg-white"
            />
          </div>
          <button
            onClick={handleTimeFilter}
            className="w-full py-2 rounded-lg text-sm font-black text-[#1CA2D1] hover:bg-[#E8E8E6] transition-colors"
          >
            Apply
          </button>
        </div>

        {/* Quick Filters */}
        <div className="px-5 py-5">
          <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-3">
            Quick Filters
          </p>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => onFilterChange({ isFeatured: filters.isFeatured ? undefined : true })}
              className={`px-3 py-2 rounded-lg text-sm font-bold text-left transition-all ${
                filters.isFeatured
                  ? 'bg-[#1CA2D1] text-white'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-[#E8E8E6]'
              }`}
            >
              Featured Only
            </button>
            <button
              onClick={() => onFilterChange({ preBuiltAvailable: filters.preBuiltAvailable ? undefined : true })}
              className={`px-3 py-2 rounded-lg text-sm font-bold text-left transition-all ${
                filters.preBuiltAvailable
                  ? 'bg-[#1CA2D1] text-white'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-[#E8E8E6]'
              }`}
            >
              Pre-Built Available
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
