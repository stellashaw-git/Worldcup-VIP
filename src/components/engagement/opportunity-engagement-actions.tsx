"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FollowOpportunityButton } from "@/components/engagement/follow-opportunity-button";
import { useHome } from "@/components/home/home-provider";
import type { AccessRecord } from "@/lib/opportunities/types";

export function OpportunityEngagementActions({
  record,
  size = "sm",
}: {
  record: AccessRecord;
  size?: "sm" | "default";
}) {
  const { requestUpdates } = useHome();
  const [updateRequested, setUpdateRequested] = useState(false);

  async function handleRequestUpdates() {
    await requestUpdates(record);
    setUpdateRequested(true);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <FollowOpportunityButton record={record} size={size} />
      <Button
        type="button"
        variant="outline"
        size={size}
        disabled={updateRequested}
        onClick={handleRequestUpdates}
      >
        {updateRequested ? "Update requested" : "Request Updates"}
      </Button>
    </div>
  );
}
