/**
 * Sitemap Analyzer for MSD SEO Audit Actor
 *
 * @author MySmartDigital
 * @description Analyzes sitemaps at the domain level to provide comprehensive
 * sitemap information across all analyzed pages.
 */

const axios = require('axios');
const { URL } = require('url');

class SitemapAnalyzer {
    constructor() {
        this.axios = axios;
    }

    /**
     * Follow redirects and return the final URL
     * @param {string} url - Initial URL
     * @param {number} timeout - Request timeout
     * @param {number} maxRedirects - Maximum number of redirects to follow
     * @returns {Promise<string>} Final URL after following redirects
     */
    async followRedirects(url, timeout = 10000, maxRedirects = 5) {
        let currentUrl = url;
        let redirectCount = 0;

        while (redirectCount < maxRedirects) {
            try {
                const response = await this.axios.head(currentUrl, {
                    timeout,
                    maxRedirects: 0, // Don't follow redirects automatically
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; MSD-SEO-Audit/1.0)',
                        'Accept': 'application/xml, text/xml, application/xhtml+xml, text/html, */*'
                    }
                });

                // If we get here, no redirect occurred
                return currentUrl;

            } catch (error) {
                // Check if it's a redirect response
                if (error.response && (error.response.status === 301 || error.response.status === 302 || error.response.status === 307 || error.response.status === 308)) {
                    const location = error.response.headers.location;
                    if (location) {
                        // Handle relative URLs
                        if (location.startsWith('/')) {
                            const baseUrl = new URL(currentUrl);
                            currentUrl = `${baseUrl.protocol}//${baseUrl.host}${location}`;
                        } else if (location.startsWith('http')) {
                            currentUrl = location;
                        } else {
                            // Relative URL without leading slash
                            const baseUrl = new URL(currentUrl);
                            currentUrl = `${baseUrl.protocol}//${baseUrl.host}/${location}`;
                        }
                        redirectCount++;
                    } else {
                        // No location header, return current URL
                        return currentUrl;
                    }
                } else {
                    // Not a redirect error, return current URL
                    return currentUrl;
                }
            }
        }

        // If we've exceeded max redirects, return the last URL
        return currentUrl;
    }

    /**
     * Recursively counts all URLs across all sitemaps
     * @param {string} sitemapUrl - The sitemap URL to analyze
     * @param {number} timeout - Request timeout in milliseconds
     * @param {number} maxDepth - Maximum recursion depth to prevent infinite loops
     * @param {Set} visitedUrls - Set of already visited URLs to prevent duplicates
     * @returns {Promise<number>} Total count of URLs across all sitemaps
     */
    async countTotalUrlsInSitemaps(sitemapUrl, timeout = 10000, maxDepth = 10, visitedUrls = new Set()) {
        if (maxDepth <= 0 || visitedUrls.has(sitemapUrl)) {
            return 0;
        }

        visitedUrls.add(sitemapUrl);
        let totalUrls = 0;

        try {
            const response = await this.axios.get(sitemapUrl, {
                timeout,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; MSD-SEO-Audit/1.0)',
                    'Accept': 'application/xml, text/xml, application/xhtml+xml, text/html, */*'
                }
            });

            if (response.status === 200) {
                const content = response.data;
                const contentType = response.headers['content-type'] || '';

                if (contentType.includes('xml') || contentType.includes('text')) {
                    // Check if it's a sitemap index
                    if (content.includes('<sitemapindex') || content.includes('<sitemap:') || content.includes('sitemapindex')) {
                        // It's a sitemap index, recursively fetch all referenced sitemaps
                        const sitemapUrls = this.extractSitemapUrlsFromIndex(content, sitemapUrl);
                        
                        for (const nestedSitemapUrl of sitemapUrls) {
                            try {
                                const nestedUrlCount = await this.countTotalUrlsInSitemaps(
                                    nestedSitemapUrl,
                                    timeout,
                                    maxDepth - 1,
                                    visitedUrls
                                );
                                totalUrls += nestedUrlCount;
                            } catch (error) {
                                // Skip invalid or inaccessible sitemaps
                                console.warn(`Failed to fetch sitemap ${nestedSitemapUrl}: ${error.message}`);
                            }
                        }
                    } else if (content.includes('<urlset') || content.includes('<url:') || content.includes('urlset')) {
                        // It's a regular sitemap, count the URLs
                        totalUrls = this.countUrlsInSitemap(content);
                    }
                }
            }
        } catch (error) {
            // If fetching fails, return 0 (don't throw)
            console.warn(`Failed to fetch sitemap ${sitemapUrl}: ${error.message}`);
        }

        return totalUrls;
    }

    /**
     * Analyzes sitemaps for a given domain
     * @param {string} domainUrl - The base domain URL
     * @param {number} timeout - Request timeout in milliseconds
     * @returns {Promise<Object>} Sitemap analysis results
     */
    async analyzeDomainSitemaps(domainUrl, timeout = 10000) {
        const results = {
            domain: domainUrl,
            sitemapUrl: null,
            hasSitemap: false,
            sitemapType: null,
            sitemapSize: 0,
            sitemapLastModified: null,
            sitemapUrls: [],
            totalUrls: 0,
            error: null
        };

        try {
            // First try the standard sitemap.xml location
            const initialSitemapUrl = `${domainUrl}/sitemap.xml`;
            results.sitemapUrl = initialSitemapUrl;

            // Follow redirects manually to get the final URL
            const finalSitemapUrl = await this.followRedirects(initialSitemapUrl, timeout);
            results.sitemapUrl = finalSitemapUrl;

            const response = await this.axios.get(finalSitemapUrl, {
                timeout,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; MSD-SEO-Audit/1.0)',
                    'Accept': 'application/xml, text/xml, application/xhtml+xml, text/html, */*'
                }
            });

            if (response.status === 200) {
                const content = response.data;
                const contentType = response.headers['content-type'] || '';

                if (contentType.includes('xml') || contentType.includes('text')) {
                    results.hasSitemap = true;

                    if (content.includes('<sitemapindex') || content.includes('<sitemap:') || content.includes('sitemapindex')) {
                        results.sitemapType = 'sitemap_index';
                        results.sitemapSize = this.countSitemapsInIndex(content);
                        results.sitemapUrls = this.extractSitemapUrlsFromIndex(content, domainUrl);
                        
                        // Recursively count all URLs across all sitemaps
                        console.log(`Counting total URLs across ${results.sitemapSize} sitemaps...`);
                        results.totalUrls = await this.countTotalUrlsInSitemaps(finalSitemapUrl, timeout);
                        console.log(`Total URLs found: ${results.totalUrls}`);
                    } else if (content.includes('<urlset') || content.includes('<url:') || content.includes('urlset')) {
                        results.sitemapType = 'urlset';
                        results.sitemapSize = this.countUrlsInSitemap(content);
                        results.sitemapUrls = this.extractUrlsFromSitemap(content, domainUrl);
                        results.sitemapLastModified = this.getLastModifiedFromSitemap(content);
                        
                        // For a single sitemap, totalUrls equals sitemapSize
                        results.totalUrls = results.sitemapSize;
                    }
                }
            }
        } catch (error) {
            results.error = error.message;

            // If standard sitemap.xml fails, try robots.txt for sitemap references
            try {
                const robotsUrl = `${domainUrl}/robots.txt`;
                const robotsResponse = await this.axios.get(robotsUrl, {
                    timeout: timeout / 2,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; MSD-SEO-Audit/1.0)'
                    }
                });

                if (robotsResponse.status === 200) {
                    const sitemapUrls = this.extractSitemapsFromRobots(robotsResponse.data);
                    if (sitemapUrls.length > 0) {
                        results.sitemapUrl = sitemapUrls[0];
                        results.hasSitemap = true;
                        results.sitemapType = 'robots_txt_reference';
                        results.sitemapUrls = sitemapUrls;
                        
                        // Recursively count all URLs across all sitemaps found in robots.txt
                        console.log(`Counting total URLs across ${sitemapUrls.length} sitemaps from robots.txt...`);
                        let totalUrlsCount = 0;
                        for (const sitemapUrl of sitemapUrls) {
                            try {
                                const urlCount = await this.countTotalUrlsInSitemaps(sitemapUrl, timeout / 2);
                                totalUrlsCount += urlCount;
                            } catch (error) {
                                console.warn(`Failed to count URLs in sitemap ${sitemapUrl}: ${error.message}`);
                            }
                        }
                        results.totalUrls = totalUrlsCount;
                        console.log(`Total URLs found: ${results.totalUrls}`);
                    }
                }
            } catch (robotsError) {
                // Ignore robots.txt errors
                results.error = `${error.message}; robots.txt: ${robotsError.message}`;
            }
        }

        return results;
    }

    /**
     * Counts the number of sitemaps in a sitemap index
     */
    countSitemapsInIndex(xmlContent) {
        const sitemapMatches = xmlContent.match(/<sitemap[^>]*>/gi) || [];
        return sitemapMatches.length;
    }

    /**
     * Counts the number of URLs in a sitemap
     */
    countUrlsInSitemap(xmlContent) {
        const urlMatches = xmlContent.match(/<url[^>]*>/gi) || [];
        return urlMatches.length;
    }

    /**
     * Extracts sitemap URLs from a sitemap index
     */
    extractSitemapUrlsFromIndex(xmlContent, baseDomain) {
        const urls = [];
        const sitemapRegex = /<loc[^>]*>([^<]+)<\/loc>/gi;

        let match;
        while ((match = sitemapRegex.exec(xmlContent)) !== null) {
            try {
                const sitemapUrl = match[1].trim();
                urls.push(sitemapUrl);
            } catch (e) {
                // Skip invalid URLs
            }
        }

        return urls;
    }

    /**
     * Extracts URLs from a sitemap
     */
    extractUrlsFromSitemap(xmlContent, baseDomain) {
        const urls = [];
        const urlRegex = /<loc[^>]*>([^<]+)<\/loc>/gi;

        let match;
        while ((match = urlRegex.exec(xmlContent)) !== null) {
            try {
                const url = match[1].trim();
                urls.push(url);
            } catch (e) {
                // Skip invalid URLs
            }
        }

        return urls;
    }

    /**
     * Gets the last modified date from sitemap
     */
    getLastModifiedFromSitemap(xmlContent) {
        const lastmodRegex = /<lastmod[^>]*>([^<]+)<\/lastmod>/i;
        const match = xmlContent.match(lastmodRegex);

        if (match && match[1]) {
            return match[1].trim();
        }

        return null;
    }

    /**
     * Extracts sitemap URLs from robots.txt
     */
    extractSitemapsFromRobots(robotsContent) {
        const urls = [];
        const sitemapRegex = /^sitemap:\s*(.+)$/gmi;

        let match;
        while ((match = sitemapRegex.exec(robotsContent)) !== null) {
            try {
                const sitemapUrl = match[1].trim();
                // Convert relative URLs to absolute
                if (!sitemapUrl.startsWith('http')) {
                    const baseUrl = new URL('/', sitemapUrl.startsWith('/') ? sitemapUrl : `/${sitemapUrl}`);
                    urls.push(baseUrl.href);
                } else {
                    urls.push(sitemapUrl);
                }
            } catch (e) {
                // Skip invalid URLs
            }
        }

        return urls;
    }

    /**
     * Creates a summary of domain sitemap analysis
     */
    createDomainSitemapSummary(domainAnalysis) {
        return {
            domain: domainAnalysis.domain,
            sitemap_url: domainAnalysis.sitemapUrl,
            hasSitemap: domainAnalysis.hasSitemap,
            sitemap_type: domainAnalysis.sitemapType,
            sitemap_size: domainAnalysis.sitemapSize,
            sitemap_lastmod: domainAnalysis.sitemapLastModified,
            sitemap_count: domainAnalysis.sitemapUrls ? domainAnalysis.sitemapUrls.length : 0,
            sitemap_error: domainAnalysis.error
        };
    }
}

module.exports = { SitemapAnalyzer };
