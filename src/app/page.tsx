import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { HeroSection } from "@/components/home/hero-section";
import { FavoriteFlavorsSection } from "@/components/home/favorite-flavors-section";
import { CheffyBenefitsSection } from "@/components/home/cheffy-benefits-section";
import { HomeDynamicSections } from "@/components/home/home-dynamic-sections";
import { CookWithCheffySection } from "@/components/home/cook-with-cheffy-section";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col w-full">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <FavoriteFlavorsSection />
        <CheffyBenefitsSection />
        <HomeDynamicSections />
        <CookWithCheffySection />
      </main>
      <SiteFooter />
    </div>
  );
}
