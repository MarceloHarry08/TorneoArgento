Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\marce\.gemini\antigravity-ide\brain\6ee987cf-31ef-4134-b042-ed5242f94c47\egipta_win_lose_fatality_1790917574738.jpg"
$destPath = "godot\assets\sprites\egipta_win_lose_fatality.png"

$src = [System.Drawing.Bitmap]::FromFile($srcPath)
$w = $src.Width
$h = $src.Height

$dest = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)

$srcData = $src.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$destData = $dest.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

$bytes = New-Object byte[] ($srcData.Stride * $h)
[System.Runtime.InteropServices.Marshal]::Copy($srcData.Scan0, $bytes, 0, $bytes.Length)

for ($i = 0; $i -lt $bytes.Length; $i += 4) {
    $b = $bytes[$i]
    $g = $bytes[$i+1]
    $r = $bytes[$i+2]
    
    # Chroma key green
    if ($g -gt 130 -and ($g - $r) -gt 35 -and ($g - $b) -gt 35) {
        $bytes[$i+3] = 0
    } else {
        $bytes[$i+3] = 255
    }
}

[System.Runtime.InteropServices.Marshal]::Copy($bytes, 0, $destData.Scan0, $bytes.Length)

$src.UnlockBits($srcData)
$dest.UnlockBits($destData)
$src.Dispose()

$dest.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
$dest.Dispose()

Write-Host "Saved transparent PNG: $destPath ($w x $h)"
