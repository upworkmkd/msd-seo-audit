# Monetization Events - MSD SEO Audit Actor

This document describes the monetization events (usage counters) configured for the MSD SEO Audit Actor on the Apify platform.

## Actor Information

- **Actor ID:** `msd-seo-audit`
- **Actor Name:** MSD SEO Audit Actor
- **Description:** Comprehensive SEO audit actor that analyzes websites for technical SEO, content quality, and performance metrics

## Monetization Events

### PAGE_ANALYZED

**Label:** Pages analyzed  
**Description:** Number of web pages analyzed for comprehensive SEO audit

**When It's Triggered:**
- Every time a page is successfully analyzed (regardless of crawl mode)
- Triggered for each page processed, including:
  - The start URL(s) provided in input
  - Any additional pages discovered during crawling (if `crawlUrls` is enabled)
- Only counts pages that are actually analyzed (not skipped duplicates)

**Implementation Location:**
- File: `src/main.js`
- Line: After each page analysis completes successfully
- Code: `await Actor.incrementUsageCounter('PAGE_ANALYZED');`

**Usage in Apify:**
```json
{
  "usageCounters": {
    "PAGE_ANALYZED": {
      "label": "Pages analyzed",
      "description": "Number of web pages analyzed for comprehensive SEO audit"
    }
  }
}
```

## Implementation Details

### Code Pattern

The monetization event is incremented after successful page analysis:

```javascript
// After page analysis completes
results.push(result);

// Track this page analysis as a billable event for monetization
await Actor.incrementUsageCounter('PAGE_ANALYZED');

console.log(`Completed analysis for: ${normalizedUrl} (Status: ${statusCode})`);
```

### Event Triggering Rules

1. **Success Only**: Events are only incremented on successful page analysis, not on errors
2. **No Duplicates**: URL normalization ensures pages aren't counted twice (duplicate URLs are skipped)
3. **Per Page**: Each page analyzed increments the counter by 1, regardless of:
   - Page size
   - Number of issues found
   - Analysis depth

### Configuration

The usage counter is defined in `.actor/actor.json`:

```json
{
  "usageCounters": {
    "PAGE_ANALYZED": {
      "label": "Pages analyzed",
      "description": "Number of web pages analyzed for comprehensive SEO audit"
    }
  }
}
```

## Adding to Apify Platform

To add this event to your Apify actor:

1. Navigate to your actor in Apify Console
2. Go to **Settings** → **Monetization**
3. Add usage counter:
   - **Counter Name:** `PAGE_ANALYZED`
   - **Label:** "Pages analyzed"
   - **Description:** "Number of web pages analyzed for comprehensive SEO audit"
4. Set pricing per event as needed

## Monitoring Usage

Usage counters can be monitored via:

1. **Apify Console:** Actor → Runs → View usage statistics
2. **Apify API:** `GET /v2/actor-runs/{runId}` → `usage` property
3. **Actor Logs:** Console logs show billable event counts:
   ```
   Billable events (pages analyzed): 5
   ```

## Example Usage

If a user runs the actor with:
- `startUrls`: `["https://example.com"]`
- `crawlUrls`: `true`
- `maxRequestsPerCrawl`: `10`

And the actor analyzes 8 pages (1 start URL + 7 crawled pages), the `PAGE_ANALYZED` counter will be incremented 8 times.

---

**Last Updated:** 2025-01-XX

