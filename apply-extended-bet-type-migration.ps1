# PowerShell script to apply the extended_bet_type migration
# This script adds the extended_bet_type column to the predictions table

Write-Host "🚀 Applying extended_bet_type migration to Supabase..." -ForegroundColor Green

# Check if supabase CLI is available
try {
    $supabaseVersion = supabase --version
    Write-Host "✅ Supabase CLI found: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Apply the migration
Write-Host "📝 Applying migration 006_add_extended_bet_type_to_predictions.sql..." -ForegroundColor Blue

try {
    # Apply the migration
    supabase db push
    
    Write-Host "✅ Migration applied successfully!" -ForegroundColor Green
    Write-Host "🎯 The extended_bet_type column has been added to the predictions table" -ForegroundColor Green
    Write-Host "📊 Existing predictions have been updated with default extended_bet_type values" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error applying migration:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Migration completed successfully!" -ForegroundColor Green
Write-Host "💡 You can now create predictions with extended bet types" -ForegroundColor Cyan
