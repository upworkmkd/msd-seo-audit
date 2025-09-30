# 📋 MSD SEO Audit - General Information

## Overview
This document provides comprehensive information about the MSD SEO Audit actor, including processes, best practices, troubleshooting, and operational guidelines.

## 🚀 Quick Start Guide

### Basic Usage
```javascript
// Single page analysis
{
  "startUrls": ["https://example.com"],
  "maxRequestsPerCrawl": 1,
  "crawlUrls": false,
  "includeImages": true,
  "maxImagesPerPage": 10
}

// Full site audit
{
  "startUrls": ["https://example.com"],
  "maxRequestsPerCrawl": 20,
  "crawlUrls": true,
  "includeImages": true,
  "maxImagesPerPage": 10
}
```

### Output Types
The actor returns two types of records:
1. **Page-level analysis** (individual pages)
2. **Domain-level summary** (aggregated metrics)

## 🔧 Configuration Options

### Input Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `startUrls` | Array | `["https://example.com"]` | URLs to start crawling from |
| `maxRequestsPerCrawl` | Number | `5` | Maximum pages to analyze |
| `crawlUrls` | Boolean | `true` | Whether to crawl internal links |
| `includeImages` | Boolean | `true` | Whether to analyze images |
| `maxImagesPerPage` | Number | `10` | Maximum images to analyze per page |
| `userAgent` | String | `"Mozilla/5.0 (compatible; MSD-SEO-Audit/1.0)"` | User agent for requests |
| `viewportWidth` | Number | `1920` | Browser viewport width |
| `viewportHeight` | Number | `1080` | Browser viewport height |

### Rate Limiting
- **Requests per minute:** 30 (to avoid overwhelming servers)
- **Image analysis timeout:** 5 seconds per image
- **SSL certificate check timeout:** 10 seconds
- **Page analysis timeout:** 30 seconds

## 📊 Data Fields Explanation

### Page-Level Fields

#### Basic Information
- `url` - The analyzed page URL
- `title` - Page title tag content
- `titleLength` - Length of title in characters
- `titleDuplicateWords` - Number of duplicate words in title
- `description` - Meta description content
- `descriptionLength` - Length of meta description
- `language` - Detected page language

#### Technical SEO
- `hasHttps` - Whether page uses HTTPS
- `viewport` - Whether viewport meta tag exists
- `charset` - Whether charset is specified
- `favicon` - Whether favicon is present
- `metaRobots` - Meta robots directive
- `xRobots` - X-Robots-Tag directive
- `canonicalUrl` - Canonical URL if specified

#### Content Analysis
- `h1`, `h2`, `h3`, `h4`, `h5`, `h6` - Heading tag arrays
- `h1Count`, `h2Count`, etc. - Heading counts
- `words` - Total word count
- `paragraphs` - Number of paragraphs
- `strongTags` - Number of strong tags
- `loremIpsum` - Whether lorem ipsum content detected

#### Link Analysis
- `internalLinks` - Array of internal links
- `internalLinksCount` - Number of internal links
- `externalLinks` - Array of external links
- `externalLinksCount` - Number of external links
- `averageAnchorTextLength` - Average anchor text length

#### Image Analysis
- `images` - Array of image objects with detailed metadata
- `imagesWithoutAlt` - Number of images missing alt text

#### Structured Data
- `hasJsonLd` - Whether JSON-LD structured data exists
- `hasMicrodata` - Whether microdata exists
- `hasSchema` - Whether schema.org markup exists
- `hasOpenGraph` - Whether OpenGraph tags exist
- `hasTwitterCards` - Whether Twitter Card tags exist

#### Performance Metrics
- `javascriptFiles` - Number of JavaScript files
- `cssFiles` - Number of CSS files

### Domain-Level Fields

#### Summary Metrics
- `domain` - Domain name
- `analysis_type` - "domain_summary"
- `total_pages_analyzed` - Total pages processed
- `seo_score` - Average SEO score (0-100)
- `seo_grade` - Overall grade (A-F)
- `overall_grade` - Same as seo_grade

#### Statistical Analysis
- `pages_with_h1` - Pages with H1 tags
- `pages_with_h1_percentage` - Percentage of pages with H1
- `pages_with_meta_description` - Pages with meta descriptions
- `pages_with_meta_description_percentage` - Percentage
- `pages_with_images` - Pages with images
- `pages_with_images_percentage` - Percentage
- `pages_with_errors` - Pages with errors
- `pages_with_errors_percentage` - Error rate percentage

#### Averages
- `average_title_length` - Average title length
- `average_description_length` - Average description length
- `average_words_per_page` - Average words per page
- `average_internal_links` - Average internal links per page

#### SSL Certificate Information
- `ssl_certificate_info.is_valid` - Certificate validity
- `ssl_certificate_info.valid_until` - Expiration date
- `ssl_certificate_info.days_until_expiry` - Days until expiry
- `ssl_certificate_info.issuer` - Certificate issuer
- `ssl_certificate_info.subject` - Certificate subject
- `ssl_certificate_info.status` - Certificate status

## 🔍 SEO Analysis Process

