export const RSS_ACTIONS = [
  "Track & assess",
  "Track and inform",
  "Not tracked",
  "Manual Review"
] as const;

export type RssAction = (typeof RSS_ACTIONS)[number];

export interface RssSeedItem {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  publishedAt: number;
  category: string;
  action: RssAction;
}

export type RssItem = RssSeedItem;

export interface RssSearchInput {
  query?: string;
  action?: RssAction;
  category?: string;
  limit?: number;
}

export interface RssRecentInput {
  action?: RssAction;
  limit?: number;
}

export interface RssCount {
  name: string;
  count: number;
}

export interface RssStats {
  total: number;
  latestPubDate: string | null;
  latestPublishedAt: number | null;
  actionCounts: RssCount[];
  categoryCounts: RssCount[];
}
