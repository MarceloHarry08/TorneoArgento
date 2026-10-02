Add-Type -AssemblyName System.Drawing
$dir = "C:\Users\marce\.gemini\antigravity-ide\brain\a21ccee0-8907-4ed0-acac-0ff9cd51310b"
Get-ChildItem "$dir\leon_*.jpg" | ForEach-Object {
    $img = [System.Drawing.Image]::FromFile($_.FullName)
    Write-Host "$($_.Name): $($img.Width)x$($img.Height)"
    $img.Dispose()
}
