// Standalone test without any external dependencies
const cheerio = require('cheerio');

// Copy the classes directly here for testing
class URLNormalizer {
    normalize(rawUrl) {
        if (!rawUrl) return '';
        
        try {
            const url = new URL(String(rawUrl).trim());
            
            // Remove hash
            url.hash = '';
            
            // Remove UTM parameters
            const params = Array.from(url.searchParams.entries())
                .filter(([key]) => !/^utm_/i.test(key));
            
            url.search = params.length ? new URLSearchParams(params).toString() : '';
            
            // Normalize hostname
            url.hostname = url.hostname.toLowerCase();
            
            // Normalize pathname
            url.pathname = url.pathname.replace(/\/+/g, '/');
            if (url.pathname !== '/' && url.pathname.endsWith('/')) {
                url.pathname = url.pathname.slice(0, -1);
            }
            
            return url.toString();
        } catch (error) {
            // If URL parsing fails, return cleaned string
            const cleaned = String(rawUrl || '').trim().replace(/\/+$/, '');
            return cleaned === '' ? '' : cleaned.toLowerCase();
        }
    }
}

class SEOAnalyzer {
    constructor() {
        this.cheerio = cheerio;
    }

    async analyzePage({ url, html, page, includeImages = true, maxImagesPerPage = 10 }) {
        const $ = this.cheerio.load(html);
        
        // Basic page information
        const title = this.extractTitle($);
        const description = this.extractMetaDescription($);
        const language = this.extractLanguage($);
        
        // Technical SEO
        const technicalSeo = this.analyzeTechnicalSEO($, url);
        
        // Meta tags and robots
        const metaData = this.analyzeMetaTags($);
        
        // Heading structure
        const headingStructure = this.analyzeHeadings($);
        
        // Content analysis
        const contentAnalysis = this.analyzeContent($);
        
        // Links analysis
        const linksAnalysis = this.analyzeLinks($, url);
        
        // Images analysis
        const imagesAnalysis = includeImages ? 
            this.analyzeImages($, url, maxImagesPerPage) : 
            { imagesWithoutAlt: 0, images_list: [] };
        
        // Schema and structured data
        const structuredData = this.analyzeStructuredData($);
        
        // Performance indicators
        const performance = await this.analyzePerformance(page);
        
        return {
            // Basic info
            url: url,
            title: title,
            titleLength: title.length,
            description: description,
            descriptionLength: description.length,
            language: language,
            
            // Technical SEO
            ...technicalSeo,
            
            // Meta and robots
            ...metaData,
            
            // Headings
            ...headingStructure,
            
            // Content
            ...contentAnalysis,
            
            // Links
            ...linksAnalysis,
            
            // Images
            ...imagesAnalysis,
            
            // Structured data
            ...structuredData,
            
            // Performance
            ...performance
        };
    }

    extractTitle($) {
        return $('title').text().trim() || '';
    }

    extractMetaDescription($) {
        return $('meta[name="description"]').attr('content') || '';
    }

    extractLanguage($) {
        return $('html').attr('lang') || $('meta[http-equiv="content-language"]').attr('content') || '';
    }

    analyzeTechnicalSEO($, url) {
        const hasHttps = url.startsWith('https://');
        const favicon = $('link[rel="icon"], link[rel="shortcut icon"]').length > 0;
        const viewport = $('meta[name="viewport"]').length > 0;
        const charset = $('meta[charset], meta[http-equiv="content-type"]').length > 0;
        const canonicalUrl = $('link[rel="canonical"]').attr('href') || '';
        
        return {
            hasHttps,
            favicon: !!favicon,
            viewport: !!viewport,
            charset: !!charset,
            canonicalUrl,
            hasCanonical: !!canonicalUrl
        };
    }

    analyzeMetaTags($) {
        const metaRobots = $('meta[name="robots"]').attr('content') || '';
        const xRobots = $('meta[http-equiv="x-robots-tag"]').attr('content') || '';
        const openGraph = $('meta[property^="og:"]').length > 0;
        const twitterCards = $('meta[name^="twitter:"]').length > 0;
        
        return {
            metaRobots,
            xRobots,
            hasOpenGraph: !!openGraph,
            hasTwitterCards: !!twitterCards,
            meta_indexed: metaRobots.toLowerCase().includes('noindex') ? 0 : 1
        };
    }

