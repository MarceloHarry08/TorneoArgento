Add-Type -AssemblyName System.Drawing

$brainDir = "C:\Users\marce\.gemini\antigravity-ide\brain\a21ccee0-8907-4ed0-acac-0ff9cd51310b"
$outDir = "c:\Users\marce\.gemini\antigravity-ide\scratch\torneo-argento 2\godot\assets\sprites"

$files = @(
    @{ in="leon_crouch_jump_block_1790823210960.jpg"; out="leon_crouch_jump_block_raw.png" },
    @{ in="leon_punches_sheet_1790823254869.jpg"; out="leon_punches_raw.png" },
    @{ in="leon_kicks_sheet_1790823311705.jpg"; out="leon_kicks_raw.png" },
    @{ in="leon_air_attacks_1790823419189.jpg"; out="leon_air_attacks_raw.png" },
    @{ in="leon_hurt_knockdown_1790823496125.jpg"; out="leon_hurt_knockdown_raw.png" },
    @{ in="leon_special_projectile_1790823579796.jpg"; out="leon_special_projectile_raw.png" },
    @{ in="leon_win_lose_1790823696948.jpg"; out="leon_win_lose_raw.png" },
    @{ in="leon_fatality_strip_1790823789039.jpg"; out="leon_fatality_raw.png" }
)

foreach ($item in $files) {
    $srcPath = Join-Path $brainDir $item.in
    $destPath = Join-Path $outDir $item.out
    $bmp = [System.Drawing.Bitmap]::FromFile($srcPath)
    $bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Converted $($item.in) -> $($item.out)"
}
