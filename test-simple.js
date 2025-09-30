// Simple test without Apify dependencies
const { SEOAnalyzer } = require('./src/seo-analyzer');
const { URLNormalizer } = require('./src/url-normalizer');
const { SEOScorer } = require('./src/seo-scorer');

// Mock page object for testing
const mockPage = {
    evaluate: async () => ({ scripts: 5, stylesheets: 2 })
};

async function testSEOAnalysis() {
    console.log('Testing MSD SEO Audit Actor (Simple Test)...\n');
    
    const analyzer = new SEOAnalyzer();
    const normalizer = new URLNormalizer();
    const scorer = new SEOScorer();
    
    // Test URL normalization
    console.log('Testing URL normalization:');
    const testUrls = [
        'https://example.com/',
        'http://example.com/path/',
        'https://EXAMPLE.COM/Path?utm_source=test#section',
        'example.com'
    ];
    
    testUrls.forEach(url => {
        const normalized = normalizer.normalize(url);
        console.log(`  ${url} -> ${normalized}`);
    });
    
    console.log('\nTesting SEO analysis with sample HTML...');
    
    // Sample HTML for testing
    const sampleHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Test SEO Page - Comprehensive Analysis</title>
            <meta name="description" content="This is a comprehensive test page for SEO analysis with proper meta tags and content structure">
            <meta name="robots" content="index, follow">
            <link rel="canonical" href="https://example.com/test-page">
            <link rel="icon" href="/favicon.ico">
            <meta property="og:title" content="Test SEO Page">
            <meta property="og:description" content="Test page for SEO analysis">
            <script type="application/ld+json">
            {
                "@context": "https://schema.org",
                "@type": "WebPage",
                "name": "Test SEO Page"
            }
            </script>
        </head>
        <body>
            <h1>Main Page Title</h1>
            <h2>Important Section</h2>
            <p>This is a comprehensive test page with substantial content to analyze. It contains multiple paragraphs and various HTML elements to test the SEO analysis functionality.</p>
            <h2>Another Section</h2>
            <p>More content here with <strong>emphasis</strong> and <b>bold text</b> to test content analysis features.</p>
            <h3>Subsection</h3>
            <p>Additional content in a subsection to test heading hierarchy analysis.</p>
            <img src="/test-image.jpg" alt="Test image with proper alt text">
            <img src="/test-image2.jpg" alt="">
            <img src="/test-image3.jpg">
            <a href="/internal-link">Internal link</a>
            <a href="https://external.com">External link</a>
        </body>
        </html>
    `;
    
    try {
        // Analyze the page
        const seoData = await analyzer.analyzePage({
            url: 'https://example.com/test-page',
            html: sampleHtml,
            page: mockPage,
            includeImages: true,
            maxImagesPerPage: 10
        });
        
        console.log('\nSEO Analysis Results:');
        console.log('===================');
        console.log(`URL: ${seoData.url}`);
        console.log(`Title: "${seoData.title}" (${seoData.titleLength} chars)`);
        console.log(`Description: "${seoData.description}" (${seoData.descriptionLength} chars)`);
        console.log(`Language: ${seoData.language}`);
        console.log(`HTTPS: ${seoData.hasHttps}`);
        console.log(`Favicon: ${seoData.favicon}`);
        console.log(`Viewport: ${seoData.viewport}`);
        console.log(`Canonical: ${seoData.canonicalUrl}`);
        console.log(`Meta Robots: ${seoData.metaRobots}`);
        console.log(`OpenGraph: ${seoData.hasOpenGraph}`);
        console.log(`Schema: ${seoData.hasJsonLd}`);
        console.log(`H1 Count: ${seoData.h1Count}`);
        console.log(`H2 Count: ${seoData.h2Count}`);
        console.log(`H3 Count: ${seoData.h3Count}`);
        console.log(`Words: ${seoData.words}`);
        console.log(`Images without alt: ${seoData.imagesWithoutAlt}`);
        console.log(`Internal links: ${seoData.internalLinksCount}`);
        console.log(`External links: ${seoData.externalLinksCount}`);
        console.log(`JS files: ${seoData.javascriptFiles}`);
        console.log(`CSS files: ${seoData.cssFiles}`);
        
        // Calculate SEO score
        const scoreData = scorer.calculateScore(seoData);
        
        console.log('\nSEO Scoring Results:');
        console.log('===================');
        console.log(`Score: ${scoreData.seo_page_score}/100`);
        console.log(`Grade: ${scoreData.seo_grade}`);
        console.log(`Category: ${scoreData.seo_category}`);
        console.log(`Issues count: ${scoreData.seo_issues_count}`);
        console.log(`Notes: ${scoreData.notes}`);
        
        if (scoreData.issues.length > 0) {
            console.log('\nIssues found:');
            scoreData.issues.forEach((issue, index) => {
                console.log(`  ${index + 1}. ${issue}`);
            });
        }
        
        console.log('\n✅ Test completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testSEOAnalysis();