    analyzeHeadings($) {
        const headings = {
            h1: [],
            h2: [],
            h3: [],
            h4: [],
            h5: [],
            h6: []
        };
        
        const counts = {
            h1Count: 0,
            h2Count: 0,
            h3Count: 0,
            h4Count: 0,
            h5Count: 0,
            h6Count: 0
        };

        for (let i = 1; i <= 6; i++) {
            const selector = `h${i}`;
            const elements = $(selector);
            
            elements.each((_, el) => {
                const text = $(el).text().trim();
                if (text) {
                    headings[`h${i}`].push(text);
                    counts[`h${i}Count`]++;
                }
            });
        }

        return {
            ...headings,
            ...counts
        };
    }

    analyzeContent($) {
        // Remove script and style elements
        $('script, style, nav, header, footer, aside').remove();
        
        const bodyText = $('body').text();
        const words = bodyText.split(/\s+/).filter(word => word.length > 0).length;
        const paragraphs = $('p').length;
        const strongTags = $('strong, b').length;
        
        // Check for lorem ipsum
        const loremIpsum = /lorem\s+ipsum/i.test(bodyText);
        
        return {
            words,
            paragraphs,
            strongTags,
            loremIpsum
        };
    }

    analyzeLinks($, baseUrl) {
        const links = $('a[href]');
        let internalLinksCount = 0;
        let externalLinksCount = 0;
        let totalAnchorTextLength = 0;
        
        links.each((_, link) => {
            const href = $(link).attr('href');
            const anchorText = $(link).text().trim();
            
            if (anchorText) {
                totalAnchorTextLength += anchorText.length;
            }
            
            if (href) {
                try {
                    const url = new URL(href, baseUrl);
                    const baseHost = new URL(baseUrl).hostname;
                    
                    if (url.hostname === baseHost) {
                        internalLinksCount++;
                    } else {
                        externalLinksCount++;
                    }
                } catch (e) {
                    // Invalid URL, skip
                }
            }
        });
        
        const averageAnchorTextLength = links.length > 0 ? 
            Math.round(totalAnchorTextLength / links.length) : 0;
        
        return {
            internalLinksCount,
            externalLinksCount,
            averageAnchorTextLength
        };
    }

    analyzeImages($, baseUrl, maxImagesPerPage) {
        const images = $('img[src]');
        const imagesWithoutAlt = [];
        const images_list = [];
        
        images.slice(0, maxImagesPerPage).each((_, img) => {
            const src = $(img).attr('src');
            const alt = $(img).attr('alt');
            
            if (src) {
                try {
                    const imageUrl = new URL(src, baseUrl).href;
                    images_list.push(imageUrl);
                    
                    if (!alt || alt.trim() === '') {
                        imagesWithoutAlt.push(imageUrl);
                    }
                } catch (e) {
                    // Invalid URL, skip
                }
            }
        });
        
        return {
            imagesWithoutAlt: imagesWithoutAlt.length,
            images_list: images_list.slice(0, maxImagesPerPage)
        };
    }

    analyzeStructuredData($) {
        const jsonLd = $('script[type="application/ld+json"]').length > 0;
        const microdata = $('[itemscope]').length > 0;
        const schema = $('[itemtype]').length > 0;
        
        return {
            hasJsonLd: !!jsonLd,
            hasMicrodata: !!microdata,
            hasSchema: !!schema
        };
    }

    async analyzePerformance(page) {
        try {
            // Get resource counts
            const resources = await page.evaluate(() => {
                const scripts = document.querySelectorAll('script[src]').length;
                const stylesheets = document.querySelectorAll('link[rel="stylesheet"]').length;
                return { scripts, stylesheets };
            });
            
            return {
                javascriptFiles: resources.scripts,
                cssFiles: resources.stylesheets
            };
        } catch (error) {
            console.warn('Could not analyze performance:', error.message);
            return {
                javascriptFiles: 0,
                cssFiles: 0
            };
        }
    }
}

