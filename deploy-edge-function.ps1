# Script de déploiement de l'Edge Function MultiversX Auth
# PowerShell Script pour Windows

Write-Host "🚀 Déploiement de l'Edge Function auth-multiversx" -ForegroundColor Cyan
Write-Host ""

# Vérifier si Supabase CLI est installé
$supabaseCLI = Get-Command supabase -ErrorAction SilentlyContinue

if (-not $supabaseCLI) {
    Write-Host "❌ Supabase CLI n'est pas installé" -ForegroundColor Red
    Write-Host "Installez-le avec: npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Supabase CLI détecté" -ForegroundColor Green

# Project Reference
$PROJECT_REF = "qlwmadumwiibypstsivr"

# Déployer la fonction
Write-Host ""
Write-Host "📦 Déploiement en cours..." -ForegroundColor Yellow

try {
    supabase functions deploy auth-multiversx --project-ref $PROJECT_REF
    
    Write-Host ""
    Write-Host "✅ Fonction déployée avec succès !" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 URL: https://$PROJECT_REF.supabase.co/functions/v1/auth-multiversx" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "⚠️  N'oubliez pas de configurer le secret SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Yellow
    Write-Host "   Via Dashboard: https://app.supabase.com/project/$PROJECT_REF/settings/vault/secrets" -ForegroundColor Gray
    Write-Host "   Ou via CLI: supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_key --project-ref $PROJECT_REF" -ForegroundColor Gray
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "❌ Erreur lors du déploiement: $_" -ForegroundColor Red
    exit 1
}