### 1. URL Discovery
- Start with provided URLs
- Extract internal links if `crawlUrls` is true
- Follow links within same domain
- Respect robots.txt (if implemented)

### 2. Page Analysis
- Fetch page HTML content
- Parse with Cheerio for DOM analysis
- Extract all SEO-relevant elements
- Analyze technical implementation

### 3. Content Analysis
- Extract text content
- Count words, paragraphs, headings
- Analyze keyword usage
- Check for duplicate content

### 4. Link Analysis
- Extract all internal and external links
- Analyze link structure
- Calculate anchor text distribution
- Check for broken links (basic)

### 5. Image Analysis
- Extract image URLs and metadata
- Check alt text completeness
- Analyze image sizes and types
- Test image accessibility

### 6. Technical Analysis
- Check HTTPS implementation
- Verify meta tags
- Analyze structured data
- Check mobile responsiveness

### 7. SSL Analysis
- Connect to HTTPS endpoint
- Extract certificate information
- Calculate expiry status
- Assess certificate strength

### 8. Scoring Calculation
- Apply individual scoring algorithms
- Aggregate page-level scores
- Calculate domain averages
- Generate final grades

## 🚨 Error Handling

### Common Issues

#### 1. Network Timeouts
- **Cause:** Slow or unresponsive websites
- **Solution:** Increase timeout settings
- **Impact:** Some pages may be skipped

#### 2. SSL Certificate Errors
- **Cause:** Invalid or self-signed certificates
- **Solution:** Certificate analysis continues with warnings
- **Impact:** SSL score affected but analysis completes

#### 3. JavaScript-Heavy Pages
- **Cause:** Pages that rely heavily on JavaScript
- **Solution:** HTML analysis still works, dynamic content noted
- **Impact:** Some content may not be fully analyzed

#### 4. Rate Limiting
- **Cause:** Websites blocking frequent requests
- **Solution:** Respectful crawling with delays
- **Impact:** Analysis may take longer

### Error Recovery
- Failed pages are logged with error details
- Domain analysis continues even if some pages fail
- Partial results are still valuable
- Retry mechanism for transient errors

## 🔄 Data Processing Flow

```
Input URLs
    ↓
URL Normalization
    ↓
Page Fetching (Parallel)
    ↓
HTML Parsing
    ↓
SEO Element Extraction
    ↓
Individual Page Analysis
    ↓
Scoring Calculation
    ↓
Domain Aggregation
    ↓
SSL Certificate Check
    ↓
Final Output Generation
```

## 📈 Performance Considerations

### Optimization Strategies
- **Parallel Processing:** Multiple pages analyzed simultaneously
- **Incremental Updates:** Only re-analyze changed pages
- **Caching:** Store results to avoid redundant analysis
- **Selective Analysis:** Focus on most important pages first

### Scalability
- **Memory Management:** Process large sites in batches
- **Timeout Handling:** Prevent hanging on slow pages
- **Resource Limits:** Configurable limits for large sites
- **Progress Tracking:** Real-time status updates

## 🔐 Security Considerations

### Data Protection
- No sensitive data storage
- HTTPS-only communications
- Secure API token handling
- Minimal data retention

### Privacy Compliance
- Respect robots.txt
- No personal data collection
- Transparent analysis process
- GDPR-compliant operations

## 🤝 Integration Guidelines

### With n8n
- Use the provided workflow template
- Configure API tokens securely
- Set appropriate crawling limits
- Schedule regular audits

### With Other Tools
- Export results to CSV/JSON
- Integrate with BI dashboards
- Connect to alerting systems
- Feed into reporting pipelines

## 📞 Support and Troubleshooting

### Common Questions

#### Q: Why are some pages missing from analysis?
A: Pages may be skipped due to:
- Network timeouts
- Access restrictions
- JavaScript-only content
- Rate limiting

#### Q: How often should I run audits?
A: Recommended frequency:
- Small sites: Weekly
- Medium sites: Bi-weekly
- Large sites: Monthly
- Enterprise sites: Quarterly

#### Q: What do the scores mean?
A: Scores are calculated based on:
- SEO best practices
- Technical implementation
- Content quality
- User experience factors

### Getting Help
- Check actor logs for detailed error information
- Review calculation logic documentation
- Validate input parameters
- Test with sample URLs first

## 📋 Best Practices

### For Optimal Results
1. **Start Small:** Begin with 5-10 pages to validate setup
2. **Monitor Performance:** Watch for timeouts and errors
3. **Review Regularly:** Schedule automated audits
4. **Act on Insights:** Use results to improve SEO
5. **Combine Data:** Correlate with other analytics tools

### Configuration Tips
- Set realistic page limits for large sites
- Use appropriate user agents
- Configure timeouts based on site speed
- Enable image analysis for visual content
- Review SSL settings for security-focused sites

---

## 📝 Version History

### v1.0.0
- Initial release with basic SEO analysis
- Page-level and domain-level scoring
- Image analysis capabilities
- SSL certificate checking
- Comprehensive documentation

### Planned Enhancements
- Performance metrics (Core Web Vitals)
- Accessibility compliance testing
- Advanced content analysis
- Link authority scoring
- Schema.org validation

---

*For technical support or feature requests, please refer to the project documentation or contact the development team.*
