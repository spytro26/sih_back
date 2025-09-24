#!/usr/bin/env node
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000';

async function testLCAEndpoint() {
    const testData = {
        material: "Copper ore",
        process: "Open-pit mining",
        location: "Chile",
        production_volume: 1000,
        energy_source: "Mixed grid",
        emissions: {
            current_co2: "500 tCO2eq",
            water_usage: "1500 m3"
        }
    };

    try {
        console.log('🧪 Testing LCA Assessment API...');
        console.log('📊 Input data:', JSON.stringify(testData, null, 2));
        
        const response = await fetch(`${API_BASE}/api/lca/assess`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });

        const result = await response.json();
        
        console.log('\n✅ Response Status:', response.status);
        console.log('📋 Response:', JSON.stringify(result, null, 2));
        
        if (response.ok && result.success) {
            console.log('\n🎉 Test PASSED! API is working correctly.');
            console.log(`📈 Generated assessment for ${result.data.length} lifecycle stages`);
        } else {
            console.log('\n❌ Test FAILED!');
        }
    } catch (error) {
        console.error('❌ Test ERROR:', error.message);
        console.log('\n💡 Make sure the server is running with: npm run dev');
    }
}

async function testHealthEndpoints() {
    try {
        console.log('\n🏥 Testing Health Endpoints...');
        
        // Test main health endpoint
        const healthResponse = await fetch(`${API_BASE}/health`);
        const healthData = await healthResponse.json();
        console.log('🌐 Main Health:', healthData.status);
        
        // Test LCA health endpoint
        const lcaHealthResponse = await fetch(`${API_BASE}/api/lca/health`);
        const lcaHealthData = await lcaHealthResponse.json();
        console.log('🔍 LCA Health:', lcaHealthData.status);
        
        // Test supported materials
        const materialsResponse = await fetch(`${API_BASE}/api/lca/supported-materials`);
        const materialsData = await materialsResponse.json();
        console.log(`📋 Supported Materials: ${materialsData.materials.length} materials, ${materialsData.processes.length} processes`);
        
    } catch (error) {
        console.error('❌ Health check ERROR:', error.message);
    }
}

// Run tests
async function runTests() {
    await testHealthEndpoints();
    await testLCAEndpoint();
}

runTests();