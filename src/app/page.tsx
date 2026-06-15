import { HeroSection } from "@/components/home/hero-section";
import { EditorsPicksSection } from "@/components/home/editors-picks-section";
import { MemberApplicationSection } from "@/components/home/member-application-section";

export default function Home() {
  return (
    <>
      <HeroSection />
      <EditorsPicksSection />
      <MemberApplicationSection />
    </>
  );
}
