/**
 * Test script for Player Data Mapping System
 * 
 * Run in browser console or use for testing
 */

import { 
  getPlayerDataByNFT, 
  getPlayerDataByIdentifier, 
  getRealPlayerName,
  getTransfermarktURL,
  formatPlayerNameForURL
} from './playerDataService';

export const testPlayerMapping = () => {
  console.log('🧪 Testing Player Data Mapping System\n');
  
  // Test 1: Get player by nonce
  console.log('Test 1: Get player by nonce');
  const player1 = getPlayerDataByNFT(738);
  console.log('  Input: 738');
  console.log('  Result:', player1);
  console.log('  Expected: Kyle Walker\n');
  
  // Test 2: Get player by ID
  console.log('Test 2: Get player by ID');
  const player2 = getPlayerDataByNFT('#2');
  console.log('  Input: #2');
  console.log('  Result:', player2);
  console.log('  Expected: Kyle Walker\n');
  
  // Test 3: Get player by identifier
  console.log('Test 3: Get player by identifier');
  const player3 = getPlayerDataByIdentifier('MAINSEASON-3db9f8-02e2');
  console.log('  Input: MAINSEASON-3db9f8-02e2');
  console.log('  Result:', player3);
  console.log('  Expected: Kyle Walker\n');
  
  // Test 4: Get real player name (multi-method)
  console.log('Test 4: Get real player name (multi-method)');
  const name1 = getRealPlayerName({
    identifier: 'MAINSEASON-3db9f8-04e8',
    nonce: 1256,
    name: 'Main Season #3'
  });
  console.log('  Input: {identifier, nonce, name}');
  console.log('  Result:', name1);
  console.log('  Expected: Ruben Diaz\n');
  
  // Test 5: Format player name for URL
  console.log('Test 5: Format player name for URL');
  const url1 = formatPlayerNameForURL('Ederson Santana de Moraes');
  console.log('  Input: Ederson Santana de Moraes');
  console.log('  Result:', url1);
  console.log('  Expected: ederson-santana-de-moraes\n');
  
  // Test 6: Get Transfermarkt URL
  console.log('Test 6: Get Transfermarkt URL');
  const transfermarktUrl = getTransfermarktURL('Kyle Walker');
  console.log('  Input: Kyle Walker');
  console.log('  Result:', transfermarktUrl);
  console.log('  Expected: https://www.transfermarkt.com/schnellsuche/ergebnis/schnellsuche?query=kyle-walker\n');
  
  // Test 7: Test with non-existent NFT
  console.log('Test 7: Non-existent NFT');
  const player4 = getPlayerDataByNFT(9999);
  console.log('  Input: 9999');
  console.log('  Result:', player4);
  console.log('  Expected: null\n');
  
  // Test 8: Test with special characters
  console.log('Test 8: Special characters in name');
  const url2 = formatPlayerNameForURL('José María García-López');
  console.log('  Input: José María García-López');
  console.log('  Result:', url2);
  console.log('  Expected: jose-maria-garcia-lopez\n');
  
  console.log('✅ All tests completed!');
};

// Example usage in component or console
export const exampleUsage = () => {
  console.log('📚 Example Usage:\n');
  
  console.log('1. In a component:');
  console.log(`
    const nft = {
      identifier: 'MAINSEASON-3db9f8-02e2',
      nonce: 738,
      name: 'Main Season #2'
    };
    
    const playerName = getRealPlayerName(nft);
    // → "Kyle Walker"
  `);
  
  console.log('\n2. Generate Transfermarkt link:');
  console.log(`
    const url = getTransfermarktURL(playerName);
    // → "https://www.transfermarkt.com/schnellsuche/ergebnis/schnellsuche?query=kyle-walker"
  `);
  
  console.log('\n3. Display in UI:');
  console.log(`
    <h3>{nft.realPlayerName || nft.name}</h3>
    <a href={getTransfermarktURL(nft.realPlayerName)}>
      View on Transfermarkt
    </a>
  `);
};

// Auto-run tests if in development mode
if (import.meta.env.DEV) {
  console.log('🎴 Player Data Mapping System loaded');
  console.log('💡 Run testPlayerMapping() to test the system');
  console.log('💡 Run exampleUsage() to see usage examples');
}

