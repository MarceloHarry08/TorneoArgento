$src = "C:\Users\marce\OneDrive\Documentos\juego-fight\assets\video\intro.mp4"
$dst = "C:\Users\marce\OneDrive\Documentos\juego-fight\assets\video\intro.ogv"
$vlc = "C:\Program Files\VideoLAN\VLC\vlc.exe"

Write-Host "Transcoding with VLC..."
$soutParam = "--sout=#transcode{vcodec=theo,vb=2000,scale=auto,acodec=vorb,ab=128,channels=2,samplerate=44100}:standard{access=file,mux=ogg,dst=`"$dst`"}"
$processArgs = @("-I", "dummy", $src, $soutParam, "vlc://quit")

$p = Start-Process -FilePath $vlc -ArgumentList $processArgs -PassThru -NoNewWindow
$finished = $p.WaitForExit(45000)
Write-Host "VLC process finished: $finished"

if (Test-Path $dst) {
    $info = Get-Item $dst
    Write-Host "Success! Generated: $dst ($($info.Length) bytes)"
} else {
    Write-Host "Failed to generate $dst"
}
