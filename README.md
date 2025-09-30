# MSD SEO Audit Actor

A comprehensive SEO audit actor for Apify that analyzes websites for technical SEO, content quality, and performance metrics. This actor replaces the custom JavaScript code in n8n workflows by providing all SEO analysis functionality directly from Apify.

## Features

### Technical SEO Analysis
- ✅ HTTPS detection
- ✅ Favicon presence
- ✅ Viewport meta tag
- ✅ Charset declaration
- ✅ Canonical URL
- ✅ Meta robots tags
- ✅ OpenGraph tags
- ✅ Twitter Cards
- ✅ Schema markup detection

### Content Analysis
- ✅ Title optimization (length, presence)
- ✅ Meta description optimization
- ✅ Heading structure (H1-H6) analysis
- ✅ Word count analysis
- ✅ Content quality indicators
- ✅ Lorem ipsum detection

### Image Analysis
- ✅ Alt text presence
- ✅ Image optimization checks
- ✅ Image count per page

### Performance Analysis
- ✅ JavaScript file count
- ✅ CSS file count
- ✅ Resource optimization indicators

### Sitemap Analysis
- ✅ Domain-level sitemap detection
- ✅ Sitemap.xml parsing and analysis
- ✅ Robots.txt sitemap references
- ✅ Sitemap type detection (urlset, sitemapindex)
- ✅ Sitemap size and structure analysis

### SEO Scoring
- ✅ Comprehensive scoring algorithm (0-100)
- ✅ Grade assignment (A-F)
- ✅ Category classification
- ✅ Issue identification and reporting

## Installation

1. Clone this repository:
```bash
git clone <repository-url>
cd msd-seo-audit
```

2. Install dependencies:
```bash
npm install
```

3. Deploy to Apify:
```bash
apify deploy
```

## Usage

### Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `startUrls` | Array | Yes | - | Array of URLs to start crawling from |
| `maxRequestsPerCrawl` | Integer | Yes | 5 | Maximum number of pages to crawl and analyze |
| `crawlUrls` | Boolean | No | true | Whether to crawl and analyze multiple pages |
| `includeImages` | Boolean | No | true | Whether to analyze images for alt text |
| `maxImagesPerPage` | Integer | No | 10 | Maximum number of images to analyze per page |
| `waitForPageLoad` | Integer | No | 3000 | Time to wait for page load (milliseconds) |
| `userAgent` | String | No | Custom | User agent string for requests |
| `viewportWidth` | Integer | No | 1920 | Browser viewport width in pixels |
| `viewportHeight` | Integer | No | 1080 | Browser viewport height in pixels |
| `includeSitemapAnalysis` | Boolean | No | true | Whether to perform domain-level sitemap analysis |
| `sitemapTimeout` | Integer | No | 10000 | Timeout for sitemap analysis requests (ms) |

### Example Input

```json
{
  "startUrls": ["https://example.com"],
  "maxRequestsPerCrawl": 10,
  "crawlUrls": true,
  "includeImages": true,
  "maxImagesPerPage": 15,
  "waitForPageLoad": 5000,
  "userAgent": "Mozilla/5.0 (compatible; MSD-SEO-Audit/1.0)",
  "viewport": {
    "width": 1920,
    "height": 1080
  }
}
```

### Output Format

The actor returns comprehensive SEO data with both domain-level and page-level analysis:

