$Release = "b7837"
$File = "llama-$Release-bin-win-cpu-x64.zip"
$Url = "https://github.com/ggerganov/llama.cpp/releases/download/$Release/$File"
$Dest = "c:\Users\Arjun\Desktop\New folder\projects\magicslides\$File"
$ExtractPath = "c:\Users\Arjun\Desktop\New folder\projects\magicslides\temp_llama"

Write-Host "Downloading $Url..."
try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $Url -OutFile $Dest
} catch {
    Write-Host "Download failed: $_"
    exit 1
}

if (Test-Path $Dest) {
    Write-Host "Extracting..."
    # Create temp dir if not exists
    if (-not (Test-Path $ExtractPath)) { New-Item -ItemType Directory -Path $ExtractPath | Out-Null }
    
    Expand-Archive -Path $Dest -DestinationPath $ExtractPath -Force
    
    # Usually the exe is at root of zip, but sometimes inside a folder?
    # For bin-win zip, it's usually flat.
    $Server = "$ExtractPath\bin\llama-server.exe" 
    if (-not (Test-Path $Server)) { $Server = "$ExtractPath\llama-server.exe" }

    if (Test-Path $Server) {
        Copy-Item $Server -Destination "c:\Users\Arjun\Desktop\New folder\projects\magicslides\llama-server.exe" -Force
        Write-Host "Success! llama-server.exe installed."
        
        # Cleanup
        Remove-Item $Dest
        Remove-Item $ExtractPath -Recurse -Force
    } else {
        Write-Host "Error: llama-server.exe not found in archive."
        Get-ChildItem $ExtractPath -Recurse
    }
} else {
    Write-Host "Error: Download failed."
}
