import type {
  RssAction,
  RssCount,
  RssItem,
  RssSearchInput,
  RssStats
} from "./types";

export { RSS_SEED_ITEMS } from "./seed";
export { RSS_ACTIONS } from "./types";
export type {
  RssAction,
  RssCount,
  RssItem,
  RssRecentInput,
  RssSearchInput,
  RssStats
} from "./types";

export const RSS_SOURCE_URLS = [
  "https://www.canada.ca/content/dam/hc-sc/migration/hc-sc/rss/dhp-mps/drugs-drogues-eng.xml",
  "https://www.gazette.gc.ca/rss/p2-eng.xml",
  "https://www.gazette.gc.ca/rss/p1-eng.xml",
  "https://www.canada.ca/content/dam/hc-sc/migration/hc-sc/rss/dhp-mps/devices-instruments-eng.xml",
  "https://www.canada.ca/content/dam/hc-sc/migration/hc-sc/rss/dhp-mps/nhp-psn-eng.xml",
  "https://www.canada.ca/content/dam/hc-sc/migration/hc-sc/rss/dhp-mps/nhpid-bdipsn-eng.xml",
  "https://www.canada.ca/content/dam/hc-sc/migration/hc-sc/rss/dhp-mps/new-neuf-eng.xml",
  "https://www.canada.ca/content/dam/hc-sc/migration/hc-sc/rss/dhp-mps/compli-conform-eng.xml",
  "https://www.canada.ca/content/dam/hc-sc/migration/hc-sc/rss/dhp-mps/prod-eng.xml"
] as const;

export const CATEGORY_ACTION_MAPPING = {
  CTA: "Track & assess",
  "Device/Drug Combo": "Track & assess",
  Drug: "Track & assess",
  "HC Forms (RT-REP)": "Track & assess",
  "HC lists": "Track & assess",
  ICH: "Track & assess",
  "MD (medical devices)": "Track & assess",
  OTC: "Track & assess",
  Reliance: "Track & assess",
  "Real World Evidence": "Track & assess",
  "Biosimilars Pharmacovigilence Related": "Track & assess",
  DEL: "Track and inform",
  MDEL: "Track and inform",
  GMP: "Track and inform",
  Cosmetics: "Track and inform",
  "Drug Supply": "Track and inform",
  "Health Care System": "Track and inform",
  NHP: "Track and inform",
  Vaccines: "Track and inform",
  "Food/Vitamin/Dietary Suplement": "Not tracked",
  Narcotic: "Not tracked",
  Nicotine: "Not tracked",
  Veterinary: "Not tracked"
} as const satisfies Record<string, RssAction>;

export const DEFAULT_RSS_LIMIT = 8;
export const MAX_RSS_LIMIT = 20;

export interface RssItemRow {
  id: string;
  title: string;
  link: string;
  pub_date: string;
  published_at: number;
  category: string;
  action: RssAction;
}

export function normalizeRssLimit(
  limit: number | undefined,
  fallback = DEFAULT_RSS_LIMIT
): number {
  if (limit === undefined || !Number.isFinite(limit)) return fallback;
  return Math.max(1, Math.min(MAX_RSS_LIMIT, Math.floor(limit)));
}

export function rssRowToItem(row: RssItemRow): RssItem {
  return {
    id: row.id,
    title: row.title,
    link: row.link,
    pubDate: row.pub_date,
    publishedAt: row.published_at,
    category: row.category,
    action: row.action
  };
}

export function matchesRssSearch(
  item: RssItem,
  input: RssSearchInput
): boolean {
  if (input.action && item.action !== input.action) return false;
  if (
    input.category &&
    item.category.toLowerCase() !== input.category.toLowerCase()
  ) {
    return false;
  }

  const query = input.query?.trim().toLowerCase();
  if (!query) return true;

  const haystack = [
    item.title,
    item.category,
    item.action,
    item.pubDate,
    item.link
  ]
    .join(" ")
    .toLowerCase();

  return query.split(/\s+/).every((term) => haystack.includes(term));
}

export function createEmptyRssStats(): RssStats {
  return {
    total: 0,
    latestPubDate: null,
    latestPublishedAt: null,
    actionCounts: [],
    categoryCounts: []
  };
}

export function sortCounts(rows: RssCount[]): RssCount[] {
  return [...rows].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name)
  );
}
