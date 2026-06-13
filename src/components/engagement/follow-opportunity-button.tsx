"use client";

import { Button } from "@/components/ui/button";
import { useHome } from "@/components/home/home-provider";
import type { AccessRecord } from "@/lib/opportunities/types";

export function FollowOpportunityButton({
  record,
  size = "sm",
}: {
  record: AccessRecord;
  size?: "sm" | "default";
}) {
  const { isFollowed, followRecord } = useHome();
  const followed = isFollowed(record.id);

  return (
    <Button
      type="button"
      variant={followed ? "secondary" : "outline"}
      size={size}
      onClick={() => followRecord(record)}
      disabled={followed}
    >
      {followed ? "Following" : "Follow Opportunity"}
    </Button>
  );
}
