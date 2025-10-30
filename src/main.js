/**
 * MSD SEO Audit Actor - Main Entry Point
 * 
 * @author MySmartDigital
 * @description Comprehensive SEO audit actor that analyzes websites for technical SEO,
 * content quality, and performance metrics. Replaces custom JavaScript code in n8n workflows
 * by providing all SEO analysis functionality directly from Apify.
 */

const { Actor } = require('apify');
const axios = require('axios');
const { SEOAnalyzer } = require('./seo-analyzer');
const { URLNormalizer } = require('./url-normalizer');
const { SEOScorer } = require('./seo-scorer');
const https = require('https');
const tls = require('tls');
const { SitemapAnalyzer } = require('./sitemap-analyzer');

Actor.main(async () => {
    const input = await Actor.getInput();
    const {
        startUrls = ['https://example.com'],
        maxRequestsPerCrawl = 5,
        crawlUrls = true,
        includeImages = true,
        maxImagesPerPage = -1,
        waitForPageLoad = 3000,
        userAgent = 'Mozilla/5.0 (compatible; MSD-SEO-Audit/1.0)',
        viewportWidth = 1920,
        viewportHeight = 1080,
        includeSitemapAnalysis = true,
        sitemapTimeout = 10000
    } = input;

    console.log('Starting MSD SEO Audit...');
    console.log('Input:', JSON.stringify(input, null, 2));

    // Initialize components
    const seoAnalyzer = new SEOAnalyzer();
    const urlNormalizer = new URLNormalizer();
    const seoScorer = new SEOScorer();
    const sitemapAnalyzer = new SitemapAnalyzer();

    try {
        // Extract domain from first URL for sitemap analysis
        const firstUrl = startUrls[0];
        const domain = new URL(firstUrl).origin;

        // Perform domain-level sitemap analysis
        let domainSitemapAnalysis = null;
        if (includeSitemapAnalysis) {
            console.log(`Analyzing domain sitemaps for: ${domain}`);
            domainSitemapAnalysis = await sitemapAnalyzer.analyzeDomainSitemaps(domain, sitemapTimeout);
            console.log(`Domain sitemap analysis completed:`, JSON.stringify(domainSitemapAnalysis, null, 2));
        }

        const results = [];
        const visitedUrls = new Set();
        const urlsToProcess = [...startUrls];
        let processedCount = 0;
        
        while (urlsToProcess.length > 0 && processedCount < maxRequestsPerCrawl) {
            const currentUrl = urlsToProcess.shift();
            
            if (visitedUrls.has(currentUrl)) continue;
            visitedUrls.add(currentUrl);
            
            console.log(`Processing: ${currentUrl} (${processedCount + 1}/${maxRequestsPerCrawl})`);
            
            try {
                // Fetch page content using axios
                const response = await axios.get(currentUrl, {
                    headers: {
                        'User-Agent': userAgent,
                        'Accept-Language': 'en-US,en;q=0.9',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
                    },
                    timeout: 30000,
                    maxRedirects: 5,
                    validateStatus: function (status) {
                        return status < 500; // Accept all status codes below 500
                    }
                });

                const html = response.data;
                const statusCode = response.status;
                
                // Normalize URL
                const normalizedUrl = urlNormalizer.normalize(currentUrl);
                
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

                // Combine all data
                const result = {
                    ...seoData,
                    ...scoreData,
                    statusCode: statusCode,
                    analysis_date: new Date().toISOString(),
                    data_source: 'msd_seo_audit'
                };

                results.push(result);
                
                console.log(`Completed analysis for: ${normalizedUrl} (Status: ${statusCode})`);
                console.log(`SEO Score: ${scoreData.seo_page_score}/100 (${scoreData.seo_grade})`);
                
                // If crawling is enabled, extract internal links for further processing
                if (crawlUrls && seoData.internalLinks && seoData.internalLinks.length > 0) {
                    const baseDomain = new URL(normalizedUrl).origin;
                    
                    for (const linkObj of seoData.internalLinks) {
                        try {
                            const link = linkObj.url || linkObj; // Handle both object and string formats
                            let fullUrl;
                            if (link.startsWith('http')) {
                                fullUrl = link;
                            } else if (link.startsWith('/')) {
                                fullUrl = baseDomain + link;
                            } else {
                                fullUrl = new URL(link, normalizedUrl).href;
                            }
                            
                            const normalizedLink = urlNormalizer.normalize(fullUrl);
                            
                            // Only add if it's from the same domain and not already visited
                            if (normalizedLink.startsWith(baseDomain) && 
                                !visitedUrls.has(normalizedLink) && 
                                !urlsToProcess.includes(normalizedLink)) {
                                urlsToProcess.push(normalizedLink);
                                console.log(`Added to crawl queue: ${normalizedLink}`);
                            }
                        } catch (e) {
                            // Skip invalid URLs
                            continue;
                        }
                    }
                }
                
                processedCount++;
                
            } catch (error) {
                console.error(`Error analyzing ${currentUrl}:`, error);

                // Determine status code based on error type
                let statusCode = 500; // Default to server error
                if (error.response) {
                    statusCode = error.response.status;
                } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
                    statusCode = 404; // DNS resolution failed or connection refused
                } else if (error.code === 'ETIMEDOUT') {
                    statusCode = 408; // Request timeout
                } else if (error.code === 'ECONNRESET') {
                    statusCode = 503; // Connection reset
                }

                // Add error result
                results.push({
                    url: currentUrl,
                    error: error.message,
                    statusCode: statusCode,
                    analysis_date: new Date().toISOString(),
                    data_source: 'msd_seo_audit'
                });
            }
        }
        
        // Calculate domain-level analysis with SEO scores
        const domainAnalysis = await calculateDomainAnalysis(results, domainSitemapAnalysis);

        // Create comprehensive result structure
        const finalOutput = {
            domain: domainAnalysis,
            pages: results,
            analysis: {
                total_pages_processed: results.length,
                analysis_completed_at: new Date().toISOString(),
                seo_engine_version: '1.0.0',
                data_format_version: '2.0'
            }
        };

        // Push the comprehensive result to dataset
        await Actor.pushData(finalOutput);

        console.log(`SEO Audit completed! Processed ${results.length} pages.`);
        console.log(`Domain SEO Score: ${domainAnalysis.seo_score}/100 (${domainAnalysis.seo_grade})`);
        console.log(`Status Summary: ${domainAnalysis.pages_with_successful_status_percentage}% successful (${domainAnalysis.pages_with_successful_status}/${results.length}), ${domainAnalysis.pages_with_error_status_percentage}% errors (${domainAnalysis.pages_with_error_status}/${results.length})`);
        console.log(`OpenGraph Coverage: ${domainAnalysis.pages_with_opengraph_percentage}% pages have OpenGraph (${domainAnalysis.pages_with_opengraph}/${results.length})`);
        console.log(`SSL Certificate Status: ${domainAnalysis.ssl_certificate_info?.status || 'Unknown'}`);

    } catch (error) {
        console.error('General error:', error);
    }
});

