$proc = Start-Process -FilePath "C:\Godot\Godot_v4.7.2-stable_win64_console.exe" -ArgumentList "--headless", "--path", "C:\Users\marce\OneDrive\Documentos\juego-fight", "--quit" -PassThru -NoNewWindow
$proc.WaitForExit(15000)
Write-Host "Godot Headless Exit Code: $($proc.ExitCode)"
