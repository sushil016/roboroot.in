'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { Project } from '@/features/projects/types/project.types';
import { getCategoryLabel, formatBuildTime } from '@/features/projects/data/project-utils';
import { Clock, Eye, Users, Zap, Package } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  index?: number;
}

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/projects/${project.slug}`} className="block group">
        <div className="flex flex-col md:flex-row bg-white rounded-2xl border-2 border-[#1CA2D1] overflow-hidden shadow-[3px_3px_0px_0px_#1CA2D1] hover:shadow-[5px_5px_0px_0px_#1CA2D1] transition-all duration-300">

          {/* ── Thumbnail ── */}
          <div className="relative md:w-64 lg:w-72 shrink-0 bg-gray-100">
            <div className="relative w-full aspect-video md:aspect-auto md:h-full min-h-[200px]">
              {project.isFeatured && (
                <div className="absolute top-3 left-3 z-10">
                  <span className="inline-flex items-center gap-1 bg-[#222222] text-white text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full">
                    <Zap className="w-2.5 h-2.5" />
                    Featured
                  </span>
                </div>
              )}
              {project.thumbnailUrl ? (
                <Image
                  src={project.thumbnailUrl}
                  alt={project.title}
                  fill
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 288px"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-gray-100 to-gray-200">
                  <span className="text-5xl font-bold text-gray-300 select-none leading-none">
                    {project.title[0]?.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">No thumbnail</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Content ── */}
          <div className="flex flex-col flex-1 p-5 lg:p-6 min-w-0 gap-3">

            {/* Category + Title */}
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-[#1CA2D1]">
                {getCategoryLabel(project.category)}
              </span>
              <h2 className="mt-1 text-lg lg:text-xl font-semibold text-[#222222] leading-snug group-hover:text-[#1CA2D1] transition-colors">
                {project.title}
              </h2>
              {project.summary ? (
                <p className="mt-1.5 text-sm text-gray-500 leading-relaxed line-clamp-2">
                  {project.summary}
                </p>
              ) : (
                <p className="mt-1.5 text-sm text-gray-400 italic">No description added yet.</p>
              )}
            </div>

            {/* Components — always rendered for consistency */}
            <div className="flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
                Components
              </p>
              {project.components && project.components.length > 0 ? (
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-0.5">
                  {project.components.slice(0, 5).map((pc) => (
                    <div
                      key={pc.id}
                      onClick={(e) => { e.preventDefault(); window.location.href = `/components/${pc.component.slug}`; }}
                      className="flex-shrink-0 flex flex-col items-center gap-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl p-2 w-[72px] transition-colors cursor-pointer"
                    >
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-200">
                        {pc.component.imageUrl ? (
                          <Image
                            src={pc.component.imageUrl}
                            alt={pc.component.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <p className="text-[9px] font-medium text-center line-clamp-2 text-gray-600 leading-tight w-full">
                        {pc.component.name}
                      </p>
                    </div>
                  ))}
                  {project.components.length > 5 && (
                    <div className="flex-shrink-0 flex items-center justify-center w-[72px] h-[72px] rounded-xl bg-gray-100 border border-gray-200">
                      <span className="text-xs font-semibold text-gray-400">
                        +{project.components.length - 5}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 py-2">
                  <span className="text-sm text-gray-400">—</span>
                  <span className="text-sm text-gray-400">No components listed</span>
                </div>
              )}
            </div>

            {/* Stats + CTA */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-3 border-t border-gray-100">
              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-medium text-gray-600">
                    {project.estimatedBuildTimeMinutes
                      ? formatBuildTime(project.estimatedBuildTimeMinutes)
                      : '—'}
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-medium text-gray-600">{project.viewCount ?? 0}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-medium text-gray-600">{project.buildCount ?? 0} built</span>
                </span>
              </div>

              {/* CTA */}
              <button
                onClick={(e) => { e.preventDefault(); window.location.href = `/projects/${project.slug}`; }}
                className="sm:ml-auto flex-shrink-0 inline-flex items-center gap-1.5 h-9 px-5 rounded-lg bg-[#222222] text-white text-sm font-medium hover:bg-[#1CA2D1] transition-colors"
              >
                View Project
              </button>
            </div>

            {/* Note */}
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Buy individual components to unlock docs, or the full project for videos & 1:1 mentoring.
            </p>
          </div>

        </div>
      </Link>
    </motion.div>
  );
}
