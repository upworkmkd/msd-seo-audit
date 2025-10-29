const express = require('express');
const cors = require('cors');
const { SEOAnalyzer } = require('./src/seo-analyzer.js');
const { SEOScorer } = require('./src/seo-scorer.js');
const { URLNormalizer } = require('./src/url-normalizer.js');
const { SitemapAnalyzer } = require('./src/sitemap-analyzer.js');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize analyzers
const seoAnalyzer = new SEOAnalyzer();
const seoScorer = new SEOScorer();
const urlNormalizer = new URLNormalizer();
const sitemapAnalyzer = new SitemapAnalyzer();

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'MSD SEO Audit API is running',
        timestamp: new Date().toISOString()
    });
});

// Single page analysis endpoint
app.post('/analyze', async (req, res) => {
    try {
        const { 
            url, 
            includeImages = true, 
            maxImagesPerPage = -1,
            userAgent = 'Mozilla/5.0 (compatible; MSD-SEO-Audit/1.0)'
        } = req.body;

        if (!url) {
            return res.status(400).json({ 
                error: 'URL is required',
                message: 'Please provide a valid URL in the request body'
            });
        }

        console.log(`Analyzing URL: ${url}`);

        // Fetch page content
        const response = await axios.get(url, {
            headers: {
                'User-Agent': userAgent,
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
            },
            timeout: 30000,
            maxRedirects: 5,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        const html = response.data;
        const statusCode = response.status;
        
        // Normalize URL
        const normalizedUrl = urlNormalizer.normalize(url);
        
        // Mock page object for compatibility
        const mockPage = {
            evaluate: async (fn) => {
                if (typeof fn === 'function') {
                    return fn();
                }
                return { scripts: 0, stylesheets: 0 };
            }
        };
        
        // Perform comprehensive SEO analysis
        const seoData = await seoAnalyzer.analyzePage({
            url: normalizedUrl,
            html,
            page: mockPage,
            includeImages,
            maxImagesPerPage,
            statusCode
        });
        
        // Calculate SEO score
        const scoreData = seoScorer.calculateScore(seoData);
        
        // Combine results
        const result = {
            ...seoData,
            ...scoreData,
            analysis_timestamp: new Date().toISOString(),
            http_status_code: statusCode,
            original_url: url,
            normalized_url: normalizedUrl
        };

        res.json(result);

    } catch (error) {
        console.error('Analysis error:', error.message);
        res.status(500).json({
            error: 'Analysis failed',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Batch analysis endpoint
app.post('/analyze-batch', async (req, res) => {
    try {
        const { 
            urls, 
            includeImages = true, 
            maxImagesPerPage = -1,
            userAgent = 'Mozilla/5.0 (compatible; MSD-SEO-Audit/1.0)'
        } = req.body;

        if (!urls || !Array.isArray(urls) || urls.length === 0) {
            return res.status(400).json({ 
                error: 'URLs array is required',
                message: 'Please provide an array of URLs in the request body'
            });
        }

        if (urls.length > 20) {
            return res.status(400).json({ 
                error: 'Too many URLs',
                message: 'Maximum 20 URLs allowed per batch request'
            });
        }

        console.log(`Analyzing ${urls.length} URLs in batch`);

        const results = [];
        const errors = [];

        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            try {
                console.log(`Processing ${i + 1}/${urls.length}: ${url}`);

                // Fetch page content
                const response = await axios.get(url, {
                    headers: {
                        'User-Agent': userAgent,
                        'Accept-Language': 'en-US,en;q=0.9',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
                    },
                    timeout: 30000,
                    maxRedirects: 5,
                    validateStatus: function (status) {
                        return status < 500;
                    }
                });

                const html = response.data;
                const statusCode = response.status;
                
                // Normalize URL
                const normalizedUrl = urlNormalizer.normalize(url);
                
                // Mock page object for compatibility
                const mockPage = {
                    evaluate: async (fn) => {
                        if (typeof fn === 'function') {
                            return fn();
                        }
                        return { scripts: 0, stylesheets: 0 };
                    }
                };
                
                // Perform comprehensive SEO analysis
                const seoData = await seoAnalyzer.analyzePage({
                    url: normalizedUrl,
                    html,
                    page: mockPage,
                    includeImages,
                    maxImagesPerPage,
                    statusCode
                });
                
                // Calculate SEO score
                const scoreData = seoScorer.calculateScore(seoData);
                
                // Combine results
                const result = {
                    ...seoData,
                    ...scoreData,
                    analysis_timestamp: new Date().toISOString(),
                    http_status_code: statusCode,
                    original_url: url,
                    normalized_url: normalizedUrl
                };

                results.push(result);

            } catch (error) {
                console.error(`Error analyzing ${url}:`, error.message);
                errors.push({
                    url: url,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        }

        res.json({
            results: results,
            errors: errors,
            total_analyzed: results.length,
            total_errors: errors.length,
            batch_timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Batch analysis error:', error.message);
        res.status(500).json({
            error: 'Batch analysis failed',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Sitemap analysis endpoint
app.post('/analyze-sitemap', async (req, res) => {
    try {
        const { domain } = req.body;

        if (!domain) {
            return res.status(400).json({ 
                error: 'Domain is required',
                message: 'Please provide a domain in the request body'
            });
        }

        console.log(`Analyzing sitemap for domain: ${domain}`);

        const sitemapData = await sitemapAnalyzer.analyzeDomainSitemaps(domain);

        res.json({
            ...sitemapData,
            analysis_timestamp: new Date().toISOString(),
            domain: domain
        });

    } catch (error) {
        console.error('Sitemap analysis error:', error.message);
        res.status(500).json({
            error: 'Sitemap analysis failed',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 MSD SEO Audit API Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔍 Single page analysis: POST http://localhost:${PORT}/analyze`);
    console.log(`📦 Batch analysis: POST http://localhost:${PORT}/analyze-batch`);
    console.log(`🗺️  Sitemap analysis: POST http://localhost:${PORT}/analyze-sitemap`);
    console.log('\n📝 Example usage:');
    console.log('curl -X POST http://localhost:3000/analyze \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d \'{"url": "https://example.com"}\'');
});

module.exports = app;
