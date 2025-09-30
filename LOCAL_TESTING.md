# 🧪 Local Testing Guide

This guide shows you how to test the MSD SEO Audit API locally without deploying to Apify.

## 🚀 Quick Start

### 1. Start the Local API Server

```bash
# Option 1: Using npm script
npm run api

# Option 2: Direct command
node local-api-server.js
```

The server will start on `http://localhost:3000` by default.

### 2. Test the API

```bash
# Run automated tests
npm run test-api

# Or test manually with curl
curl -X POST http://localhost:3000/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

## 📊 API Endpoints

### Health Check
```http
GET http://localhost:3000/health
```

### Single Page Analysis
```http
POST http://localhost:3000/analyze
Content-Type: application/json

{
  "url": "https://example.com",
  "includeImages": true,
  "maxImagesPerPage": 10,
  "userAgent": "Mozilla/5.0 (compatible; MSD-SEO-Audit/1.0)"
}
```

### Batch Analysis
```http
POST http://localhost:3000/analyze-batch
Content-Type: application/json

{
  "urls": [
    "https://example.com",
    "https://www.google.com",
    "https://www.github.com"
  ],
  "includeImages": true,
  "maxImagesPerPage": 10
}
```

### Sitemap Analysis
```http
POST http://localhost:3000/analyze-sitemap
Content-Type: application/json

{
  "domain": "https://example.com"
}
```

## 🔧 Using Postman

1. **Import Collection**: Import `postman-collection.json` into Postman
2. **Start Server**: Run `npm run api` in terminal
3. **Test Endpoints**: Use the imported collection to test all endpoints

## 📝 Example Responses

### Single Page Analysis Response
```json
{
  "url": "https://example.com",
  "title": "Example Domain",
  "description": "This domain is for use in illustrative examples",
  "wordcount": 45,
  "wordcountcontentonly": 32,
  "totalwordcount": 127,
  "seo_page_score": 78,
  "seo_grade": "C",
  "seo_category": "Good",
  "images": [
    {
      "imageUrl": "https://example.com/image.jpg",
      "imageIndex": 1,
      "contentType": "image/jpeg",
      "sizeInByte": 0,
      "sizeInKb": 0,
      "alt": "Sample image"
    }
  ],
  "analysis_timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🛠️ Configuration

### Environment Variables
```bash
# Set custom port (default: 3000)
PORT=8080 npm run api

# Set custom user agent
USER_AGENT="My Custom Bot" npm run api
```

### Request Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `url` | string | required | URL to analyze |
| `includeImages` | boolean | true | Whether to analyze images |
| `maxImagesPerPage` | number | 10 | Maximum images to analyze |
| `userAgent` | string | default | Custom user agent string |

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Use different port
   PORT=8080 npm run api
   ```

2. **CORS errors in browser**
   - The API includes CORS headers
   - Use Postman or curl for testing

3. **Timeout errors**
   - Increase timeout in request
   - Check network connectivity

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run api
```

## 📈 Performance Tips

1. **Batch Processing**: Use `/analyze-batch` for multiple URLs
2. **Image Analysis**: Set `includeImages: false` for faster analysis
3. **Rate Limiting**: Add delays between requests if needed

## 🔒 Security Notes

- This is a development server, not production-ready
- No authentication or rate limiting implemented
- Use only for testing and development

## 📚 Next Steps

1. Test your specific URLs
2. Verify the new word count fields
3. Check image content type detection
4. Test batch processing
5. Deploy to Apify when ready

## 🆘 Support

If you encounter issues:
1. Check the console logs
2. Verify the URL is accessible
3. Test with simple URLs first (like example.com)
4. Check network connectivity
