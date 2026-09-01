import { BestSellersSection } from "@/features/dashboard/components/BestSellersSection";
import { NewArrivalsSection } from "@/features/dashboard/components/NewArrivalsSection";
import { CategorySection } from "@/features/dashboard/components/CategorySection";
import { FeaturedBuildsSection } from "@/features/dashboard/components/FeaturedBuildsSection";
import { HeroSection } from "@/features/dashboard/components/HeroSection";
import { ProjectVideosSection } from "@/features/dashboard/components/ProjectVideosSection";
import { ServicesSection } from "@/features/dashboard/components/ServicesSection";
import { SuggestionForYouSection } from "@/features/dashboard/components/SuggestionForYouSection";

export function LandingPage() {
  return (
    <div className="relative bg-background text-foreground min-h-screen" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="relative z-10">
        <HeroSection />
        <CategorySection />
        <NewArrivalsSection />
        <BestSellersSection />
        <SuggestionForYouSection />
        <ServicesSection />
        {/* <ProjectVideosSection /> */}
        {/* <FeaturedBuildsSection /> */}
      </div>
    </div>
  );
}
