# 🏗️ MSD SEO Audit Actor - Architecture Documentation

## Overview
This document provides a comprehensive overview of the MSD SEO Audit actor's architecture, including system design, component interactions, data flow, and technical specifications.

## 🎯 System Overview

### Purpose
The MSD SEO Audit actor is a comprehensive web scraping and analysis tool designed to evaluate websites against SEO best practices, technical standards, and content quality metrics.

### Key Capabilities
- **Multi-page crawling** with configurable depth
- **Comprehensive SEO analysis** covering 50+ metrics
- **Domain-level aggregation** with statistical analysis
- **SSL certificate validation** and security assessment
- **Image optimization analysis** with detailed metadata
- **Real-time scoring** based on proprietary algorithms

## 🏛️ High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Input URLs    │───▶│  Main Controller │───▶│  SEO Analyzer   │
│                 │    │                  │    │                 │
│  Configuration  │    │  - URL Manager   │    │  - Page Parser  │
│                 │    │  - Crawl Engine  │    │  - Content Analyzer│
└─────────────────┘    │  - Data Pipeline │    │  - Link Analyzer│
                       │                  │    │  - Image Analyzer│
┌─────────────────┐    └──────────────────┘    │  - SSL Analyzer │
│   External APIs │                             │                 │
│                 │    ┌──────────────────┐    │  - Performance  │
│  - Apify API    │───▶│   Data Storage   │◀───│    Analyzer     │
│  - SSL Cert API │    │                  │    │                 │
│  - Image APIs   │    │  - Apify Dataset │    │  - SEO Scorer   │
└─────────────────┘    │  - Key-Value Store│    │                 │
                       │  - Request Queue │    │  - Report Gen   │
                       └──────────────────┘    └─────────────────┘
```

## 📦 Component Architecture

### 1. Main Controller (`src/main.js`)
**Responsibilities:**
- Input validation and processing
- Crawling orchestration
- Data aggregation and domain analysis
- Output formatting and storage

**Key Features:**
- Async/await pattern for concurrent processing
- Error handling and recovery
- SSL certificate analysis integration
- Domain-level statistics calculation

### 2. SEO Analyzer (`src/seo-analyzer.js`)
**Responsibilities:**
- HTML parsing and content extraction
- SEO element analysis
- Technical implementation verification
- Content quality assessment

**Sub-components:**
- **Page Parser:** DOM structure analysis
- **Content Analyzer:** Text content evaluation
- **Link Analyzer:** Internal/external link analysis
- **Image Analyzer:** Image metadata extraction
- **SSL Analyzer:** Certificate validation
- **Performance Analyzer:** Resource counting

### 3. SEO Scorer (`src/seo-scorer.js`)
**Responsibilities:**
- Individual metric scoring
- Weighted score aggregation
- Grade assignment (A-F scale)
- Issue identification and reporting

**Scoring Categories:**
- Title Optimization (25 points)
- Meta Description (20 points)
- Heading Structure (20 points)
- Technical SEO (20 points)
- Content Quality (10 points)
- Link Analysis (5 points)

### 4. URL Normalizer (`src/url-normalizer.js`)
**Responsibilities:**
- URL standardization
- UTM parameter removal
- Path normalization
- Domain extraction

### 5. Sitemap Analyzer (`src/sitemap-analyzer.js`)
**Responsibilities:**
- XML sitemap parsing
- URL discovery and validation
- Priority and change frequency analysis

## 🔄 Data Flow Architecture

### Phase 1: Input Processing
```
Input Parameters
    ↓
Configuration Validation
    ↓
URL List Generation
    ↓
Request Queue Initialization
```

### Phase 2: Crawling & Analysis
```
URL Queue
    ↓ (Parallel)
Page Fetching (axios)
    ↓
HTML Parsing (cheerio)
    ↓
Multi-threaded Analysis:
    ├── Content Analysis
    ├── Link Analysis
    ├── Image Analysis
    ├── SSL Analysis
    └── Technical Analysis
    ↓
Individual Page Scoring
    ↓