// Domain-level analysis calculation
async function calculateDomainAnalysis(results, domainSitemapAnalysis = null) {
    console.log('Calculating domain-level analysis...');

    // Calculate average SEO score across all pages
    const validResults = results.filter(r => r.seo_page_score !== undefined);
    const averageScore = validResults.length > 0
        ? validResults.reduce((sum, r) => sum + r.seo_page_score, 0) / validResults.length
        : 0;

    // Determine overall grade
    let overallGrade = 'F';
    if (averageScore >= 90) overallGrade = 'A';
    else if (averageScore >= 80) overallGrade = 'B';
    else if (averageScore >= 70) overallGrade = 'C';
    else if (averageScore >= 60) overallGrade = 'D';

    // Extract domain from first result
    const firstUrl = results[0]?.url || '';
    const domain = firstUrl ? new URL(firstUrl).hostname : '';

    // Calculate domain-level metrics
    const totalPages = results.length;
    const pagesWithH1 = results.filter(r => r.h1Count > 0).length;
    const pagesWithMetaDesc = results.filter(r => r.descriptionLength > 0).length;
    const pagesWithErrors = results.filter(r => r.error).length;

    // Status code analysis
    const statusCodes = results.filter(r => r.statusCode).map(r => r.statusCode);
    const successfulPages = statusCodes.filter(code => code >= 200 && code < 300).length;
    const redirectPages = statusCodes.filter(code => code >= 300 && code < 400).length;
    const errorPages = statusCodes.filter(code => code >= 400).length;

    // OpenGraph analysis
    const pagesWithOpenGraph = results.filter(r => r.hasOpenGraph).length;
    const pagesWithOpenGraphTitle = results.filter(r => r.openGraphData?.title).length;
    const pagesWithOpenGraphDescription = results.filter(r => r.openGraphData?.description).length;
    const pagesWithOpenGraphImage = results.filter(r => r.openGraphData?.image || (r.openGraphData?.images && r.openGraphData.images.length > 0)).length;

    // SSL certificate analysis
    const sslInfo = await analyzeSSLCertificate(domain);

        // Compile domain analysis
        const domainAnalysis = {
            domain_name: domain,
            domainLength: domain.length,
            total_pages_analyzed: totalPages,
            average_seo_score: Math.round(averageScore * 100) / 100,
            overall_grade: overallGrade,
            seo_score: Math.round(averageScore * 100) / 100,
            seo_grade: overallGrade,

            // Page-level statistics
            pages_with_h1: pagesWithH1,
            pages_with_h1_percentage: Math.round((pagesWithH1 / totalPages) * 100),
            pages_with_meta_description: pagesWithMetaDesc,
            pages_with_meta_description_percentage: Math.round((pagesWithMetaDesc / totalPages) * 100),
            pages_with_errors: pagesWithErrors,
            pages_with_errors_percentage: Math.round((pagesWithErrors / totalPages) * 100),

            // Technical metrics
            average_title_length: Math.round(results.reduce((sum, r) => sum + (r.titleLength || 0), 0) / totalPages),
            average_description_length: Math.round(results.reduce((sum, r) => sum + (r.descriptionLength || 0), 0) / totalPages),
            average_words_per_page: Math.round(results.reduce((sum, r) => sum + (r.words || 0), 0) / totalPages),
            average_internal_links: Math.round(results.reduce((sum, r) => sum + (r.internalLinksCount || 0), 0) / totalPages),

            // Status code analysis
            pages_with_successful_status: successfulPages,
            pages_with_successful_status_percentage: Math.round((successfulPages / totalPages) * 100),
            pages_with_redirect_status: redirectPages,
            pages_with_redirect_status_percentage: Math.round((redirectPages / totalPages) * 100),
            pages_with_error_status: errorPages,
            pages_with_error_status_percentage: Math.round((errorPages / totalPages) * 100),

            // OpenGraph statistics
            pages_with_opengraph: pagesWithOpenGraph,
            pages_with_opengraph_percentage: Math.round((pagesWithOpenGraph / totalPages) * 100),
            pages_with_opengraph_title: pagesWithOpenGraphTitle,
            pages_with_opengraph_title_percentage: Math.round((pagesWithOpenGraphTitle / totalPages) * 100),
            pages_with_opengraph_description: pagesWithOpenGraphDescription,
            pages_with_opengraph_description_percentage: Math.round((pagesWithOpenGraphDescription / totalPages) * 100),
            pages_with_opengraph_image: pagesWithOpenGraphImage,
            pages_with_opengraph_image_percentage: Math.round((pagesWithOpenGraphImage / totalPages) * 100),

            // SSL Information
            ssl_certificate_info: sslInfo,

            // Sitemap Information (domain-level)
            sitemap_info: {
                has_sitemap: domainSitemapAnalysis?.hasSitemap || false,
                sitemap_url: domainSitemapAnalysis?.sitemapUrl || null,
                sitemap_type: domainSitemapAnalysis?.sitemapType || null,
                sitemap_size: domainSitemapAnalysis?.sitemapSize || 0,
                total_urls: domainSitemapAnalysis?.totalUrls || 0,
                sitemap_urls: domainSitemapAnalysis?.sitemapUrls || [],
                sitemap_lastmod: domainSitemapAnalysis?.sitemapLastModified || null
            }
        };

    console.log(`Domain Analysis Summary:`);
    console.log(`- Domain: ${domain}`);
    console.log(`- Average SEO Score: ${domainAnalysis.seo_score}/100 (${domainAnalysis.seo_grade})`);
    console.log(`- Pages Analyzed: ${totalPages}`);
    console.log(`- SSL Valid Until: ${sslInfo.valid_until || 'Unknown'}`);

    return domainAnalysis;
}

