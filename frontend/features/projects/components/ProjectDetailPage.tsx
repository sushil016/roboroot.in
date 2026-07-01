'use client';

import { useParams, notFound } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { projectApi } from '@/features/projects/services/project.service';
import { useCartStore } from '@/store/cart.store';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Clock,
  Eye,
  Users,
  Star,
  Package,
  Sparkles,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Wrench,
  Download,
  FileText,
  ExternalLink,
  Play,
  ChevronLeft,
  ChevronRight,
  Info,
  Layers,
  Zap,
} from 'lucide-react';
import {
  getDifficultyLabel,
  getDifficultyColor,
  formatBuildTime,
  formatProjectPrice,
  getCategoryLabel,
  getCategoryIcon,
} from '@/features/projects/data/project-utils';
import { ProjectComponents } from '@/features/projects/components/ProjectComponents';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export function ProjectDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const {
    data: project,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['project', slug],
    queryFn: () => projectApi.getProjectBySlug(slug),
    enabled: !!slug,
  });

  /* ---- Loading ---- */
  if (isLoading) {
    return (
      <div className="bg-[#f2f2f0] min-h-screen">
        <div className="bg-[#FAFAED] border-b border-[#D8D8C4] px-6 py-4">
          <Skeleton className="h-4 w-40 rounded-full" />
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-8 lg:grid-cols-12 animate-pulse">
            <div className="lg:col-span-5 space-y-4">
              <Skeleton className="aspect-video w-full rounded-2xl" />
              <div className="flex gap-2">
                <Skeleton className="h-16 w-16 rounded-xl" />
                <Skeleton className="h-16 w-16 rounded-xl" />
              </div>
            </div>
            <div className="lg:col-span-7 space-y-4">
              <Skeleton className="h-6 w-32 rounded" />
              <Skeleton className="h-9 w-3/4 rounded" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---- Error ---- */
  if (error || !project) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EAEADB]">
          <Package className="h-7 w-7 text-zinc-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#222222]">Project not found</h1>
          <p className="mt-1 text-sm text-zinc-500">
            This project may have been removed or archived.
          </p>
        </div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 rounded-xl bg-[#222222] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1CA2D1]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>
      </div>
    );
  }

  // Get all project images (thumbnail + gallery images)
  const allImages = [
    project.thumbnailUrl,
    ...(project.imageUrls || []),
  ].filter(Boolean) as string[];

  const hasImages = allImages.length > 0;

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handlePreBuiltClick = () => {
    toast.info("Pre-built project assembly request", {
      description: "To order an assembled/soldered pre-built kit, please add its required components to cart and contact support or request a custom build details.",
    });
  };

  return (
    <div className="bg-[#f2f2f0] text-[#222222] min-h-screen pb-20 lg:pb-12">
      {/* ── Breadcrumb nav ── */}
      <div className="border-b border-[#D8D8C4] bg-[#FAFAED] px-4 sm:px-6 py-3">
        <div className="mx-auto flex max-w-7xl items-center gap-2 text-xs font-medium text-zinc-500">
          <Link href="/" className="hover:text-[#222222] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/projects" className="hover:text-[#222222] transition-colors">Projects</Link>
          <span>/</span>
          <span className="font-semibold text-[#222222] truncate max-w-[200px]">
            {project.title}
          </span>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-12">
          
          {/* ── LEFT COLUMN (Sticky gallery, video tutorial & quick stats) ── */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 self-start space-y-6">
            
            {/* Gallery Card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-4 border border-[#D8D8C4] shadow-xs space-y-4"
            >
              {/* Main Image Slider */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-150 group border border-[#E4E4D8]">
                {hasImages ? (
                  <>
                    <Image
                      src={allImages[selectedImageIndex]}
                      alt={`${project.title} - Image ${selectedImageIndex + 1}`}
                      fill
                      className="object-cover"
                      priority
                    />
                    
                    {allImages.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition cursor-pointer"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition cursor-pointer"
                          aria-label="Next image"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                          {selectedImageIndex + 1} / {allImages.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-10 h-10 text-zinc-300" />
                  </div>
                )}

                {/* Overlay Difficulty & Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                  {project.isFeatured && (
                    <span className="inline-flex items-center rounded bg-[#1CA2D1] px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                      <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                      Featured
                    </span>
                  )}
                  <span className={cn(
                    "rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                    project.difficulty === 'ADVANCED' ? 'bg-red-500 text-white' :
                    project.difficulty === 'INTERMEDIATE' ? 'bg-amber-500 text-white' :
                    'bg-emerald-600 text-white'
                  )}>
                    {getDifficultyLabel(project.difficulty)}
                  </span>
                </div>
              </div>

              {/* Thumbnails strip */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {allImages.map((image, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={cn(
                        "relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 bg-zinc-50 transition cursor-pointer",
                        selectedImageIndex === idx
                          ? "border-[#1CA2D1]"
                          : "border-transparent hover:border-zinc-350"
                      )}
                    >
                      <Image
                        src={image}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Quick stats panel */}
            <div className="bg-white rounded-2xl p-5 border border-[#D8D8C4] shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#222222] uppercase tracking-wider">Build Overview</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {project.estimatedBuildTimeMinutes && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#1CA2D1]/10 rounded-lg text-[#1CA2D1] shrink-0">
                      <Clock className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Duration</p>
                      <p className="text-xs font-semibold text-[#222222] mt-0.5">{formatBuildTime(project.estimatedBuildTimeMinutes)}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#1CA2D1]/10 rounded-lg text-[#1CA2D1] shrink-0">
                    <Eye className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Views</p>
                    <p className="text-xs font-semibold text-[#222222] mt-0.5">{project.viewCount.toLocaleString()} views</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#1CA2D1]/10 rounded-lg text-[#1CA2D1] shrink-0">
                    <Users className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Builds</p>
                    <p className="text-xs font-semibold text-[#222222] mt-0.5">{project.buildCount.toLocaleString()} engineers</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#1CA2D1]/10 rounded-lg text-[#1CA2D1] shrink-0">
                    <Star className="w-4.5 h-4.5 fill-[#1CA2D1]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Rating</p>
                    <p className="text-xs font-semibold text-[#222222] mt-0.5">
                      {project.averageRating ? `${project.averageRating.toFixed(1)} / 5.0` : "No ratings"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tutorial Video */}
            {project.youtubeUrl && (
              <div className="bg-white rounded-2xl p-5 border border-[#D8D8C4] shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-[#222222]">
                  <Play className="w-4 h-4 text-red-500 fill-current" />
                  <span>Tutorial Video</span>
                </div>
                
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-[#E4E4D8]">
                  <iframe
                    src={project.youtubeUrl.replace('watch?v=', 'embed/')}
                    title={`${project.title} Tutorial`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}

          </div>

          {/* ── RIGHT COLUMN (Scrolling content details) ── */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Header Details */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="bg-white rounded-2xl p-6 border border-[#D8D8C4] shadow-xs space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#1CA2D1]">
                  <span>{getCategoryIcon(project.category)}</span>
                  <span>{getCategoryLabel(project.category)}</span>
                </div>
                
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#222222] leading-tight">
                  {project.title}
                </h1>
                
                <p className="text-sm leading-relaxed text-zinc-500 font-medium">
                  {project.summary}
                </p>
              </div>

              {/* Costing Breakdown Card */}
              <div className="p-4 bg-zinc-50 border border-zinc-150 rounded-xl divide-y divide-zinc-200">
                {project.estimatedCostCents && (
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-xs font-bold text-[#222222]">DIY Kit Parts Cost</p>
                      <p className="text-[10px] text-zinc-400">Add parts below to assemble yourself</p>
                    </div>
                    <span className="text-xl font-black text-[#1CA2D1]">
                      {formatProjectPrice(project.estimatedCostCents)}
                    </span>
                  </div>
                )}
                
                {project.preBuiltStock > 0 && project.preBuiltPriceCents && (
                  <div className="flex items-center justify-between py-2 pt-3">
                    <div>
                      <p className="text-xs font-bold text-[#222222]">Pre-Built Assembled Kit</p>
                      <p className="text-[10px] text-zinc-400">Soldered, tested and ready to run</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-[#222222]">
                        {formatProjectPrice(project.preBuiltPriceCents)}
                      </p>
                      <span className="text-[10px] font-bold text-emerald-600">
                        {project.preBuiltStock} units left
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid gap-3 sm:grid-cols-2">
                {project.components && project.components.length > 0 && (
                  <a
                    href="#components"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#222222] hover:bg-[#1CA2D1] text-xs font-bold text-white transition active:scale-95 cursor-pointer shadow-xs"
                  >
                    <Layers className="w-4 h-4 shrink-0" />
                    <span>View Parts List ({project.componentsCount})</span>
                  </a>
                )}
                
                {project.preBuiltStock > 0 && (
                  <button
                    onClick={handlePreBuiltClick}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white border border-[#D8D8C4] hover:bg-zinc-50 text-xs font-bold text-zinc-700 transition active:scale-95 cursor-pointer"
                  >
                    <Package className="w-4 h-4 shrink-0 text-[#1CA2D1]" />
                    <span>Order Pre-Built Kit</span>
                  </button>
                )}
              </div>

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {project.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-zinc-100 border border-zinc-200 px-3 py-0.5 text-xs text-zinc-500 font-semibold"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

            </motion.div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 border border-[#D8D8C4] shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-[#222222]">About This Project</h3>
              <p className="text-sm leading-7 text-zinc-600 whitespace-pre-wrap">
                {project.description}
              </p>
            </div>

            {/* Learning Outcomes */}
            {project.learningOutcomes && project.learningOutcomes.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-[#D8D8C4] shadow-xs space-y-4">
                <h3 className="text-lg font-bold text-[#222222] flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#1CA2D1]" />
                  What You&apos;ll Learn
                </h3>
                
                <ul className="grid gap-3">
                  {project.learningOutcomes.map((outcome, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-zinc-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Prerequisites */}
            {project.prerequisites && project.prerequisites.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-[#D8D8C4] shadow-xs space-y-4">
                <h3 className="text-lg font-bold text-[#222222] flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  Prerequisites
                </h3>
                
                <ul className="grid gap-3">
                  {project.prerequisites.map((prereq, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-zinc-600">
                      <Wrench className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                      <span>{prereq}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* PDF Documentation Resources */}
            {project.pdfUrls && project.pdfUrls.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-[#D8D8C4] shadow-xs space-y-4">
                <h3 className="text-lg font-bold text-[#222222] flex items-center gap-2">
                  <FileText className="w-4.5 h-4.5 text-[#1CA2D1]" />
                  Documentation & Handbooks
                </h3>
                
                <div className="grid gap-3 sm:grid-cols-2">
                  {project.pdfUrls.map((pdfUrl, idx) => {
                    const fileName = pdfUrl.split('/').pop()?.split('?')[0] || `Document ${idx + 1}`;
                    const displayName = fileName
                      .replace(/^\d+-[a-f0-9-]+/, '') // Remove timestamp-uuid prefix
                      .replace(/\.pdf$/i, '') // Remove .pdf extension
                      .replace(/[-_]/g, ' ') // Replace dashes/underscores with spaces
                      .trim() || `Documentation ${idx + 1}`;
                    
                    return (
                      <a
                        key={idx}
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3.5 border rounded-xl hover:border-[#1CA2D1]/40 hover:shadow-xs transition group"
                      >
                        <div className="p-2.5 bg-red-50 text-red-600 rounded-lg shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs text-[#222222] truncate group-hover:text-[#1CA2D1] transition-colors leading-snug">
                            {displayName}
                          </p>
                          <p className="text-[10px] text-zinc-400 mt-0.5">PDF Handbook</p>
                        </div>
                        <Download className="w-4 h-4 text-zinc-300 group-hover:text-[#1CA2D1] transition-colors shrink-0" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* External Links Resources */}
            {project.externalLinks && project.externalLinks.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-[#D8D8C4] shadow-xs space-y-4">
                <h3 className="text-lg font-bold text-[#222222] flex items-center gap-2">
                  <ExternalLink className="w-4.5 h-4.5 text-[#1CA2D1]" />
                  Additional Links
                </h3>
                
                <div className="grid gap-3 sm:grid-cols-2">
                  {project.externalLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3.5 border rounded-xl hover:border-[#1CA2D1]/40 hover:shadow-xs transition group"
                    >
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                        <ExternalLink className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs text-[#222222] truncate group-hover:text-[#1CA2D1] transition-colors leading-snug">
                          {link.title}
                        </p>
                        <p className="text-[10px] text-zinc-400 mt-0.5 truncate">{link.url}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-zinc-300 group-hover:text-[#1CA2D1] transition-colors shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Required Components parts checklist list */}
            {project.components && project.components.length > 0 && (
              <div id="components" className="pt-2">
                <ProjectComponents
                  components={project.components}
                  totalCost={project.totalComponentsCost}
                  projectTitle={project.title}
                />
              </div>
            )}

          </div>
        </div>
      </main>

      {/* ── Mobile Sticky Bottom Action Bar ── */}
      <div className="fixed inset-x-0 bottom-0 z-40 bg-white border-t border-zinc-200 px-4 py-3 shadow-2xl flex items-center justify-between lg:hidden">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">DIY Kit Cost</span>
          <span className="text-base font-black text-[#1CA2D1]">
            {project.estimatedCostCents ? formatProjectPrice(project.estimatedCostCents) : "Calculated below"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {project.components && project.components.length > 0 && (
            <a
              href="#components"
              className="h-10 px-4 rounded-xl bg-[#222222] hover:bg-[#1CA2D1] text-xs font-bold text-white transition active:scale-95 flex items-center gap-1.5 shadow-xs"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Parts List</span>
            </a>
          )}
          
          {project.preBuiltStock > 0 && (
            <button
              onClick={handlePreBuiltClick}
              className="h-10 px-3 rounded-xl border border-[#D8D8C4] hover:bg-zinc-50 text-xs font-bold text-zinc-700 transition active:scale-95 flex items-center justify-center shrink-0"
              aria-label="Order pre-built project"
            >
              <Package className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
