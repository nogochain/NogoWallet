Add-Type -AssemblyName System.Drawing

# Load PNG
$pngPath = "d:\NogoChain\NogoWallet\AppAssets\Web\android-chrome-512x512.png"
$bitmap = [System.Drawing.Bitmap]::FromFile($pngPath)

# Create icon
$iconPath = "d:\NogoChain\NogoWallet\desktop\src-tauri\icons\icon.ico"

# Create multiple sizes for ICO
$sizes = @(16, 32, 48, 64, 128, 256)
$icon = New-Object System.Drawing.Icon($bitmap, 256, 256)
$icon.Save($iconPath)

Write-Host "ICO file created at $iconPath"
$bitmap.Dispose()
$icon.Dispose()