```json
{
  "domain_analysis": {
    "domain": "https://example.com",
    "sitemap_url": "https://example.com/sitemap.xml",
    "hasSitemap": true,
    "sitemap_type": "urlset",
    "sitemap_size": 25,
    "sitemap_lastmod": "2024-01-15T10:30:00.000Z",
    "sitemap_count": 1,
    "sitemap_error": null
  },
  "pages": [
    {
      "url": "https://example.com",
      "title": "Page Title",
      "titleLength": 12,
      "description": "Meta description text",
      "descriptionLength": 156,
      "language": "en",
      "hasHttps": true,
      "favicon": true,
      "viewport": true,
      "charset": true,
      "canonicalUrl": "https://example.com/",
      "hasCanonical": true,
      "metaRobots": "index, follow",
      "xRobots": "",
      "hasOpenGraph": true,
      "hasTwitterCards": false,
      "meta_indexed": 1,
      "h1": ["Main Heading"],
      "h2": ["Subheading 1", "Subheading 2"],
      "h3": [],
      "h4": [],
      "h5": [],
      "h6": [],
      "h1Count": 1,
      "h2Count": 2,
      "h3Count": 0,
      "h4Count": 0,
      "h5Count": 0,
      "h6Count": 0,
      "words": 1250,
      "paragraphs": 8,
      "strongTags": 5,
      "loremIpsum": false,
      "internalLinksCount": 15,
      "externalLinksCount": 3,
      "averageAnchorTextLength": 12,
      "imagesWithoutAlt": 2,
      "images_list": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
      "hasJsonLd": true,
      "hasMicrodata": false,
      "hasSchema": true,
      "javascriptFiles": 8,
      "cssFiles": 3,
      "sitemap_url": "https://example.com/sitemap.xml",
      "hasSitemap": true,
      "sitemap_type": "urlset",
      "sitemap_size": 25,
      "seo_page_score": 85,
      "seo_grade": "B",
      "seo_category": "Good",
      "seo_issues_count": 3,
      "notes": "Issues: 2 images without alt text, title could be longer | Strengths: HTTPS enabled, OpenGraph present, good content length, proper H1 structure",
      "analysis_date": "2024-01-15T10:30:00.000Z",
      "data_source": "msd_seo_audit"
    }
  ],
  "summary": {
    "total_pages_analyzed": 1,
    "analysis_date": "2024-01-15T10:30:00.000Z",
    "domain": "https://example.com",
    "data_source": "msd_seo_audit"
  }
}
```

## SEO Scoring Algorithm

The actor uses a comprehensive scoring system (0-100 points):

### Title Optimization (25 points)
- Missing/short title: -15 points
- Title too long (>60 chars): -8 points
- Title could be longer (<30 chars): -5 points

### Meta Description (20 points)
- Missing/short description: -12 points
- Description too long (>160 chars): -6 points

### Heading Structure (20 points)
- Missing H1: -18 points
- Multiple H1 tags: -12 points
- Good hierarchy bonus: +2-3 points

### Technical SEO (20 points)
- No HTTPS: -10 points
- No favicon: -3 points
- No OpenGraph: -4 points
- No viewport: -3 points
- Noindex directive: Cap at 25 points

### Content Quality (10 points)
- Very low word count (<150): -8 points
- Low word count (<300): -5 points
- Good content (≥800 words): +2 points
- No emphasis tags: -2 points

### Image Optimization (5 points)
- Images without alt text: -1 point each (max -5)

### Advanced Features (5 points bonus)
- Schema/JSON-LD: +2 points
- Canonical URL: +1 point
- Hreflang: +1 point
- Apple touch icon: +1 point

### Performance Penalties
- Too many JS files (>20): -3 points
- Too many CSS files (>10): -2 points

## Development

### Running Locally

```bash
# Install dependencies
npm install

# Run locally
npm start

# Run with Apify CLI
apify run
```

### Testing

```bash
npm test
```

### Project Structure

```
msd-seo-audit/
├── src/
│   ├── main.js              # Main actor entry point
│   ├── seo-analyzer.js      # Core SEO analysis logic
│   ├── url-normalizer.js    # URL normalization utilities
│   └── seo-scorer.js        # SEO scoring algorithm
├── tests/                   # Test files
├── package.json
├── apify.json              # Apify actor configuration
├── input_schema.json       # Input parameter schema
├── Dockerfile              # Docker configuration
└── README.md
```

## Integration with n8n

This actor replaces the custom JavaScript code in your n8n SEO workflow. Simply:

1. Deploy this actor to Apify
2. Update your n8n workflow to call this actor instead of `louisdeconinck~seo-checker`
3. Remove all the custom JavaScript processing nodes
4. Use the comprehensive output directly

### n8n Integration Example

```javascript
// In your n8n HTTP Request node
{
  "method": "POST",
  "url": "https://api.apify.com/v2/acts/YOUR_USERNAME~msd-seo-audit/run-sync-get-dataset-items?token={{$vars.APIFY_TOKEN}}",
  "jsonBody": {
    "startUrls": [{"url": "{{ $json.normalized_url }}"}],
    "maxRequestsPerCrawl": {{ $json.maxPages }},
    "crawlUrls": true,
    "includeImages": true,
    "maxImagesPerPage": 10
  }
}
```

## Environment Variables

- `APIFY_TOKEN`: Your Apify API token (for deployment)

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions, please create an issue in the repository or contact the development team.
