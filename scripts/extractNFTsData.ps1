# PowerShell script to extract NFT data from MultiversX API
# Usage: .\scripts\extractNFTsData.ps1

Write-Host "🎴 GalacticX NFT Data Extractor" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

$collection = "MAINSEASON-3db9f8"
$apiUrl = "https://api.multiversx.com/collections/$collection/nfts?size=1000"

Write-Host "📡 Fetching NFTs from MultiversX API..." -ForegroundColor Yellow
Write-Host "Collection: $collection" -ForegroundColor Gray
Write-Host "API URL: $apiUrl" -ForegroundColor Gray
Write-Host ""

try {
    # Fetch data from API
    $response = Invoke-RestMethod -Uri $apiUrl -Method Get -ContentType "application/json"
    
    Write-Host "✅ Successfully fetched $($response.Count) NFTs" -ForegroundColor Green
    Write-Host ""
    
    # Create output array
    $playersData = @()
    
    # Process each NFT
    $counter = 0
    foreach ($nft in $response) {
        $counter++
        
        # Extract nonce from identifier (format: MAINSEASON-3db9f8-XXXX)
        $identifier = $nft.identifier
        $nonce = $nft.nonce
        
        # Get player name from metadata (if available)
        $playerName = ""
        if ($nft.metadata -and $nft.metadata.attributes) {
            foreach ($attr in $nft.metadata.attributes) {
                if ($attr.trait_type -eq "Name") {
                    $playerName = $attr.value
                    break
                }
            }
        }
        
        # If no name in metadata, use NFT name
        if ([string]::IsNullOrEmpty($playerName)) {
            $playerName = $nft.name
        }
        
        # Create player data object
        $playerData = [PSCustomObject]@{
            "ID" = "#$counter"
            "Player Name" = $playerName
            "MAINSEASON" = $identifier
            "MINT NR" = $nonce
        }
        
        $playersData += $playerData
        
        # Show progress every 50 NFTs
        if ($counter % 50 -eq 0) {
            Write-Host "Processing... $counter/$($response.Count) NFTs" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "✅ Processed all $counter NFTs" -ForegroundColor Green
    Write-Host ""
    
    # Convert to JSON
    $jsonOutput = $playersData | ConvertTo-Json -Depth 10
    
    # Save to file
    $outputPath = "src\data\playersData_extracted.json"
    $jsonOutput | Out-File -FilePath $outputPath -Encoding UTF8
    
    Write-Host "💾 Data saved to: $outputPath" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "1. Open $outputPath" -ForegroundColor Gray
    Write-Host "2. Manually verify and correct player names" -ForegroundColor Gray
    Write-Host "3. Replace src\data\playersData.json with the corrected file" -ForegroundColor Gray
    Write-Host ""
    Write-Host "⚠️  Note: Some NFT names may be generic (e.g., 'Main Season #123')" -ForegroundColor Yellow
    Write-Host "   You'll need to manually add the real player names" -ForegroundColor Yellow
    Write-Host ""
    
    # Show sample of extracted data
    Write-Host "📄 Sample of extracted data (first 5 entries):" -ForegroundColor Cyan
    $playersData | Select-Object -First 5 | Format-Table -AutoSize
    
    Write-Host ""
    Write-Host "🎉 Extraction complete!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error fetching data from API" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "- Check your internet connection" -ForegroundColor Gray
    Write-Host "- Verify the collection ID: $collection" -ForegroundColor Gray
    Write-Host "- Try accessing the API URL in your browser:" -ForegroundColor Gray
    Write-Host "  $apiUrl" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

