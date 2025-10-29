/**
 * SEO Analyzer for MSD SEO Audit Actor
 * 
 * @author MySmartDigital
 * @description Core SEO analysis engine that performs comprehensive website analysis including
 * technical SEO checks, content analysis, heading structure, image optimization,
 * meta tags, and performance metrics using Cheerio for HTML parsing.
 */

const cheerio = require('cheerio');

class SEOAnalyzer {
    constructor() {
        this.cheerio = cheerio;
    }

    async analyzePage({ url, html, page, includeImages = true, maxImagesPerPage = -1, statusCode = 200 }) {
        const $ = this.cheerio.load(html);
        
        // Basic page information
        const title = this.extractTitle($);
        const description = this.extractMetaDescription($);
        const language = this.extractLanguage($);
        
        // Technical SEO
        const technicalSeo = this.analyzeTechnicalSEO($, url);
        
        // Meta tags and robots
        const metaData = this.analyzeMetaTags($);

        // OpenGraph analysis
        const openGraphAnalysis = this.analyzeOpenGraph($);

        // Heading structure
        const headingStructure = this.analyzeHeadings($);
        
        // Content analysis
        const contentAnalysis = this.analyzeContent($);
        
        // Links analysis
        const linksAnalysis = await this.analyzeLinks($, url);
        
        // Images analysis
        const imagesAnalysis = includeImages ? 
            this.analyzeImages($, url, maxImagesPerPage) : 
            { imagesWithoutAlt: 0, images_list: [] };
        
        // Schema and structured data
        const structuredData = this.analyzeStructuredData($);
        
        // Performance indicators
        const performance = await this.analyzePerformance(page);
        
        // Extract all titles for analysis
        const allTitles = [];
        $('title').each((i, el) => {
            const titleText = $(el).text().trim();
            if (titleText) allTitles.push(titleText);
        });
        
        // Extract all heading texts
        const h1Tags = [];
        const h2Tags = [];
        const h3Tags = [];
        const h4Tags = [];
        const h5Tags = [];
        const h6Tags = [];
        
        $('h1').each((i, el) => h1Tags.push($(el).text().trim()));
        $('h2').each((i, el) => h2Tags.push($(el).text().trim()));
        $('h3').each((i, el) => h3Tags.push($(el).text().trim()));
        $('h4').each((i, el) => h4Tags.push($(el).text().trim()));
        $('h5').each((i, el) => h5Tags.push($(el).text().trim()));
        $('h6').each((i, el) => h6Tags.push($(el).text().trim()));
        
        // Links are now analyzed in the analyzeLinks method
        
        // Extract iframes
        const iframes = $('iframe').length;
        
        // Extract hreflang
        const hreflang = [];
        $('link[rel="alternate"][hreflang]').each((i, el) => {
            hreflang.push($(el).attr('hreflang'));
        });
        
        // Extract images without alt
        const imagesWithoutAlt = [];
        $('img[src]').each((i, el) => {
            const alt = $(el).attr('alt');
            if (!alt || alt.trim() === '') {
                imagesWithoutAlt.push($(el).attr('src') || '');
            }
        });
        
        // Detect various features
        const hasGoogleAnalytics = $('script').text().includes('google-analytics') ||
                                 $('script').text().includes('gtag') ||
                                 $('script[src*="google-analytics"]').length > 0;

        const hasAmp = $('link[rel="amphtml"]').length > 0;
        const hasAppleTouchIcon = $('link[rel="apple-touch-icon"]').length > 0;

        // Count duplicate words in title
        const titleDuplicateWords = this.countDuplicateWords(title);

        // Detect Lorem Ipsum
        const loremIpsum = this.detectLoremIpsum($('body').text());

        // Extract images with detailed information
        const images = await this.analyzeImagesDetailed($, url, includeImages, maxImagesPerPage);

        // Extract heading structure
        const detailedHeadingStructure = this.analyzeHeadingStructure($);

        // Calculate heading score
        const headingScore = this.calculateHeadingScore(detailedHeadingStructure, title);

        return {
            // Basic Page Information
            url: url,
            pageStatusCode: statusCode,
            language: language,
            
            // SEO Feature Flags (individual boolean properties)
            hasHttps: technicalSeo.hasHttps,
            pageHttpsStatus: url.startsWith('https://'),
            hasHreflang: hreflang.length > 0,
            hasOpenGraph: openGraphAnalysis.hasOpenGraph,
            hasTwitterCards: metaData.hasTwitterCards,
            hasSchema: structuredData.hasSchema,
            hasJsonLd: structuredData.hasJsonLd,
            hasMicrodata: structuredData.hasMicrodata,
            hasAmp: hasAmp,
            hasGoogleAnalytics: hasGoogleAnalytics,
            viewport: technicalSeo.viewport,
            mobileResponsive: technicalSeo.viewport,
            charset: technicalSeo.charset,
            favicon: technicalSeo.favicon,
            appleTouchIcon: hasAppleTouchIcon,
            
            // Title Information
            title: title,
            titleLength: title ? title.length : 0,
            titleDuplicateWords: titleDuplicateWords,
            allTitles: allTitles,
            titleCount: allTitles.length,
            headTitleCount: allTitles.length,
            
            // Description Information
            description: description,
            descriptionLength: description ? description.length : 0,
            
            // Headings Information
            h1: h1Tags,
            h2: h2Tags,
            h3: h3Tags,
            h4: h4Tags,
            h5: h5Tags,
            h6: h6Tags,
            h1Count: h1Tags.length,
            h2Count: h2Tags.length,
            h3Count: h3Tags.length,
            h4Count: h4Tags.length,
            h5Count: h5Tags.length,
            h6Count: h6Tags.length,
            headingStructure: detailedHeadingStructure,
            headingScore: headingScore,
            
            // Content Information
            words: contentAnalysis.words,
            wordcount: contentAnalysis.wordcount,
            wordcountcontentonly: contentAnalysis.wordcountcontentonly,
            totalwordcount: contentAnalysis.totalwordcount,
            paragraphs: contentAnalysis.paragraphs,
            strongTags: contentAnalysis.strongTags,
            loremIpsum: loremIpsum,
            
            // Technical SEO / Meta
            canonicalUrl: technicalSeo.canonicalUrl,
            metaRobots: metaData.metaRobots,
            xRobots: metaData.xRobots,
            hreflang: hreflang.length > 0,
            
            // OpenGraph Data
            openGraphData: openGraphAnalysis.openGraphData,
            openGraphTags: openGraphAnalysis.openGraphTags,
            
            // Links Information (breakdown first, then counts)
            internalLinks: linksAnalysis.internalLinks,
            internalLinksCount: linksAnalysis.internalLinksCount,
            externalLinks: linksAnalysis.externalLinks,
            externalLinksCount: linksAnalysis.externalLinksCount,
            averageAnchorTextLength: linksAnalysis.averageAnchorTextLength,
            brokenInternalLinks: linksAnalysis.brokenInternalLinks,
            brokenExternalLinks: linksAnalysis.brokenExternalLinks,
            totalBrokenLinks: linksAnalysis.totalBrokenLinks,
            brokenLinksPercentage: linksAnalysis.brokenLinksPercentage,
            
            // Images Information
            images: images,
            imagesWithoutAlt: imagesWithoutAlt.length,
            
            // Other
            iframes: iframes
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
        const twitterCards = $('meta[name^="twitter:"]').length > 0;

        return {
            metaRobots,
            xRobots,
            hasTwitterCards: !!twitterCards,
            meta_indexed: metaRobots.toLowerCase().includes('noindex') ? 0 : 1
        };
    }

    analyzeOpenGraph($) {
        const openGraphTags = {};
        const openGraphData = {
            title: null,
            description: null,
            image: null,
            url: null,
            site_name: null,
            type: null,
            locale: null,
            images: [] // Array of image objects
        };

        // Extract all OpenGraph meta tags
        $('meta[property^="og:"]').each((i, el) => {
            const property = $(el).attr('property');
            const content = $(el).attr('content');

            if (property && content) {
                openGraphTags[property] = content;

                // Map common OpenGraph properties to our data structure
                if (property === 'og:title') {
                    openGraphData.title = content;
                } else if (property === 'og:description') {
                    openGraphData.description = content;
                } else if (property === 'og:image') {
                    openGraphData.image = content;
                    openGraphData.images.push({
                        url: content,
                        alt: null, // We'll try to get alt from other tags
                        width: null,
                        height: null,
                        type: null
                    });
                } else if (property === 'og:url') {
                    openGraphData.url = content;
                } else if (property === 'og:site_name') {
                    openGraphData.site_name = content;
                } else if (property === 'og:type') {
                    openGraphData.type = content;
                } else if (property === 'og:locale') {
                    openGraphData.locale = content;
                } else if (property === 'og:image:width') {
                    if (openGraphData.images.length > 0) {
                        openGraphData.images[openGraphData.images.length - 1].width = content;
                    }
                } else if (property === 'og:image:height') {
                    if (openGraphData.images.length > 0) {
                        openGraphData.images[openGraphData.images.length - 1].height = content;
                    }
                } else if (property === 'og:image:type') {
                    if (openGraphData.images.length > 0) {
                        openGraphData.images[openGraphData.images.length - 1].type = content;
                    }
                } else if (property === 'og:image:alt') {
                    if (openGraphData.images.length > 0) {
                        openGraphData.images[openGraphData.images.length - 1].alt = content;
                    }
                }
            }
        });

        return {
            hasOpenGraph: Object.keys(openGraphTags).length > 0,
            openGraphTags: openGraphTags,
            openGraphData: openGraphData
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
        // Get total word count (including all text, tags, CSS, etc.)
        const totalWordCount = this.getTotalWordCount($);
        
        // Get word count without header and footer (standard content)
        const wordCountWithoutHeader = this.getWordCountWithoutHeaderFooter($);
        
        // Get real word count (visible text without tags, but including header/footer)
        const wordCount = this.getRealWordCount($);
        
        const paragraphs = $('p').length;
        const strongTags = $('strong, b').length;
        
        // Check for lorem ipsum using the main content
        const loremIpsum = /lorem\s+ipsum/i.test($('body').text());
        
        return {
            wordcount: wordCount,
            wordcountcontentonly: wordCountWithoutHeader,
            totalwordcount: totalWordCount,
            words: wordCount, // Keep for backward compatibility
            paragraphs,
            strongTags,
            loremIpsum
        };
    }

    getTotalWordCount($) {
        // Get all text content including HTML tags, CSS, JavaScript, etc.
        const htmlContent = $.html();
        // Count words in the entire HTML content
        const words = htmlContent.split(/\s+/).filter(word => word.length > 0).length;
        return words;
    }

    getWordCountWithoutHeaderFooter($) {
        // Create a temporary copy for manipulation
        const temp$ = this.cheerio.load($.html());
        
        // Remove header and footer elements (common WordPress patterns)
        temp$('header, footer, nav, .header, .footer, #header, #footer, .site-header, .site-footer, .main-header, .main-footer').remove();
        
        // Also remove common WordPress header/footer sections
        temp$('div[class*="header"], div[class*="footer"], section[class*="header"], section[class*="footer"]').remove();
        temp$('div[id*="header"], div[id*="footer"], section[id*="header"], section[id*="footer"]').remove();
        
        // Remove script, style, and other non-content elements
        temp$('script, style, aside, .sidebar, .widget, .menu, .navigation').remove();
        
        // Get text content
        const bodyText = temp$('body').text();
        const words = bodyText.split(/\s+/).filter(word => word.length > 0).length;
        return words;
    }

    getRealWordCount($) {
        // Create a temporary copy for manipulation
        const temp$ = this.cheerio.load($.html());
        
        // Remove script and style elements but keep header/footer
        temp$('script, style').remove();
        
        // Get visible text content (what users see)
        const bodyText = temp$('body').text();
        const words = bodyText.split(/\s+/).filter(word => word.length > 0).length;
        return words;
    }

    async analyzeLinks($, baseUrl) {
        const links = $('a[href]');
        let internalLinksCount = 0;
        let externalLinksCount = 0;
        let totalAnchorTextLength = 0;
        const internalLinks = [];
        const externalLinks = [];
        
        // Social media domains to exclude from external links
        const socialMediaDomains = [
            'facebook.com', 'fb.com', 'm.facebook.com',
            'twitter.com', 't.co', 'x.com',
            'instagram.com', 'linkedin.com',
            'youtube.com', 'youtu.be',
            'pinterest.com', 'tiktok.com',
            'snapchat.com', 'whatsapp.com',
            'telegram.org', 'discord.com',
            'reddit.com', 'tumblr.com',
            'flickr.com', 'vimeo.com',
            'medium.com', 'github.com',
            'bit.ly', 'tinyurl.com', 'goo.gl'
        ];
        
        links.each((_, link) => {
            const href = $(link).attr('href');
            const anchorText = $(link).text().trim();
            const target = $(link).attr('target') || null;
            
            if (anchorText) {
                totalAnchorTextLength += anchorText.length;
            }
            
            if (href) {
                try {
                    const url = new URL(href, baseUrl);
                    const baseHost = new URL(baseUrl).hostname;
                    
                    // Skip hash-only links (fragments pointing to same page)
                    const baseUrlObj = new URL(baseUrl);
                    const isHashOnlyLink = (
                        url.href === baseUrl + '#' || 
                        url.href === baseUrl + '#content' ||
                        (url.pathname === baseUrlObj.pathname && url.hash && url.hash !== '') ||
                        (url.pathname === '/' && url.hash && url.hash !== '') ||
                        (url.pathname.endsWith('/') && url.hash && url.hash !== '' && url.pathname === baseUrlObj.pathname) ||
                        href.endsWith('#') // Links ending with just #
                    );
                    
                    if (isHashOnlyLink) {
                        return; // Skip this link
                    }
                    
                    const linkData = {
                        url: url.href,
                        anchorText: anchorText,
                        target: target,
                        statusCode: null,
                        isBroken: false
                    };
                    
                    if (url.hostname === baseHost) {
                        internalLinksCount++;
                        internalLinks.push(linkData);
                    } else {
                        // Check if it's a social media link
                        const isSocialMedia = socialMediaDomains.some(domain => 
                            url.hostname === domain || url.hostname.endsWith('.' + domain)
                        );
                        
                        if (!isSocialMedia) {
                            externalLinksCount++;
                            externalLinks.push(linkData);
                        }
                    }
                } catch (e) {
                    // Invalid URL, skip
                }
            }
        });
        
        // Check link status codes
        await this.checkLinkStatuses(internalLinks);
        await this.checkLinkStatuses(externalLinks);
        
        const averageAnchorTextLength = links.length > 0 ? 
            Math.round(totalAnchorTextLength / links.length) : 0;
        
        const brokenInternalLinks = internalLinks.filter(link => link.isBroken).length;
        const brokenExternalLinks = externalLinks.filter(link => link.isBroken).length;
        const totalBrokenLinks = brokenInternalLinks + brokenExternalLinks;
        const totalValidLinks = internalLinksCount + externalLinksCount;
        
        return {
            internalLinksCount,
            externalLinksCount,
            averageAnchorTextLength,
            internalLinks,
            externalLinks,
            brokenInternalLinks,
            brokenExternalLinks,
            totalBrokenLinks,
            brokenLinksPercentage: totalValidLinks > 0 ? Math.round((totalBrokenLinks / totalValidLinks) * 100) : 0
        };
    }

    async checkLinkStatuses(links) {
        const axios = require('axios');
        
        // Process links in batches to avoid overwhelming servers
        const batchSize = 5;
        for (let i = 0; i < links.length; i += batchSize) {
            const batch = links.slice(i, i + batchSize);
            
            const promises = batch.map(async (link) => {
                // Handle mailto links specially
                if (link.url.startsWith('mailto:')) {
                    const emailAddress = link.url.substring(7); // Remove 'mailto:' prefix
                    
                    // Check if there's a valid email address after mailto:
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (emailAddress && emailAddress.trim() && emailRegex.test(emailAddress.trim())) {
                        link.statusCode = 200;
                        link.isBroken = false;
                    } else {
                        link.statusCode = 400;
                        link.isBroken = true;
                    }
                    return;
                }
                
                // Handle other protocols (tel:, sms:, etc.) as valid
                if (link.url.startsWith('tel:') || link.url.startsWith('sms:') || link.url.startsWith('whatsapp:')) {
                    link.statusCode = 200;
                    link.isBroken = false;
                    return;
                }
                
                // For HTTP/HTTPS links, check with HEAD request
                try {
                    const response = await axios.head(link.url, {
                        timeout: 10000,
                        maxRedirects: 5,
                        validateStatus: function (status) {
                            return status < 500; // Accept all status codes below 500
                        }
                    });
                    
                    link.statusCode = response.status;
                    link.isBroken = response.status >= 400;
                    
                } catch (error) {
                    link.statusCode = error.response?.status || 0;
                    link.isBroken = true;
                }
            });
            
            await Promise.all(promises);
            
            // Small delay between batches to be respectful
            if (i + batchSize < links.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
    }

    analyzeImages($, baseUrl, maxImagesPerPage) {
        const images = $('img[src]');
        const imagesWithoutAlt = [];
        const images_list = [];
        
        // If maxImagesPerPage is -1, process all images; otherwise use the limit
        const imagesToProcess = maxImagesPerPage === -1 ? images : images.slice(0, maxImagesPerPage);
        
        imagesToProcess.each((_, img) => {
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
            images_list: maxImagesPerPage === -1 ? images_list : images_list.slice(0, maxImagesPerPage)
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
            // Check if page has evaluate method (it might be a mock object)
            if (!page || typeof page.evaluate !== 'function') {
                console.log('Using mock page object, returning default performance metrics');
                return {
                    javascriptFiles: 0,
                    cssFiles: 0
                };
            }

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

    countDuplicateWords(text) {
        if (!text) return 0;
        const words = text.toLowerCase().split(/\s+/);
        const wordCount = {};
        let duplicates = 0;
        
        words.forEach(word => {
            if (word.length > 2) { // Only count words longer than 2 characters
                wordCount[word] = (wordCount[word] || 0) + 1;
                if (wordCount[word] === 2) duplicates++;
            }
        });
        
        return duplicates;
    }

    detectLoremIpsum(text) {
        if (!text) return false;
        const loremPatterns = [
            /lorem\s+ipsum/i,
            /dolor\s+sit\s+amet/i,
            /consectetur\s+adipiscing/i,
            /sed\s+do\s+eiusmod/i
        ];

        return loremPatterns.some(pattern => pattern.test(text));
    }

    async analyzeImagesDetailed($, baseUrl, includeImages, maxImagesPerPage) {
        if (!includeImages) return [];

        const images = [];
        const imageElements = $('img[src]').toArray();
        
        // If maxImagesPerPage is -1, process all images; otherwise use the limit
        const maxImages = maxImagesPerPage === -1 ? imageElements.length : maxImagesPerPage;

        for (let i = 0; i < imageElements.length && i < maxImages; i++) {
            const el = imageElements[i];
            const $img = $(el);
            const src = $img.attr('src');

            if (!src) continue;

            try {
                let fullUrl;
                if (src.startsWith('http')) {
                    fullUrl = src;
                } else if (src.startsWith('/')) {
                    fullUrl = new URL(baseUrl).origin + src;
                } else {
                    fullUrl = new URL(src, baseUrl).href;
                }

                // Detect content type and calculate size
                const { contentType, sizeInBytes, sizeInKb } = await this.detectImageInfo(fullUrl);

                images.push({
                    imageUrl: fullUrl,
                    imageIndex: i + 1,
                    contentLength: sizeInBytes,
                    contentType: contentType,
                    statusCode: 200, // Assume successful for now
                    alt: $img.attr('alt') || '',
                    sizeInByte: sizeInBytes,
                    sizeInKb: sizeInKb
                });

            } catch (error) {
                // Skip invalid URLs
                continue;
            }
        }

        return images;
    }

    async detectImageInfo(imageUrl) {
        // Handle data URIs
        if (imageUrl.startsWith('data:')) {
            const [header, data] = imageUrl.split(',');
            const mimeMatch = header.match(/data:([^;]+)/);
            const contentType = mimeMatch ? mimeMatch[1] : 'image/unknown';
            
            // Calculate size from base64 data
            const sizeInBytes = Math.round((data.length * 3) / 4);
            const sizeInKb = Math.round((sizeInBytes / 1000) * 100) / 100;
            
            return { contentType, sizeInBytes, sizeInKb };
        }
        
        // Handle regular URLs - detect from file extension first
        const url = new URL(imageUrl);
        const pathname = url.pathname.toLowerCase();
        
        let contentType = 'image/unknown';
        let sizeInBytes = 0;
        let sizeInKb = 0;
        
        // Detect content type from file extension
        if (pathname.endsWith('.jpg') || pathname.endsWith('.jpeg')) {
            contentType = 'image/jpeg';
        } else if (pathname.endsWith('.png')) {
            contentType = 'image/png';
        } else if (pathname.endsWith('.gif')) {
            contentType = 'image/gif';
        } else if (pathname.endsWith('.webp')) {
            contentType = 'image/webp';
        } else if (pathname.endsWith('.svg')) {
            contentType = 'image/svg+xml';
        } else if (pathname.endsWith('.bmp')) {
            contentType = 'image/bmp';
        } else if (pathname.endsWith('.ico')) {
            contentType = 'image/x-icon';
        } else if (pathname.endsWith('.tiff') || pathname.endsWith('.tif')) {
            contentType = 'image/tiff';
        } else if (pathname.endsWith('.avif')) {
            contentType = 'image/avif';
        } else if (pathname.endsWith('.heic')) {
            contentType = 'image/heic';
        } else if (pathname.endsWith('.heif')) {
            contentType = 'image/heif';
        }
        
        // Try to get actual file size via HEAD request
        try {
            const axios = require('axios');
            const response = await axios.head(imageUrl, {
                timeout: 5000,
                maxRedirects: 3,
                validateStatus: function (status) {
                    return status < 500; // Accept all status codes below 500
                }
            });
            
            // Get content length from headers
            const contentLength = response.headers['content-length'];
            if (contentLength) {
                sizeInBytes = parseInt(contentLength, 10);
                sizeInKb = Math.round((sizeInBytes / 1000) * 100) / 100;
            }
            
            // Update content type from response headers if available
            const responseContentType = response.headers['content-type'];
            if (responseContentType && responseContentType.startsWith('image/')) {
                contentType = responseContentType;
            }
            
        } catch (error) {
            // If HEAD request fails, keep the file extension-based detection
            // and size will remain 0
            console.warn(`Could not get size for image ${imageUrl}: ${error.message}`);
        }
        
        return { contentType, sizeInBytes, sizeInKb };
    }

    analyzeHeadingStructure($) {
        const headings = [];

        $('h1, h2, h3, h4, h5, h6').each((index, element) => {
            const $el = $(element);
            const tag = $el.get(0).tagName.toLowerCase();
            const level = parseInt(tag.charAt(1));
            const text = $el.text().trim();

            if (text) {
                headings.push({
                    tag: tag,
                    level: level,
                    text: text,
                    position: headings.length + 1
                });
            }
        });

        return headings;
    }

    calculateHeadingScore(headings, title) {
        let score = 0;
        let maxScore = 100;

        // 1. H1 presence (20 points)
        const h1Count = headings.filter(h => h.tag === 'h1').length;
        if (h1Count === 1) {
            score += 20;
        } else if (h1Count === 0) {
            // No penalty, but less optimal
        } else {
            score += 10; // Multiple H1s get some points but not full
        }

        // 2. Proper hierarchy (30 points)
        let hierarchyScore = 0;
        let previousLevel = 0;
        let consecutiveSameLevel = 0;
        let maxHierarchy = 0;

        for (const heading of headings) {
            if (heading.level > previousLevel + 1 && previousLevel !== 0) {
                hierarchyScore -= 5; // Skip levels
            } else if (heading.level === previousLevel) {
                consecutiveSameLevel++;
                if (consecutiveSameLevel > 2) {
                    hierarchyScore -= 2; // Too many consecutive same level
                }
            } else {
                consecutiveSameLevel = 0;
            }

            previousLevel = heading.level;
            maxHierarchy = Math.max(maxHierarchy, heading.level);
        }

        // Bonus for good hierarchy
        hierarchyScore += Math.min(maxHierarchy * 5, 20);
        hierarchyScore = Math.max(hierarchyScore, 0);
        score += Math.min(hierarchyScore, 30);

        // 3. Title relevance (20 points)
        if (title) {
            const titleWords = title.toLowerCase().split(/\s+/);
            const titleHasKeywords = headings.some(h =>
                h.text.toLowerCase().split(/\s+/).some(word =>
                    titleWords.includes(word)
                )
            );
            if (titleHasKeywords) {
                score += 20;
            }
        }

        // 4. Content distribution (30 points)
        const h2Count = headings.filter(h => h.tag === 'h2').length;
        const h3Count = headings.filter(h => h.tag === 'h3').length;
        const totalHeadings = headings.length;

        if (totalHeadings >= 3) {
            score += 15;
            if (h2Count >= 2) score += 10;
            if (h3Count >= 3) score += 5;
        }

        return Math.max(0, Math.min(100, score));
    }
}

module.exports = { SEOAnalyzer };
