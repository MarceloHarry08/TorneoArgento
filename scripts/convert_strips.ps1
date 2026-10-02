Add-Type -AssemblyName System.Drawing

$src1 = 'C:\Users\marce\.gemini\antigravity-ide\brain\a8b10b9e-0949-4eae-8bf9-dd46681472bf\leon_high_kick_strip_1790657984950.jpg'
$dst1 = 'C:\Users\marce\OneDrive\Documentos\juego-fight\assets\sprites\leon_high_kick_raw.png'
$bmp1 = [System.Drawing.Bitmap]::FromFile($src1)
$bmp1.Save($dst1, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp1.Dispose()
Write-Host "Saved: $dst1"

$src2 = 'C:\Users\marce\.gemini\antigravity-ide\brain\a8b10b9e-0949-4eae-8bf9-dd46681472bf\leon_low_sweep_strip_1790658013002.jpg'
$dst2 = 'C:\Users\marce\OneDrive\Documentos\juego-fight\assets\sprites\leon_low_sweep_raw.png'
$bmp2 = [System.Drawing.Bitmap]::FromFile($src2)
$bmp2.Save($dst2, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp2.Dispose()
Write-Host "Saved: $dst2"
