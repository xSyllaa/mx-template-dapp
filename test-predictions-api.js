/**
 * Test script for Predictions API
 * Run with: node test-predictions-api.js
 */

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3001/api';

async function testPredictionsAPI() {
  console.log('🔍 Testing Predictions API...');
  console.log('🔍 API Base URL:', API_BASE_URL);

  try {
    // Test 1: Get all predictions
    console.log('\n📋 Test 1: Get all predictions');
    const response = await fetch(`${API_BASE_URL}/predictions`);
    const data = await response.json();
    
    console.log('🔍 Response status:', response.status);
    console.log('🔍 Response data:', JSON.stringify(data, null, 2));
    
    if (data.success && data.data && data.data.predictions) {
      const predictions = data.data.predictions;
      console.log('🔍 Total predictions:', predictions.length);
      
      // Analyze status breakdown
      const statusCounts = predictions.reduce((acc, prediction) => {
        acc[prediction.status] = (acc[prediction.status] || 0) + 1;
        return acc;
      }, {});
      
      console.log('🔍 Status breakdown:', statusCounts);
      
      // Log each prediction
      predictions.forEach((prediction, index) => {
        console.log(`🔍 Prediction ${index + 1}:`, {
          id: prediction.id,
          match: `${prediction.home_team} vs ${prediction.away_team}`,
          status: prediction.status,
          start_date: prediction.start_date,
          close_date: prediction.close_date,
          created_at: prediction.created_at
        });
      });
      
      // Check for resulted/cancelled predictions
      const historicalPredictions = predictions.filter(p => 
        p.status === 'resulted' || p.status === 'cancelled'
      );
      console.log('🔍 Historical predictions count:', historicalPredictions.length);
      
      if (historicalPredictions.length === 0) {
        console.log('⚠️  No historical predictions found!');
        console.log('💡 This explains why the admin page shows (0) for historical predictions');
      }
      
    } else {
      console.error('❌ Invalid response format');
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

// Run the test
testPredictionsAPI();
