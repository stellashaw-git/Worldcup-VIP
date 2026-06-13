import { LaunchCtaSection } from "@/components/home/launch-cta-section";
import { HeroSection } from "@/components/home/hero-section";
import { AccessTrackerSection } from "@/components/home/access-tracker-section";
import { TrendingNowSection } from "@/components/home/trending-now-section";
import { MostFollowedSection } from "@/components/home/most-followed-section";
import { WorldCupPulseSection } from "@/components/home/world-cup-pulse-section";
import { OpportunitiesSection } from "@/components/home/opportunities-section";
import { WaitlistSection } from "@/components/home/waitlist-section";

export default function Home() {
  return (
    <>
      <HeroSection />
      <LaunchCtaSection />
      <AccessTrackerSection />
      <TrendingNowSection />
      <MostFollowedSection />
      <WorldCupPulseSection />
      <OpportunitiesSection />
      <WaitlistSection />
    </>
  );
}
