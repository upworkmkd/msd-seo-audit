// Test script for the local API server
const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testAPI() {
    console.log('🧪 Testing MSD SEO Audit API...\n');

    try {
        // Test 1: Health check
        console.log('1️⃣ Testing health check...');
        const healthResponse = await axios.get(`${API_BASE}/health`);
        console.log('✅ Health check passed:', healthResponse.data);
        console.log();

        // Test 2: Single page analysis
        console.log('2️⃣ Testing single page analysis...');
        const analysisResponse = await axios.post(`${API_BASE}/analyze`, {
            url: 'https://example.com',
            includeImages: true,
            maxImagesPerPage: 5
        });
        
        const analysisData = analysisResponse.data;
        console.log('✅ Single page analysis completed');
        console.log(`   URL: ${analysisData.url}`);
        console.log(`   Title: ${analysisData.title}`);
        console.log(`   SEO Score: ${analysisData.seo_page_score}/100`);
        console.log(`   Word Count: ${analysisData.wordcount}`);
        console.log(`   Word Count (content only): ${analysisData.wordcountcontentonly}`);
        console.log(`   Total Word Count: ${analysisData.totalwordcount}`);
        console.log(`   Images found: ${analysisData.images?.length || 0}`);
        
        if (analysisData.images && analysisData.images.length > 0) {
            console.log('   Sample image:');
            const sampleImage = analysisData.images[0];
            console.log(`     URL: ${sampleImage.imageUrl}`);
            console.log(`     Content Type: ${sampleImage.contentType}`);
            console.log(`     Size: ${sampleImage.sizeInByte} bytes (${sampleImage.sizeInKb} KB)`);
        }
        console.log();

        // Test 3: Batch analysis
        console.log('3️⃣ Testing batch analysis...');
        const batchResponse = await axios.post(`${API_BASE}/analyze-batch`, {
            urls: [
                'https://example.com',
                'https://www.google.com'
            ],
            includeImages: false,
            maxImagesPerPage: 3
        });
        
        const batchData = batchResponse.data;
        console.log('✅ Batch analysis completed');
        console.log(`   Total analyzed: ${batchData.total_analyzed}`);
        console.log(`   Total errors: ${batchData.total_errors}`);
        console.log();

        console.log('🎉 All tests passed successfully!');
        console.log('\n📋 API Endpoints available:');
        console.log('   GET  /health - Health check');
        console.log('   POST /analyze - Single page analysis');
        console.log('   POST /analyze-batch - Batch analysis');
        console.log('   POST /analyze-sitemap - Sitemap analysis');
        console.log('\n🔗 Import postman-collection.json into Postman for GUI testing');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('   Response status:', error.response.status);
            console.error('   Response data:', error.response.data);
        }
    }
}

// Run tests
testAPI();
