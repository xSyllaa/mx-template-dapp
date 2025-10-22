# Script pour déployer l'Edge Function auth-multiversx sans vérification JWT

Write-Host "📦 Déploiement de l'Edge Function auth-multiversx..." -ForegroundColor Cyan

# Utiliser npx pour déployer
$env:SUPABASE_ACCESS_TOKEN = Read-Host "Entrez votre access token Supabase (ou appuyez sur Entrée pour utiliser la connexion locale)"

if ([string]::IsNullOrEmpty($env:SUPABASE_ACCESS_TOKEN)) {
    Write-Host "⚠️ Pas de token fourni, utilisation de la connexion locale" -ForegroundColor Yellow
    npx supabase functions deploy auth-multiversx --no-verify-jwt
} else {
    Write-Host "✅ Token fourni, déploiement..." -ForegroundColor Green
    npx supabase functions deploy auth-multiversx --no-verify-jwt
}

Write-Host "✅ Déploiement terminé !" -ForegroundColor Green



