export type EngagementAction = "view" | "follow" | "request-update" | "waitlist";

export type RecordEngagement = {
  views: number;
  follows: number;
  updateRequests: number;
  waitlistJoins: number;
};

export type TrackerMetrics = {
  opportunitiesTracked: number;
  newUpdatesThisWeek: number;
  hostCitiesCovered: number;
  premiumExperiencesListed: number;
};

export type TrendingItem = {
  id: string;
  label: string;
  description: string;
  recordId?: string;
  slug?: string;
};

export type FollowedItem = {
  recordId: string;
  slug: string;
  label: string;
  sublabel: string;
  followers: number;
  updateRequests: number;
  lastUpdated: string;
};

export type PulseItem = {
  label: string;
  score: number;
};

export type MarketInsights = {
  tracker: TrackerMetrics;
  trending: TrendingItem[];
  mostFollowed: FollowedItem[];
  pulse: {
    teams: PulseItem[];
    matches: PulseItem[];
    cities: PulseItem[];
    categories: PulseItem[];
  };
  recordEngagement: Record<string, RecordEngagement>;
};

export type EngagementPostBody = {
  action: EngagementAction;
  recordId: string;
  meta?: {
    team?: string;
    city?: string;
    category?: string;
    matchStage?: string;
  };
};
