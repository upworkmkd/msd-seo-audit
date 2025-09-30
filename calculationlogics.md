# 📊 MSD SEO Audit - Calculation Logics

## Overview
This document outlines the actual calculation methodologies implemented in the MSD SEO Audit actor for scoring and analysis.

## 🔢 SEO Page Score Calculation (0-100 Scale)

### Base Score Calculation
**Formula:** `score = 100 - Σ(penalties) + Σ(bonuses)`

The scoring system uses a penalty-based approach starting from a perfect score of 100, then applying penalties for issues and bonuses for good practices.

### 1. Title Optimization Penalties
**Title Length Penalties:**
- Missing title or <10 characters → -15 points
- Title >60 characters → -8 points
- Title <30 characters → -5 points

**Title Quality Penalties:**
- No title optimization issues → No penalty
- Poor title structure → Issue flagged but no direct penalty

### 2. Meta Description Penalties
**Description Length Penalties:**
- Missing description or <120 characters → -12 points
- Description >160 characters → -6 points

### 3. Heading Structure Penalties
**H1 Structure Penalties:**
- No H1 tag → -18 points
- Multiple H1 tags → -12 points

**Hierarchy Bonuses:**
- H1 + H2 present → +2 points
- H1 + H2 + H3 present → +3 points (includes above bonus)

**Advanced Heading Scoring:**
- Uses detailed heading score from analyzer (0-100 scale)
- Scaled to 20-point maximum contribution
- Poor heading structure (<50) → Issues flagged

### 4. Technical SEO Penalties
**HTTPS Implementation:**
- No HTTPS → -10 points

**Robots Directives:**
- Page set to noindex → -15 points
- Page set to nofollow → -5 points

**Technical Elements:**
- No favicon → -3 points
- No OpenGraph tags → -4 points
- No viewport meta tag → -3 points

### 5. Content Quality Penalties
**Word Count Penalties:**
- <150 words → -8 points
- 150-299 words → -5 points
- 800+ words → +2 bonus points

**Content Structure:**
- No strong/emphasis tags on pages with >200 words → -2 points

### 6. Image Optimization Penalties
**Alt Text Issues:**
- Images without alt text → -1 point per image (max -5 points)
- Issues flagged for each problematic image

### 7. Advanced Bonuses (up to 5 points)
**Schema and Structured Data:**
- Has Schema.org, JSON-LD, or Microdata → +2 points

**Canonical URL:**
- Has canonical URL → +1 point

**Internationalization:**
- Has hreflang tags → +1 point

**Mobile Optimization:**
- Has apple-touch-icon → +1 point

### 8. Performance Penalties
**Resource Loading:**
- >20 JavaScript files → -3 points
- >10 CSS files → -2 points

## 🏆 Domain-Level Analysis Calculations

### Average SEO Score
```
domain_seo_score = Σ(page_seo_scores) / total_pages
```

### Grade Assignment
```
A = 90-100
B = 80-89
C = 70-79
D = 60-69
F = 0-59
```

### Statistical Metrics
- **Pages with H1:** `(pages_with_h1 / total_pages) * 100`
- **Pages with Meta Description:** `(pages_with_meta_description / total_pages) * 100`
- **Pages with Images:** `(pages_with_images / total_pages) * 100`
- **Pages with Errors:** `(pages_with_errors / total_pages) * 100`

### Status Code Analysis
- **Successful Pages:** `(pages_with_successful_status / total_pages) * 100`
- **Redirect Pages:** `(pages_with_redirect_status / total_pages) * 100`
- **Error Pages:** `(pages_with_error_status / total_pages) * 100`

### OpenGraph Coverage
- **Pages with OpenGraph:** `(pages_with_opengraph / total_pages) * 100`
- **Pages with OpenGraph Title:** `(pages_with_opengraph_title / total_pages) * 100`
- **Pages with OpenGraph Description:** `(pages_with_opengraph_description / total_pages) * 100`
- **Pages with OpenGraph Image:** `(pages_with_opengraph_image / total_pages) * 100`

### Averages
- **Average Title Length:** `Σ(title_lengths) / total_pages`
- **Average Description Length:** `Σ(description_lengths) / total_pages`
- **Average Words per Page:** `Σ(word_counts) / total_pages`
- **Average Internal Links:** `Σ(internal_link_counts) / total_pages`

## 🔒 SSL Certificate Analysis

### Certificate Status Detection
- **Valid:** Certificate exists and is not expired
- **Expiring Soon:** Expires within 30 days
- **Expired:** Certificate has expired
- **No Certificate:** No SSL certificate found
- **Connection Error:** Cannot connect to check SSL

### Days Until Expiry Calculation
```
days_until_expiry = (certificate_valid_to - current_date) / (1000 * 60 * 60 * 24)
```

### SSL Certificate Data Collection
- **Certificate Subject:** CN from certificate subject
- **Certificate Issuer:** CN from certificate issuer
- **Valid Until:** Certificate validity end date
- **Serial Number:** Certificate serial number
- **Fingerprint:** Certificate fingerprint

## 📈 Image Analysis Calculations

### Image Quality Metrics
- **Images Without Alt:** Count of images missing alt text
- **Images List:** Array of image URLs found on page
- **Image Metadata:** Alt text, dimensions (when available)

### Image Score Impact
- **Missing alt text penalty:** -1 point per image (max -5 points total)
- **Images flagged:** Each problematic image generates an issue note

## 🎯 Score Finalization

### Score Normalization
- **Final Score:** `Math.max(0, Math.min(100, Math.round(score)))`
- **Issue Counting:** Total number of SEO issues detected
- **Grade Assignment:** Based on final score using standard thresholds

### Grade Thresholds

| Score Range | Grade | Description |
|-------------|-------|-------------|
| 90-100 | A | Excellent |
| 80-89 | B | Good |
| 70-79 | C | Fair |
| 60-69 | D | Poor |
| 0-59 | F | Critical |

### Score Categories

| Score Range | Category | Description |
|-------------|----------|-------------|
| 85-100 | Excellent | Outstanding SEO implementation |
| 70-84 | Good | Well-optimized content |
| 50-69 | Needs Improvement | Several SEO issues to address |
| 0-49 | Poor | Critical SEO problems |

## 🔄 Score Recalculation

The actor recalculates scores when:
- New pages are analyzed
- Existing pages are re-crawled
- Page content changes are detected
- New scoring factors are implemented

## 📊 Issue Detection and Reporting

### Issue Categories
- **Critical Issues:** Major SEO problems (title, meta description, H1 structure)
- **Technical Issues:** HTTPS, robots directives, technical elements
- **Content Issues:** Word count, content structure, emphasis usage
- **Image Issues:** Missing alt text, broken images
- **Performance Issues:** Excessive resources, slow loading

### Issue Prioritization
- **High Priority:** Issues affecting search engine crawling and indexing
- **Medium Priority:** Issues affecting user experience and rankings
- **Low Priority:** Best practice recommendations and minor optimizations

---

## 📝 Implementation Notes

1. **Penalty-Based Scoring:** System starts at 100 and applies penalties for issues
2. **Bonus System:** Additional points for advanced SEO implementations
3. **Real-time Analysis:** Scores reflect current page state at analysis time
4. **Comprehensive Coverage:** Evaluates technical, content, and user experience factors
5. **Actionable Feedback:** Provides specific issues and improvement recommendations
