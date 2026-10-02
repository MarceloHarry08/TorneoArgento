Add-Type -AssemblyName System.Speech
$dir = "C:\Users\marce\OneDrive\Documentos\juego-fight\assets\audio\announcer"
if (!(Test-Path $dir)) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
# Prefer Microsoft David Desktop for deep fighting game announcer voice, or fallback
try {
    $synth.SelectVoice("Microsoft David Desktop")
} catch {
    Write-Host "David not found, using default voice"
}
$synth.Rate = 0
$synth.Volume = 100

$lines = @{
    "round_1" = "Round 1"
    "round_2" = "Round 2"
    "round_final" = "Final Round"
    "fight" = "Fight!"
    "ko" = "K O!"
    "win_leon" = "El León Wins!"
    "win_latina" = "Latina Wins!"
    "win_ojosazules" = "Ojos Azules Wins!"
    "win_pepeargento" = "Pepe Argento Wins!"
    "win_eleternauta" = "El Eternauta Wins!"
    "win_elcomandante" = "El Comandante Wins!"
    "win_elmesias" = "El Mesías Wins!"
    "win_hugo" = "Hugo Wins!"
    "win_pergolas" = "Pérgolas Wins!"
    "win_sangrejaponesa" = "Sangre Japonesa Wins!"
    "win_badbitch" = "Bad Bitch Wins!"
    "win_inmortal" = "Inmortal Wins!"
}

foreach ($key in $lines.Keys) {
    $outFile = Join-Path $dir "$key.wav"
    $synth.SetOutputToWaveFile($outFile)
    $synth.Speak($lines[$key])
    Write-Host "Generated: $outFile"
}

$synth.Dispose()
Write-Host "Announcer voices generated successfully!"
