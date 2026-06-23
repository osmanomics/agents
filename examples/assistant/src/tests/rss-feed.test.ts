import { env } from "cloudflare:workers";
import { describe, expect, it } from "vitest";
import { getAgentByName, getSubAgentByName } from "agents";
import { MyAssistant } from "../../agents/assistant/agents/my-assistant/agent";
import { RSS_SEED_ITEMS } from "../../agents/assistant/rss";
import { uniqueDirectoryName } from "./helpers";
import type { RssAction } from "../../agents/assistant/rss";

function expectedActionCount(action: RssAction): number {
  return RSS_SEED_ITEMS.filter((item) => item.action === action).length;
}

async function freshDirectory() {
  return getAgentByName(env.AssistantDirectory, uniqueDirectoryName("rss"));
}

describe("AssistantDirectory regulatory RSS feed", () => {
  it("seeds RSS items once on startup", async () => {
    const directory = await freshDirectory();

    const stats = await directory.getRssStats();
    expect(stats.total).toBe(RSS_SEED_ITEMS.length);

    // A second read proves the seed path is idempotent for an already-started DO.
    const statsAgain = await directory.getRssStats();
    expect(statsAgain.total).toBe(RSS_SEED_ITEMS.length);
  });

  it("searches known seeded records by text and action", async () => {
    const directory = await freshDirectory();

    const results = await directory.searchRssItems({
      action: "Track and inform",
      limit: 5,
      query: "MDEL"
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toMatchObject({
      action: "Track and inform",
      category: "MDEL"
    });
  });

  it("returns recent items in descending publication order", async () => {
    const directory = await freshDirectory();

    const results = await directory.recentRssItems({ limit: 8 });
    expect(results).toHaveLength(8);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].publishedAt).toBeGreaterThanOrEqual(
        results[i].publishedAt
      );
    }
  });

  it("reports action and category stats from the seeded feed", async () => {
    const directory = await freshDirectory();

    const stats = await directory.getRssStats();
    expect(
      stats.actionCounts.find((entry) => entry.name === "Track & assess")?.count
    ).toBe(expectedActionCount("Track & assess"));
    expect(
      stats.actionCounts.find((entry) => entry.name === "Track and inform")
        ?.count
    ).toBe(expectedActionCount("Track and inform"));
    expect(
      stats.categoryCounts.find((entry) => entry.name === "Drug")?.count
    ).toBeGreaterThan(0);
  });

  it("lets a child assistant read RSS records through the parent directory", async () => {
    const directory = await freshDirectory();
    const { id } = await directory.createChat({ title: "RSS" });
    const child = await getSubAgentByName(directory, MyAssistant, id);

    const results = await child.searchRegulatoryFeed({
      action: "Track & assess",
      limit: 3,
      query: "Drug"
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].action).toBe("Track & assess");
  });
});