Results Aggregation
```

### Phase 3: Domain Analysis
```
Page Results
    ↓
Statistical Calculation
    ↓
Average Score Computation
    ↓
Domain-level Metrics
    ↓
SSL Certificate Analysis
    ↓
Final Report Generation
```

### Phase 4: Output & Storage
```
Analysis Results
    ↓
Data Formatting
    ↓
Apify Dataset Storage
    ↓
Optional External Export
```

## 🗄️ Data Storage Architecture

### Apify Platform Storage
- **Dataset:** Primary storage for analysis results
- **Key-Value Store:** Configuration and metadata
- **Request Queue:** URL management and crawling state

### Data Structure

#### Page-Level Record
```json
{
  "url": "https://example.com/page",
  "title": "Page Title",
  "seo_page_score": 85,
  "seo_grade": "B",
  "titleLength": 45,
  "descriptionLength": 155,
  "h1Count": 1,
  "h2Count": 3,
  "words": 1250,
  "internalLinksCount": 15,
  "images": [...],
  "headingStructure": [...],
  "ssl_certificate_info": {...},
  "analysis_date": "2024-01-15T10:30:00Z",
  "data_source": "msd_seo_audit"
}
```

#### Domain-Level Record
```json
{
  "domain": "example.com",
  "analysis_type": "domain_summary",
  "total_pages_analyzed": 25,
  "seo_score": 78,
  "seo_grade": "C",
  "pages_with_h1": 23,
  "pages_with_h1_percentage": 92,
  "average_title_length": 48,
  "average_words_per_page": 890,
  "ssl_certificate_info": {...},
  "analysis_date": "2024-01-15T10:30:00Z",
  "data_source": "msd_seo_audit_domain_analysis"
}
```

## 🔧 Technical Implementation

### Technology Stack
- **Runtime:** Node.js 20.x
- **Web Scraping:** Axios + Cheerio
- **SSL Analysis:** Node.js HTTPS/TLS modules
- **Data Processing:** Native JavaScript (ES6+)
- **Platform:** Apify Actor Runtime

### Dependencies
```json
{
  "apify": "^3.1.10",
  "cheerio": "^1.0.0-rc.12",
  "axios": "^1.6.2",
  "robots-parser": "^2.0.1",
  "sitemap-parser": "^0.1.0"
}
```

### Performance Characteristics
- **Memory Usage:** ~50-100MB per analysis session
- **Processing Speed:** ~5-10 pages per minute
- **Concurrent Requests:** Up to 10 parallel requests
- **Timeout Handling:** 30s per page, 5s per image request

## 🔒 Security Architecture

### SSL/TLS Implementation
- **Certificate Validation:** Custom certificate chain verification
- **Protocol Support:** TLS 1.2+ with fallback handling
- **Error Handling:** Graceful degradation for invalid certificates
- **Timeout Protection:** 10-second timeout for SSL checks

### Data Security
- **Input Validation:** Strict URL and parameter validation
- **Output Sanitization:** Safe data handling
- **API Security:** Token-based authentication
- **Privacy Compliance:** No PII collection or storage

## 📈 Scalability Architecture

### Horizontal Scaling
- **Page-level Parallelism:** Independent page processing
- **Resource Partitioning:** Memory and CPU allocation per page
- **Load Balancing:** Apify platform handles distribution
- **Rate Limiting:** Configurable request throttling

### Vertical Scaling
- **Batch Processing:** Large sites processed in chunks
- **Incremental Updates:** Only re-analyze changed content
- **Caching Strategy:** Store intermediate results
- **Memory Management:** Garbage collection optimization

## 🔍 Error Handling & Resilience

### Error Categories
1. **Network Errors:** Connection timeouts, DNS failures
2. **Parse Errors:** Malformed HTML, encoding issues
3. **SSL Errors:** Certificate validation failures
4. **Resource Errors:** Memory limits, quota exceeded
5. **API Errors:** External service failures

### Recovery Mechanisms
- **Retry Logic:** Exponential backoff for transient errors
- **Fallback Processing:** Continue analysis despite partial failures
- **Graceful Degradation:** Core features work even with missing data
- **Error Logging:** Comprehensive error tracking and reporting

## 🔄 Integration Points

### External Services
- **Apify Platform:** Actor runtime and storage
- **SSL Certificate Authorities:** Certificate validation
- **Image Hosts:** Image metadata retrieval
- **DNS Services:** Domain resolution

### API Interfaces
- **Input API:** RESTful endpoint for job submission
- **Status API:** Real-time progress monitoring
- **Output API:** Results retrieval and export
- **Logging API:** Error and debug information

## 📊 Monitoring & Observability

### Metrics Collection
- **Performance Metrics:** Processing time, memory usage
- **Quality Metrics:** Success rate, error rate
- **Business Metrics:** Pages analyzed, domains processed
- **System Metrics:** CPU, memory, network utilization

### Logging Architecture
- **Structured Logging:** JSON-formatted log entries
- **Log Levels:** Debug, Info, Warn, Error
- **Log Destinations:** Apify console, external systems
- **Log Rotation:** Automatic log management

## 🚀 Deployment Architecture

### Apify Platform Integration
```
Developer Environment
    ↓ (git push)
