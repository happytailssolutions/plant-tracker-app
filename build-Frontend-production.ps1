# Set production environment variables
$env:NODE_ENV = "production"
$env:EXPO_PUBLIC_GRAPHQL_URL = "https://us-central1-plant-tracker-cb1ab.cloudfunctions.net/api/graphql"
$env:EXPO_PUBLIC_SUPABASE_URL = "https://ogwseyxqslprfeuwhols.supabase.co"
$env:EXPO_PUBLIC_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nd3NleXhxc2xwcmZldXdob2xzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MzgwMDUsImV4cCI6MjA2NzQxNDAwNX0.QOLtYAcF91CzrA7hlPCK04HipvVO7M_fcCJTcGUrxQ8"
$env:EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = "788884586325-uc212icuhtv5vqg5bq2e3va8oa35j40g.apps.googleusercontent.com"
$env:EXPO_PUBLIC_GOOGLE_MAPS_API_KEY = "AIzaSyApqPEuVFnolGIcZoyk9ugsDQ0xB2Y4kI4"
$env:GOOGLE_SIGN_IN_API_KEY = "AIzaSyA8uwTf-eD7zW2xisn6zMZDGRxE-9RzSfY"
$env:GOOGLE_CLIENT_ID = "788884586325-85a90b2qeg935vk088b4k1budjbf724v.apps.googleusercontent.com"

Write-Host "Environment variables set for production build"

# Function to check and install dependencies
function Install-Dependencies {
    Write-Host "Checking and installing dependencies..."
    
    # Install other project dependencies
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install dependencies"
        exit $LASTEXITCODE
    }
}

# Function to setup Android SDK configuration
function Setup-AndroidSDK {
    Write-Host "Setting up Android SDK configuration..."
    
    # Try to find Android SDK location
    $possibleSDKPaths = @(
        "$env:LOCALAPPDATA\Android\Sdk",
        "$env:USERPROFILE\AppData\Local\Android\Sdk",
        "C:\Android\Sdk",
        "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk"
    )
    
    $sdkPath = $null
    foreach ($path in $possibleSDKPaths) {
        if (Test-Path $path) {
            $sdkPath = $path
            Write-Host "Found Android SDK at: $sdkPath"
            break
        }
    }
    
    # If not found in common locations, try to find via adb
    if ($null -eq $sdkPath) {
        Write-Host "Android SDK not found in common locations. Trying to find via adb..."
        try {
            $adbPath = Get-Command "adb" -ErrorAction SilentlyContinue
            if ($adbPath) {
                $sdkPath = Split-Path (Split-Path $adbPath.Source)
                if ($sdkPath -and (Test-Path $sdkPath)) {
                    Write-Host "Found Android SDK via adb at: $sdkPath"
                } else {
                    $sdkPath = $null
                }
            }
        } catch {
            $sdkPath = $null
        }
    }
    
    # If still not found, try ANDROID_HOME environment variable
    if ($null -eq $sdkPath -and $env:ANDROID_HOME) {
        if (Test-Path $env:ANDROID_HOME) {
            $sdkPath = $env:ANDROID_HOME
            Write-Host "Found Android SDK via ANDROID_HOME at: $sdkPath"
        }
    }
    
    if ($null -eq $sdkPath) {
        Write-Error "Android SDK not found. Please install Android Studio and set up the SDK."
        Write-Host "You can also set the ANDROID_HOME environment variable manually."
        Write-Host "Common locations checked:"
        foreach ($path in $possibleSDKPaths) {
            Write-Host "  - $path"
        }
        exit 1
    }
    
    # Create local.properties with SDK location
    $localPropertiesContent = "sdk.dir=$($sdkPath.Replace('\', '\\'))"
    Set-Content -Path "android/local.properties" -Value $localPropertiesContent
    Write-Host "Created local.properties with SDK path: $sdkPath"
    
    # Verify the file was created correctly
    if (Test-Path "android/local.properties") {
        $content = Get-Content "android/local.properties"
        Write-Host "local.properties content: $content"
    } else {
        Write-Error "Failed to create local.properties file"
        exit 1
    }
}

# Create a temporary index.js file if it doesn't exist
$indexJsContent = @"
import { registerRootComponent } from 'expo';
import App from './App';
registerRootComponent(App);
"@

if (-not (Test-Path "index.js")) {
    Set-Content -Path "index.js" -Value $indexJsContent
    Write-Host "Created temporary index.js file"
}

# Install dependencies
Install-Dependencies

# Run prebuild to ensure all native files are set up correctly
Write-Host "Running expo prebuild..."
npx expo prebuild --clean --no-install

# Wait for the android directory to be created
$maxAttempts = 10
$attempts = 0
while (-not (Test-Path "android") -and $attempts -lt $maxAttempts) {
    Write-Host "Waiting for android directory to be created... Attempt $($attempts + 1)/$maxAttempts"
    Start-Sleep -Seconds 2
    $attempts++
}

if (-not (Test-Path "android")) {
    Write-Host "Android directory was not created. Build failed."
    exit 1
}

# Setup Android SDK configuration
Setup-AndroidSDK

# Clean previous builds
Write-Host "Cleaning previous builds..."
Remove-Item -Path "android/app/build/outputs/apk/release" -Recurse -ErrorAction SilentlyContinue

# Navigate to android directory and run the build
Write-Host "Starting Android build..."
Set-Location -Path "android"

# Ensure gradlew is executable
if (-not (Test-Path "gradlew")) {
    Write-Host "gradlew not found. Running prebuild again..."
    Set-Location ..
    npx expo prebuild
    if (-not (Test-Path "android/gradlew")) {
        Write-Host "Failed to create gradlew. Build failed."
        exit 1
    }
    Set-Location -Path "android"
}

# Clean and build
./gradlew clean
if ($LASTEXITCODE -ne 0) {
    Write-Host "Gradle clean failed with exit code $LASTEXITCODE"
    exit $LASTEXITCODE
}

./gradlew assembleRelease
if ($LASTEXITCODE -ne 0) {
    Write-Host "Gradle build failed with exit code $LASTEXITCODE"
    exit $LASTEXITCODE
}

# Copy the APK to a more accessible location
$buildDate = Get-Date -Format "yyyyMMdd_HHmmss"
$apkPath = "app/build/outputs/apk/release/app-release.apk"
$newApkName = "../builds/plant-tracker-$buildDate.apk"

# Create builds directory if it doesn't exist
New-Item -ItemType Directory -Force -Path "../builds"

# Check if APK was created
if (Test-Path $apkPath) {
    Copy-Item $apkPath $newApkName
    Write-Host "Build completed! APK location: $newApkName"
} else {
    Write-Host "Error: APK was not created at expected location: $apkPath"
    exit 1
}

# Clean up temporary index.js if we created it
Set-Location ..
if (Test-Path "index.js") {
    Remove-Item "index.js"
    Write-Host "Cleaned up temporary index.js"
}

# Print environment variables for verification
Write-Host "`nEnvironment variables used in this build:"
Write-Host "NODE_ENV: $env:NODE_ENV"
Write-Host "GRAPHQL_URL: $env:EXPO_PUBLIC_GRAPHQL_URL"
Write-Host "GOOGLE_SIGN_IN_API_KEY is set: $($null -ne $env:GOOGLE_SIGN_IN_API_KEY)"
Write-Host "GOOGLE_CLIENT_ID is set: $($null -ne $env:GOOGLE_CLIENT_ID)"