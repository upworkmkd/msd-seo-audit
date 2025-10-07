# Development Guide

This document contains development-related information for the MSD SEO Audit Actor.

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

## Testing

```bash
npm test
```

## Project Structure

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
