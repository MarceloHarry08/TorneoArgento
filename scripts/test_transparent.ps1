Add-Type -AssemblyName System.Drawing

function Remove-Checkerboard {
    param(
        [string]$inputPath,
        [string]$outputPath
    )

    $src = [System.Drawing.Bitmap]::FromFile($inputPath)
    $w = $src.Width
    $h = $src.Height

    # Create 32-bit ARGB bitmap
    $dest = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    
    # Copy src pixels to dest
    $gfx = [System.Drawing.Graphics]::FromImage($dest)
    $gfx.DrawImage($src, 0, 0, $w, $h)
    $gfx.Dispose()
    $src.Dispose()

    # Lock bits for fast processing
    $rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
    $bmpData = $dest.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $stride = $bmpData.Stride
    $bytes = New-Object byte[] ($stride * $h)
    [System.Runtime.InteropServices.Marshal]::Copy($bmpData.Scan0, $bytes, 0, $bytes.Length)

    # Helper function to check if pixel is checkerboard background
    # Format32bppArgb in memory is BGRA (bytes: B, G, R, A)
    function Is-BgTile([int]$b, [int]$g, [int]$r) {
        $diffRG = [Math]::Abs($r - $g)
        $diffGB = [Math]::Abs($g - $b)
        $diffRB = [Math]::Abs($r - $b)
        # Neutral gray/white with luminance >= 180
        if ($diffRG -le 8 -and $diffGB -le 8 -and $diffRB -le 8 -and $r -ge 185 -and $g -ge 185 -and $b -ge 185) {
            return $true
        }
        return $false
    }

    # BFS queue
    $visited = New-Object bool[] ($w * $h)
    $queue = New-Object System.Collections.Generic.Queue[int]

    # Seed top and bottom borders
    for ($x = 0; $x -lt $w; $x++) {
        # Top
        $idx0 = (0 * $stride) + ($x * 4)
        if (Is-BgTile $bytes[$idx0] $bytes[$idx0+1] $bytes[$idx0+2]) {
            $pIdx0 = $x
            $visited[$pIdx0] = $true
            $queue.Enqueue($pIdx0)
        }
        # Bottom
        $yBottom = $h - 1
        $idxB = ($yBottom * $stride) + ($x * 4)
        if (Is-BgTile $bytes[$idxB] $bytes[$idxB+1] $bytes[$idxB+2]) {
            $pIdxB = ($yBottom * $w) + $x
            $visited[$pIdxB] = $true
            $queue.Enqueue($pIdxB)
        }
    }

    # Seed left and right borders
    for ($y = 0; $y -lt $h; $y++) {
        # Left
        $idxL = ($y * $stride) + (0 * 4)
        $pIdxL = $y * $w
        if (-not $visited[$pIdxL] -and (Is-BgTile $bytes[$idxL] $bytes[$idxL+1] $bytes[$idxL+2])) {
            $visited[$pIdxL] = $true
            $queue.Enqueue($pIdxL)
        }
        # Right
        $xRight = $w - 1
        $idxR = ($y * $stride) + ($xRight * 4)
        $pIdxR = ($y * $w) + $xRight
        if (-not $visited[$pIdxR] -and (Is-BgTile $bytes[$idxR] $bytes[$idxR+1] $bytes[$idxR+2])) {
            $visited[$pIdxR] = $true
            $queue.Enqueue($pIdxR)
        }
    }

    # BFS execution
    $dx = @(1, -1, 0, 0)
    $dy = @(0, 0, 1, -1)

    while ($queue.Count -gt 0) {
        $curr = $queue.Dequeue()
        $cx = $curr % $w
        $cy = [Math]::Floor($curr / $w)

        # Set pixel to transparent
        $bOffset = ($cy * $stride) + ($cx * 4)
        $bytes[$bOffset] = 0     # B
        $bytes[$bOffset+1] = 0   # G
        $bytes[$bOffset+2] = 0   # R
        $bytes[$bOffset+3] = 0   # Alpha = 0

        for ($i = 0; $i -lt 4; $i++) {
            $nx = $cx + $dx[$i]
            $ny = $cy + $dy[$i]

            if ($nx -ge 0 -and $nx -lt $w -and $ny -ge 0 -and $ny -lt $h) {
                $nIdx = ($ny * $w) + $nx
                if (-not $visited[$nIdx]) {
                    $nbOffset = ($ny * $stride) + ($nx * 4)
                    if (Is-BgTile $bytes[$nbOffset] $bytes[$nbOffset+1] $bytes[$nbOffset+2]) {
                        $visited[$nIdx] = $true
                        $queue.Enqueue($nIdx)
                    }
                }
            }
        }
    }

    # Copy modified bytes back
    [System.Runtime.InteropServices.Marshal]::Copy($bytes, 0, $bmpData.Scan0, $bytes.Length)
    $dest.UnlockBits($bmpData)

    # Save as PNG
    $dest.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $dest.Dispose()
    Write-Host "Processed and saved: $outputPath"
}

# Test on first file
$in = "C:\Users\marce\.gemini\antigravity-ide\brain\a21ccee0-8907-4ed0-acac-0ff9cd51310b\leon_crouch_jump_block_1790823210960.jpg"
$out = "c:\Users\marce\.gemini\antigravity-ide\scratch\torneo-argento 2\godot\assets\sprites\leon_crouch_jump_block_clean.png"
Remove-Checkerboard $in $out
