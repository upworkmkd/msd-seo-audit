/**
 * SEO Scorer for MSD SEO Audit Actor
 * 
 * @author MySmartDigital
 * @description Comprehensive SEO scoring algorithm that evaluates websites based on
 * technical SEO, content quality, performance metrics, and best practices.
 * Provides detailed scoring (0-100), grade assignment (A-F), and issue identification.
 */
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
        // Use the detailed heading score from the analyzer if available
        if (seoData.headingScore !== undefined) {
            const headingScore = Number(seoData.headingScore);
            score += Math.floor(headingScore * 0.2) - 20; // Scale to 20 points max

            if (headingScore < 50) {
                issues.push('poor heading structure');
            }
        } else {
            // Fallback to basic heading analysis
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
        }
        
        // 4. TECHNICAL SEO (20 points)
        if (!seoData.hasHttps) {
            score -= 10;
            issues.push('no HTTPS');
        }

        // Check xRobots and metaRobots for indexing issues
        const xRobots = seoData.xRobots || '';
        const metaRobots = seoData.metaRobots || '';

        if (xRobots.toLowerCase().includes('noindex') || metaRobots.toLowerCase().includes('noindex')) {
            score -= 15;
            issues.push('page set to noindex');
        }

        if (xRobots.toLowerCase().includes('nofollow') || metaRobots.toLowerCase().includes('nofollow')) {
            score -= 5;
            issues.push('page set to nofollow');
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
        
        // 5. CONTENT QUALITY (10 points)
        // Use wordcountcontentonly for scoring as it represents actual content users see
        const words = Number(seoData.wordcountcontentonly || seoData.words || 0);
        const totalWords = Number(seoData.totalwordcount || 0);
        const realWords = Number(seoData.wordcount || seoData.words || 0);
        
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

module.exports = { SEOScorer };
