/**
 * Test script to verify file upload is working correctly
 * Run this after starting the server to test uploads
 */

const testUploadEndpoint = async () => {
    console.log('🧪 Testing Upload Endpoints\n');
    console.log('='.repeat(50));

    // Test 1: Get upload info
    console.log('\n📋 Test 1: Getting upload configuration...');
    try {
        const response = await fetch('http://localhost:5000/api/upload/info');
        const data = await response.json();

        if (data.success) {
            console.log('✅ Upload info retrieved successfully');
            console.log('Available endpoints:', Object.keys(data.endpoints));
        } else {
            console.log('❌ Failed to get upload info');
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }

    // Test 2: Check server health
    console.log('\n🏥 Test 2: Checking server health...');
    try {
        const response = await fetch('http://localhost:5000/api/health');
        const text = await response.text();
        console.log('✅ Server is running:', text);
    } catch (error) {
        console.log('❌ Server not responding:', error.message);
    }

    console.log('\n' + '='.repeat(50));
    console.log('\n📝 Manual Testing Instructions:');
    console.log('\n1. Test resume upload:');
    console.log('   curl -X POST http://localhost:5000/api/upload -F "resume=@yourfile.pdf"');
    console.log('\n2. Test image upload:');
    console.log('   curl -X POST http://localhost:5000/api/upload/image -F "image=@yourimage.jpg"');
    console.log('\n3. Get upload info:');
    console.log('   curl http://localhost:5000/api/upload/info');
    console.log('\n4. Test with wrong field name (should show helpful error):');
    console.log('   curl -X POST http://localhost:5000/api/upload -F "document=@yourfile.pdf"');
    console.log('\n');
};

// Run tests
testUploadEndpoint().catch(console.error);
