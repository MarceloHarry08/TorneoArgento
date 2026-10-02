Add-Type -AssemblyName System.Drawing
$src = "C:\Users\marce\.gemini\antigravity-ide\brain\a8b10b9e-0949-4eae-8bf9-dd46681472bf\leon_high_punch_strip_1790656007169.jpg"
$dst = "C:\Users\marce\OneDrive\Documentos\juego-fight\assets\sprites\leon_high_punch_raw.png"
$bmp = [System.Drawing.Bitmap]::FromFile($src)
$bmp.Save($dst, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Success converting JPG to PNG!"
