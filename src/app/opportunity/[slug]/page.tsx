import type { Metadata } from "next";
import { OpportunityDetailClient } from "@/components/opportunity/opportunity-detail-client";
import { OpportunityDetailView } from "@/components/opportunity/opportunity-detail-view";
import {
  getGroupedEventByKey,
  getRecordBySlug,
} from "@/lib/opportunities/cache";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const record = getRecordBySlug(slug);

  if (!record) {
    return { title: "Access Record | BLACKBOOK" };
  }

  return {
    title: `${record.matchName} | BLACKBOOK`,
    description: record.summary,
  };
}

export default async function OpportunityPage({ params }: PageProps) {
  const { slug } = await params;
  const record = getRecordBySlug(slug);

  if (record) {
    const groupedEvent = getGroupedEventByKey(record.groupKey);
    return <OpportunityDetailView record={record} groupedEvent={groupedEvent} />;
  }

  return <OpportunityDetailClient slug={slug} />;
}
