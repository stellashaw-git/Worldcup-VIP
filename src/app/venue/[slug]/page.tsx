import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VenuePageContent } from "@/components/browse/venue-page-content";
import { getVenueBySlug } from "@/lib/opportunities/hierarchy";
import { getPublicDirectoryRecords } from "@/lib/opportunities/public-directory";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const venue = getVenueBySlug(slug);

  if (!venue) {
    return { title: "Venue | BLACKBOOK" };
  }

  return {
    title: `${venue.name} Hospitality | BLACKBOOK`,
    description:
      venue.hook ??
      `World Cup 2026 hospitality packages and premium access at ${venue.name}.`,
  };
}

export default async function VenuePage({ params }: PageProps) {
  const { slug } = await params;
  const venue = getVenueBySlug(slug);

  if (!venue) {
    notFound();
  }

  const records = await getPublicDirectoryRecords();

  return <VenuePageContent venueSlug={slug} records={records} />;
}