// SSL Certificate Analysis
async function analyzeSSLCertificate(domain) {
    try {
        const hostname = domain.startsWith('http') ? new URL(domain).hostname : domain;

        return new Promise((resolve) => {
            const options = {
                hostname: hostname,
                port: 443,
                method: 'GET',
                rejectUnauthorized: false, // Allow self-signed certificates for analysis
                timeout: 10000
            };

            const req = https.request(options, (res) => {
                const certificate = res.socket.getPeerCertificate();

                if (certificate && certificate.valid_to) {
                    const validUntil = new Date(certificate.valid_to);
                    const daysUntilExpiry = Math.ceil((validUntil - new Date()) / (1000 * 60 * 60 * 24));
                    const isValid = daysUntilExpiry > 0;

                    resolve({
                        is_valid: isValid,
                        valid_until: certificate.valid_to,
                        days_until_expiry: daysUntilExpiry,
                        issuer: certificate.issuer?.CN || 'Unknown',
                        subject: certificate.subject?.CN || 'Unknown',
                        serial_number: certificate.serialNumber || 'Unknown',
                        fingerprint: certificate.fingerprint || 'Unknown',
                        status: isValid
                            ? (daysUntilExpiry < 30 ? 'expiring_soon' : 'valid')
                            : 'expired'
                    });
                } else {
                    resolve({
                        is_valid: false,
                        valid_until: null,
                        days_until_expiry: 0,
                        issuer: 'Unknown',
                        subject: 'Unknown',
                        serial_number: 'Unknown',
                        fingerprint: 'Unknown',
                        status: 'no_certificate'
                    });
                }
            });

            req.on('error', (error) => {
                resolve({
                    is_valid: false,
                    valid_until: null,
                    days_until_expiry: 0,
                    issuer: 'Unknown',
                    subject: 'Unknown',
                    serial_number: 'Unknown',
                    fingerprint: 'Unknown',
                    status: 'connection_error',
                    error: error.message
                });
            });

            req.on('timeout', () => {
                req.destroy();
                resolve({
                    is_valid: false,
                    valid_until: null,
                    days_until_expiry: 0,
                    issuer: 'Unknown',
                    subject: 'Unknown',
                    serial_number: 'Unknown',
                    fingerprint: 'Unknown',
                    status: 'timeout'
                });
            });

            req.end();
        });

    } catch (error) {
        return {
            is_valid: false,
            valid_until: null,
            days_until_expiry: 0,
            issuer: 'Unknown',
            subject: 'Unknown',
            serial_number: 'Unknown',
            fingerprint: 'Unknown',
            status: 'error',
            error: error.message
        };
    }
}
