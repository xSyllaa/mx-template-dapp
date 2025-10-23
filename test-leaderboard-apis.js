/**
 * Test script for Leaderboard APIs with specific timeframes
 * Tests the new endpoint structure: all-time, weekly, monthly
 */

const API_BASE_URL = 'http://localhost:3001/api';

// Test configuration
const TEST_CONFIG = {
  allTime: { limit: 10, offset: 0 },
  weekly: { week: 45, year: 2024, limit: 10, offset: 0 },
  monthly: { month: 11, year: 2024, limit: 10, offset: 0 }
};

/**
 * Test All-Time Leaderboard API
 */
async function testAllTimeLeaderboard() {
  console.log('\n🧪 Testing All-Time Leaderboard API...');
  
  try {
    const params = new URLSearchParams(TEST_CONFIG.allTime);
    const response = await fetch(`${API_BASE_URL}/leaderboard/all-time?${params}`);
    const data = await response.json();
    
    console.log('✅ All-Time Leaderboard Response:', {
      status: response.status,
      success: data.success,
      hasData: !!data.data,
      entriesCount: data.data?.entries?.length || 0,
      total: data.data?.total || 0,
      hasMore: data.data?.hasMore || false
    });
    
    // Validate structure
    if (data.success && data.data && Array.isArray(data.data.entries)) {
      console.log('✅ All-Time Leaderboard Structure: VALID');
      
      // Check first entry structure
      if (data.data.entries.length > 0) {
        const firstEntry = data.data.entries[0];
        const hasRequiredFields = firstEntry.userId && 
                                 typeof firstEntry.points === 'number' && 
                                 typeof firstEntry.rank === 'number';
        console.log('✅ First Entry Structure:', hasRequiredFields ? 'VALID' : 'INVALID');
        console.log('   Sample Entry:', firstEntry);
      }
    } else {
      console.log('❌ All-Time Leaderboard Structure: INVALID');
    }
    
  } catch (error) {
    console.error('❌ All-Time Leaderboard Error:', error.message);
  }
}

/**
 * Test Weekly Leaderboard API
 */
async function testWeeklyLeaderboard() {
  console.log('\n🧪 Testing Weekly Leaderboard API...');
  
  try {
    const params = new URLSearchParams(TEST_CONFIG.weekly);
    const response = await fetch(`${API_BASE_URL}/leaderboard/weekly?${params}`);
    const data = await response.json();
    
    console.log('✅ Weekly Leaderboard Response:', {
      status: response.status,
      success: data.success,
      hasData: !!data.data,
      entriesCount: data.data?.entries?.length || 0,
      total: data.data?.total || 0,
      hasMore: data.data?.hasMore || false
    });
    
    // Validate structure
    if (data.success && data.data && Array.isArray(data.data.entries)) {
      console.log('✅ Weekly Leaderboard Structure: VALID');
      
      // Check first entry structure
      if (data.data.entries.length > 0) {
        const firstEntry = data.data.entries[0];
        const hasRequiredFields = firstEntry.userId && 
                                 typeof firstEntry.points === 'number' && 
                                 typeof firstEntry.rank === 'number';
        console.log('✅ First Entry Structure:', hasRequiredFields ? 'VALID' : 'INVALID');
        console.log('   Sample Entry:', firstEntry);
      }
    } else {
      console.log('❌ Weekly Leaderboard Structure: INVALID');
    }
    
  } catch (error) {
    console.error('❌ Weekly Leaderboard Error:', error.message);
  }
}

/**
 * Test Monthly Leaderboard API
 */
async function testMonthlyLeaderboard() {
  console.log('\n🧪 Testing Monthly Leaderboard API...');
  
  try {
    const params = new URLSearchParams(TEST_CONFIG.monthly);
    const response = await fetch(`${API_BASE_URL}/leaderboard/monthly?${params}`);
    const data = await response.json();
    
    console.log('✅ Monthly Leaderboard Response:', {
      status: response.status,
      success: data.success,
      hasData: !!data.data,
      entriesCount: data.data?.entries?.length || 0,
      total: data.data?.total || 0,
      hasMore: data.data?.hasMore || false
    });
    
    // Validate structure
    if (data.success && data.data && Array.isArray(data.data.entries)) {
      console.log('✅ Monthly Leaderboard Structure: VALID');
      
      // Check first entry structure
      if (data.data.entries.length > 0) {
        const firstEntry = data.data.entries[0];
        const hasRequiredFields = firstEntry.userId && 
                                 typeof firstEntry.points === 'number' && 
                                 typeof firstEntry.rank === 'number';
        console.log('✅ First Entry Structure:', hasRequiredFields ? 'VALID' : 'INVALID');
        console.log('   Sample Entry:', firstEntry);
      }
    } else {
      console.log('❌ Monthly Leaderboard Structure: INVALID');
    }
    
  } catch (error) {
    console.error('❌ Monthly Leaderboard Error:', error.message);
  }
}

/**
 * Test Legacy API (backward compatibility)
 */
async function testLegacyAPI() {
  console.log('\n🧪 Testing Legacy Leaderboard API...');
  
  try {
    // Test all-time legacy
    const allTimeResponse = await fetch(`${API_BASE_URL}/leaderboard?type=all_time&limit=10&offset=0`);
    const allTimeData = await allTimeResponse.json();
    
    console.log('✅ Legacy All-Time Response:', {
      status: allTimeResponse.status,
      success: allTimeData.success,
      hasData: !!allTimeData.data
    });
    
    // Test weekly legacy
    const weeklyResponse = await fetch(`${API_BASE_URL}/leaderboard?type=weekly&limit=10&offset=0`);
    const weeklyData = await weeklyResponse.json();
    
    console.log('✅ Legacy Weekly Response:', {
      status: weeklyResponse.status,
      success: weeklyData.success,
      hasData: !!weeklyData.data
    });
    
    // Test monthly legacy
    const monthlyResponse = await fetch(`${API_BASE_URL}/leaderboard?type=monthly&limit=10&offset=0`);
    const monthlyData = await monthlyResponse.json();
    
    console.log('✅ Legacy Monthly Response:', {
      status: monthlyResponse.status,
      success: monthlyData.success,
      hasData: !!monthlyData.data
    });
    
  } catch (error) {
    console.error('❌ Legacy API Error:', error.message);
  }
}

/**
 * Test Error Handling
 */
async function testErrorHandling() {
  console.log('\n🧪 Testing Error Handling...');
  
  try {
    // Test invalid endpoint
    const response = await fetch(`${API_BASE_URL}/leaderboard/invalid`);
    const data = await response.json();
    
    console.log('✅ Error Response:', {
      status: response.status,
      success: data.success,
      hasError: !!data.error
    });
    
  } catch (error) {
    console.error('❌ Error Handling Test Error:', error.message);
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🚀 Starting Leaderboard APIs Tests...');
  console.log('📡 API Base URL:', API_BASE_URL);
  
  await testAllTimeLeaderboard();
  await testWeeklyLeaderboard();
  await testMonthlyLeaderboard();
  await testLegacyAPI();
  await testErrorHandling();
  
  console.log('\n🎉 All tests completed!');
}

// Run tests if this script is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  runAllTests().catch(console.error);
} else {
  // Browser environment
  runAllTests().catch(console.error);
}
