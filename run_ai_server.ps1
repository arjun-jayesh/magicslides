# Magic Slide AI Server Launcher
$ModelPath = "src\features\ai\qwen2.5-0.5b-instruct-q4_k_m.gguf"
$ServerExe = ".\llama-server.exe"

# Check if Model exists
if (-not (Test-Path $ModelPath)) {
    Write-Host "Error: Model file not found at $ModelPath" -ForegroundColor Red
    exit 1
}

# Check if Server exists
if (-not (Test-Path $ServerExe)) {
    # Check PATH
    if (Get-Command "llama-server" -ErrorAction SilentlyContinue) {
        $ServerExe = "llama-server"
    } else {
        Write-Host "ERROR: llama-server.exe not found in project root or PATH." -ForegroundColor Red
        Write-Host "Please download 'llama-b3564-bin-win-x64.zip' (or newer) from GitHub releases."
        Write-Host "Extract 'llama-server.exe' to: $(Get-Location)"
        exit 1
    }
}

Write-Host "Starting Magic Slide AI Server..." -ForegroundColor Green
Write-Host "Model: $ModelPath"
Write-Host "Port: 8080"

# Run Server
& $ServerExe -m $ModelPath --port 8080 -c 4096 --n-predict 4096
