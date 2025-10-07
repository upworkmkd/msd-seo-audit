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

## Support

For issues and questions, please create an issue in the repository or contact the development team.
