/**
 * Node.js script to extract NFT data from MultiversX API
 * Usage: node scripts/extractNFTsData.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const COLLECTION = 'MAINSEASON-3db9f8';
const API_URL = `https://api.multiversx.com/collections/${COLLECTION}/nfts?size=1000`;
const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'data', 'playersData_extracted.json');

console.log('🎴 GalacticX NFT Data Extractor');
console.log('=================================\n');

console.log('📡 Fetching NFTs from MultiversX API...');
console.log(`Collection: ${COLLECTION}`);
console.log(`API URL: ${API_URL}\n`);

// Fetch data from API
https.get(API_URL, (res) => {
  let data = '';

  // A chunk of data has been received
  res.on('data', (chunk) => {
    data += chunk;
  });

  // The whole response has been received
  res.on('end', () => {
    try {
      const nfts = JSON.parse(data);
      
      console.log(`✅ Successfully fetched ${nfts.length} NFTs\n`);
      
      // Process NFTs
      const playersData = [];
      let counter = 0;
      
      for (const nft of nfts) {
        counter++;
        
        // Extract data
        const identifier = nft.identifier;
        const nonce = nft.nonce;
        
        // Get player name from metadata
        let playerName = '';
        if (nft.metadata && nft.metadata.attributes) {
          const nameAttr = nft.metadata.attributes.find(
            attr => attr.trait_type === 'Name'
          );
          if (nameAttr) {
            playerName = nameAttr.value;
          }
        }
        
        // Fallback to NFT name
        if (!playerName) {
          playerName = nft.name || `NFT #${nonce}`;
        }
        
        // Create player data entry
        playersData.push({
          'ID': `#${counter}`,
          'Player Name': playerName,
          'MAINSEASON': identifier,
          'MINT NR': nonce
        });
        
        // Show progress
        if (counter % 50 === 0) {
          console.log(`Processing... ${counter}/${nfts.length} NFTs`);
        }
      }
      
      console.log(`\n✅ Processed all ${counter} NFTs\n`);
      
      // Save to file
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(playersData, null, 2), 'utf8');
      
      console.log(`💾 Data saved to: ${OUTPUT_PATH}\n`);
      
      console.log('📋 Next steps:');
      console.log(`1. Open ${OUTPUT_PATH}`);
      console.log('2. Manually verify and correct player names');
      console.log('3. Replace src/data/playersData.json with the corrected file\n');
      
      console.log('⚠️  Note: Some NFT names may be generic (e.g., "Main Season #123")');
      console.log('   You\'ll need to manually add the real player names\n');
      
      // Show sample
      console.log('📄 Sample of extracted data (first 5 entries):');
      console.table(playersData.slice(0, 5));
      
      console.log('\n🎉 Extraction complete!');
      
    } catch (error) {
      console.error('❌ Error parsing JSON data:', error.message);
    }
  });

}).on('error', (error) => {
  console.error('❌ Error fetching data from API:', error.message);
  console.log('\n💡 Troubleshooting:');
  console.log('- Check your internet connection');
  console.log(`- Verify the collection ID: ${COLLECTION}`);
  console.log('- Try accessing the API URL in your browser:');
  console.log(`  ${API_URL}`);
});

