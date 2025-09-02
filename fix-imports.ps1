# Script to fix @/ imports to relative paths

$files = @(
    "app\_layout.tsx",
    "app\(tabs)\_layout.tsx", 
    "components\ParallaxScrollView.tsx",
    "hooks\useThemeColor.ts",
    "app\+not-found.tsx",
    "components\ThemedView.tsx",
    "components\ThemedText.tsx",
    "components\Collapsible.tsx",
    "components\HelloWave.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Processing $file"
        $content = Get-Content $file -Raw
        
        # Replace @/ imports with relative paths based on file location
        if ($file -like "app\*") {
            # Files in app directory
            $content = $content -replace "@/components/", "../components/"
            $content = $content -replace "@/constants/", "../constants/"
            $content = $content -replace "@/hooks/", "../hooks/"
        } elseif ($file -like "components\*") {
            # Files in components directory
            $content = $content -replace "@/hooks/", "../hooks/"
            $content = $content -replace "@/constants/", "../constants/"
        } elseif ($file -like "hooks\*") {
            # Files in hooks directory
            $content = $content -replace "@/constants/", "../constants/"
        }
        
        Set-Content $file -Value $content
        Write-Host "Fixed imports in $file"
    }
}

Write-Host "Import fixing completed!"
