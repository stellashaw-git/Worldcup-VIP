import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CityPageContent } from "@/components/browse/city-page-content";
import { getCityBySlug } from "@/lib/opportunities/hierarchy";
import { getPublicDirectoryRecords } from "@/lib/opportunities/public-directory";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const city = getCityBySlug(slug);

  if (!city) {
    return { title: "Host City | BLACKBOOK" };
  }

  return {
    title: `${city.headline} World Cup Access | BLACKBOOK`,
    description: city.hook,
  };
}

export default async function CityPage({ params }: PageProps) {
  const { slug } = await params;
  const city = getCityBySlug(slug);

  if (!city) {
    notFound();
  }

  const records = await getPublicDirectoryRecords();

  return <CityPageContent citySlug={slug} records={records} />;
}
