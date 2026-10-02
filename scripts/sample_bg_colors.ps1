Add-Type -AssemblyName System.Drawing

$file = "C:\Users\marce\.gemini\antigravity-ide\brain\a21ccee0-8907-4ed0-acac-0ff9cd51310b\leon_crouch_jump_block_1790823210960.jpg"
$bmp = New-Object System.Drawing.Bitmap($file)

for ($x = 0; $x -lt 60; $x += 6) {
    $c = $bmp.GetPixel($x, 0)
    Write-Host ("x={0}: ({1},{2},{3})" -f $x, $c.R, $c.G, $c.B)
}

$bmp.Dispose()
