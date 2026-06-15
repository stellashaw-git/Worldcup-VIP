import { HeroSection } from "@/components/home/hero-section";
import { WeeklyPicksSection } from "@/components/home/weekly-picks-section";
import { WhyPicksSection } from "@/components/home/why-picks-section";
import { JoinUpdatesSection } from "@/components/home/join-updates-section";

export default function Home() {
  return (
    <>
      <HeroSection />
      <WeeklyPicksSection />
      <WhyPicksSection />
      <JoinUpdatesSection />
    </>
  );
}
