import { SiteHeader } from "@/components/layout/site-header";
import { HeroSection } from "@/components/home/hero-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { HomeDynamicSections } from "@/components/home/home-dynamic-sections";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col w-full">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <HomeDynamicSections />
      </main>
    </div>
  );
}
