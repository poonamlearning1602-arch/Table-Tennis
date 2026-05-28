# Simple HTTP Server for Table Tennis Game
param(
    [int]$port = 8000
)

$path = Split-Path -Parent $MyInvocation.MyCommand.Path

# Function to get MIME type
function Get-MimeType {
    param($filePath)
    $ext = [System.IO.Path]::GetExtension($filePath).ToLower()

    switch ($ext) {
        ".html" { return "text/html" }
        ".css" { return "text/css" }
        ".js" { return "application/javascript" }
        ".json" { return "application/json" }
        ".png" { return "image/png" }
        ".jpg" { return "image/jpeg" }
        ".gif" { return "image/gif" }
        ".svg" { return "image/svg+xml" }
        ".ico" { return "image/x-icon" }
        ".md" { return "text/markdown" }
        default { return "text/plain" }
    }
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
    Write-Host "Server running at http://localhost:$port"
    Write-Host "Press Ctrl+C to stop"
    Write-Host "Serving files from: $path"
    Write-Host ""

    while ($true) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $url = $request.Url.LocalPath
        if ($url -eq "/" -or $url -eq "") {
            $url = "/index.html"
        }

        $filePath = Join-Path $path $url.TrimStart('/')

        if (Test-Path $filePath -PathType Leaf) {
            try {
                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                $response.ContentType = Get-MimeType $filePath
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
                $response.StatusCode = 200
            } catch {
                $response.StatusCode = 500
            }
        } else {
            $response.StatusCode = 404
            $response.ContentType = "text/html"
            $notFound = "<h1>404 - File Not Found</h1><p>$($request.Url.LocalPath)</p>"
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($notFound)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        }

        $response.Close()
    }
} catch {
    Write-Host "Error: $_"
} finally {
    $listener.Close()
    Write-Host "Server stopped"
}
