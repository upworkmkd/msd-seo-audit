const { SEOAnalyzer } = require('../src/seo-analyzer');
const cheerio = require('cheerio');

describe('SEOAnalyzer', () => {
    let analyzer;
    let mockPage;

    beforeEach(() => {
        analyzer = new SEOAnalyzer();
        mockPage = {
            evaluate: jest.fn().mockResolvedValue({ scripts: 5, stylesheets: 2 })
        };
    });

    describe('analyzePage', () => {
        it('should analyze a basic HTML page', async () => {
            const html = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Test Page</title>
                    <meta name="description" content="This is a test page description">
                    <link rel="canonical" href="https://example.com/">
                    <link rel="icon" href="/favicon.ico">
                </head>
                <body>
                    <h1>Main Heading</h1>
                    <h2>Subheading</h2>
                    <p>This is a paragraph with some content.</p>
                    <img src="/image.jpg" alt="Test image">
                </body>
                </html>
            `;

            const result = await analyzer.analyzePage({
                url: 'https://example.com',
                html,
                page: mockPage,
                includeImages: true,
                maxImagesPerPage: 10
            });

            expect(result.title).toBe('Test Page');
            expect(result.titleLength).toBe(9);
            expect(result.description).toBe('This is a test page description');
            expect(result.hasHttps).toBe(true);
            expect(result.favicon).toBe(true);
            expect(result.viewport).toBe(true);
            expect(result.charset).toBe(true);
            expect(result.canonicalUrl).toBe('https://example.com/');
            expect(result.h1Count).toBe(1);
            expect(result.h2Count).toBe(1);
            expect(result.words).toBeGreaterThan(0);
            expect(result.imagesWithoutAlt).toBe(0);
        });

        it('should handle missing title and description', async () => {
            const html = `
                <!DOCTYPE html>
                <html>
                <head></head>
                <body>
                    <p>Content without title or description</p>
                </body>
                </html>
            `;

            const result = await analyzer.analyzePage({
                url: 'http://example.com',
                html,
                page: mockPage,
                includeImages: false,
                maxImagesPerPage: 10
            });

            expect(result.title).toBe('');
            expect(result.titleLength).toBe(0);
            expect(result.description).toBe('');
            expect(result.descriptionLength).toBe(0);
            expect(result.hasHttps).toBe(false);
        });
    });

    describe('analyzeHeadings', () => {
        it('should count headings correctly', async () => {
            const html = `
                <h1>H1 Title</h1>
                <h2>H2 Subtitle 1</h2>
                <h2>H2 Subtitle 2</h2>
                <h3>H3 Sub-subtitle</h3>
            `;

            const result = await analyzer.analyzePage({
                url: 'https://example.com',
                html,
                page: mockPage,
                includeImages: false,
                maxImagesPerPage: 10
            });

            expect(result.h1Count).toBe(1);
            expect(result.h2Count).toBe(2);
            expect(result.h3Count).toBe(1);
            expect(result.h4Count).toBe(0);
            expect(result.h1).toEqual(['H1 Title']);
            expect(result.h2).toEqual(['H2 Subtitle 1', 'H2 Subtitle 2']);
            expect(result.h3).toEqual(['H3 Sub-subtitle']);
        });
    });

    describe('analyzeImages', () => {
        it('should detect images without alt text', async () => {
            const html = `
                <img src="/image1.jpg" alt="Good image">
                <img src="/image2.jpg" alt="">
                <img src="/image3.jpg">
            `;

            const result = await analyzer.analyzePage({
                url: 'https://example.com',
                html,
                page: mockPage,
                includeImages: true,
                maxImagesPerPage: 10
            });

            expect(result.imagesWithoutAlt).toBe(2);
            expect(result.images).toHaveLength(3);
        });
    });
});