class SEOScorer {
    calculateScore(seoData) {
        let score = 100;
        const issues = [];
        
        // 1. TITLE OPTIMIZATION (25 points)
        const title = seoData.title || '';
        const titleLength = Number(seoData.titleLength || title.length || 0);
        
        if (!title || titleLength < 10) {
            score -= 15;
            issues.push('missing/short title');
        } else if (titleLength > 60) {
            score -= 8;
            issues.push('title too long');
        } else if (titleLength < 30) {
            score -= 5;
            issues.push('title could be longer');
        }
        
        // 2. META DESCRIPTION (20 points)
        const description = seoData.description || '';
        const descLength = Number(seoData.descriptionLength || description.length || 0);
        
        if (!description || descLength < 120) {
            score -= 12;
            issues.push('missing/short meta description');
        } else if (descLength > 160) {
            score -= 6;
            issues.push('meta description too long');
        }
        
        // 3. HEADING STRUCTURE (20 points)
        const h1Count = Number(seoData.h1Count || (Array.isArray(seoData.h1) ? seoData.h1.length : 0));
        const h2Count = Number(seoData.h2Count || 0);
        const h3Count = Number(seoData.h3Count || 0);
        
        if (h1Count === 0) {
            score -= 18;
            issues.push('missing H1');
        } else if (h1Count > 1) {
            score -= 12;
            issues.push('multiple H1 tags');
        }
        
        // Bonus for good heading hierarchy
        if (h1Count === 1 && h2Count > 0) score += 2;
        if (h2Count > 0 && h3Count > 0) score += 1;
        
        // 4. TECHNICAL SEO (20 points)
        if (!seoData.hasHttps) {
            score -= 10;
            issues.push('no HTTPS');
        }
        if (!seoData.favicon) {
            score -= 3;
            issues.push('no favicon');
        }
        if (!seoData.hasOpenGraph) {
            score -= 4;
            issues.push('no OpenGraph');
        }
        if (!seoData.viewport) {
            score -= 3;
            issues.push('no viewport meta');
        }
        
        // Indexability check
        const metaRobots = String(seoData.metaRobots || '').toLowerCase();
        if (metaRobots.includes('noindex')) {
            score = Math.min(score, 25); // Cap score at 25 if noindex
            issues.push('noindex directive');
        }
        
        // 5. CONTENT QUALITY (10 points)
        const words = Number(seoData.words || 0);
        if (words < 150) {
            score -= 8;
            issues.push('very low word count');
        } else if (words < 300) {
            score -= 5;
            issues.push('low word count');
        } else if (words >= 800) {
            score += 2; // Bonus for substantial content
        }
        
        const strongTags = Number(seoData.strongTags || 0);
        if (strongTags === 0 && words > 200) {
            score -= 2;
            issues.push('no emphasis tags');
        }
        
        // 6. IMAGES OPTIMIZATION (5 points)
        const imagesWithoutAlt = Number(seoData.imagesWithoutAlt || 0);
        if (imagesWithoutAlt > 0) {
            const imageIssueScore = Math.min(5, imagesWithoutAlt);
            score -= imageIssueScore;
            issues.push(`${imagesWithoutAlt} images without alt text`);
        }
        
        // 7. ADVANCED BONUSES (up to 5 points)
        let bonusPoints = 0;
        if (seoData.hasSchema || seoData.hasJsonLd) bonusPoints += 2;
        if (seoData.canonicalUrl) bonusPoints += 1;
        if (seoData.hasHreflang) bonusPoints += 1;
        if (seoData.appleTouchIcon) bonusPoints += 1;
        
        score += bonusPoints;
        
        // 8. PERFORMANCE PENALTIES
        const jsFiles = Number(seoData.javascriptFiles || 0);
        const cssFiles = Number(seoData.cssFiles || 0);
        if (jsFiles > 20) {
            score -= 3;
            issues.push('too many JS files');
        }
        if (cssFiles > 10) {
            score -= 2;
            issues.push('too many CSS files');
        }
        
        // Final score calculation
        const finalScore = Math.max(0, Math.min(100, Math.round(score)));
        
        return {
            seo_page_score: finalScore,
            seo_grade: this.getGrade(finalScore),
            seo_category: this.getCategory(finalScore),
            seo_issues_count: issues.length,
            notes: this.generateSeoNotes(seoData, { score: finalScore, issues }),
            issues: issues
        };
    }

    getGrade(score) {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    }

    getCategory(score) {
        if (score >= 85) return 'Excellent';
        if (score >= 70) return 'Good';
        if (score >= 50) return 'Needs Improvement';
        return 'Poor';
    }

    generateSeoNotes(seoData, scoreData) {
        const notes = [...scoreData.issues];
        
        // Add positive notes for good practices
        const positives = [];
        if (seoData.hasHttps) positives.push('HTTPS enabled');
        if (seoData.hasOpenGraph) positives.push('OpenGraph present');
        if (Number(seoData.words || 0) >= 500) positives.push('good content length');
        if (Number(seoData.h1Count || 0) === 1) positives.push('proper H1 structure');
        
        const result = notes.length > 0 ? `Issues: ${notes.join(', ')}` : '';
        const bonus = positives.length > 0 ? ` | Strengths: ${positives.join(', ')}` : '';
        
        return `${result}${bonus}`.replace(/^\s*\|\s*/, ''); // Clean up leading separator
    }
}

// Test function
async function testSEOAnalysis() {
    console.log('Testing MSD SEO Audit Actor (Standalone Test)...\n');
    
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
        // Mock page object
        const mockPage = {
            evaluate: async () => ({ scripts: 5, stylesheets: 2 })
        };
        
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