Apify Console
    ↓ (build trigger)
Docker Image Build
    ↓ (deployment)
Actor Runtime
    ↓ (execution)
Analysis Job
```

### Container Architecture
```
┌─────────────────────────┐
│       MSD SEO Audit     │
├─────────────────────────┤
│  Node.js 20.x Runtime   │
│  Apify Actor Framework  │
│  Custom Analysis Code   │
│  Dependencies           │
└─────────────────────────┘
```

## 🔧 Configuration Management

### Environment Variables
- `APIFY_TOKEN` - Authentication token
- `APIFY_HEADLESS` - Browser mode (1 = headless)
- `APIFY_MEMORY_MBYTES` - Memory allocation
- `APIFY_TIMEOUT_SECS` - Execution timeout

### Configuration Files
- `package.json` - Dependencies and scripts
- `apify.json` - Actor configuration
- `input_schema.json` - Input parameter validation
- `Dockerfile` - Container build instructions

## 📈 Future Architecture Enhancements

### Planned Improvements
1. **Microservices Architecture:** Separate analysis services
2. **Machine Learning Integration:** AI-powered content analysis
3. **Real-time Processing:** Streaming analysis results
4. **Multi-cloud Deployment:** AWS, GCP, Azure support
5. **Advanced Caching:** Redis integration for performance

### Scalability Roadmap
- **Phase 1 (Current):** Single-threaded analysis
- **Phase 2:** Multi-threaded page processing
- **Phase 3:** Distributed analysis clusters
- **Phase 4:** Cloud-native microservices

## 🔧 Development Guidelines

### Code Organization
```
src/
├── main.js              # Entry point and orchestration
├── seo-analyzer.js      # Core analysis engine
├── seo-scorer.js        # Scoring algorithms
├── url-normalizer.js    # URL processing utilities
└── sitemap-analyzer.js  # Sitemap parsing
```

### Testing Strategy
- **Unit Tests:** Individual component testing
- **Integration Tests:** End-to-end workflow testing
- **Performance Tests:** Load and stress testing
- **Regression Tests:** Prevent breaking changes

### Documentation Standards
- **Inline Comments:** Function and method documentation
- **API Documentation:** Input/output specifications
- **Architecture Docs:** System design documentation
- **User Guides:** Usage and troubleshooting guides

---

## 📝 Maintenance & Support

### Regular Maintenance
- **Dependency Updates:** Monthly security patches
- **Performance Optimization:** Quarterly reviews
- **Feature Enhancements:** Based on user feedback
- **Documentation Updates:** As features evolve

### Support Channels
- **Technical Issues:** Apify platform support
- **Feature Requests:** GitHub issues
- **Documentation:** README and guide updates
- **Community:** Developer forums and discussions

---

*This architecture documentation is maintained by the MSD development team and updated with each major release.*
