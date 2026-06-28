import { BestSellersSection } from "@/features/dashboard/components/BestSellersSection";
import { NewArrivalsSection } from "@/features/dashboard/components/NewArrivalsSection";
import { CategorySection } from "@/features/dashboard/components/CategorySection";
import { FeaturedBuildsSection } from "@/features/dashboard/components/FeaturedBuildsSection";
import { HeroSection } from "@/features/dashboard/components/HeroSection";
import { ProjectVideosSection } from "@/features/dashboard/components/ProjectVideosSection";
import { ServicesSection } from "@/features/dashboard/components/ServicesSection";
import RoborootAiSection from "./Services";

export function LandingPage() {
  return (
    <div className="bg-background text-foreground" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <HeroSection />
      <CategorySection />
      <BestSellersSection />
      <NewArrivalsSection />
      {/* <ServicesSection /> */}
      {/* <ProjectVideosSection /> */}
      <RoborootAiSection />
      {/* <FeaturedBuildsSection /> */}
    </div>
  );
}
