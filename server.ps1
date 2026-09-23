$port = 5000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Server berjalan di http://localhost:$port/"

$root = $PSScriptRoot

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response
    
    $localPath = $request.Url.LocalPath.TrimStart('/')
    if ([string]::IsNullOrWhiteSpace($localPath) -or $localPath -eq '/') {
        $localPath = "index.html"
    }
    
    $filePath = Join-Path $root $localPath
    
    if (Test-Path $filePath -PathType Leaf) {
        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
        
        $contentType = "text/html; charset=utf-8"
        if ($ext -eq ".css") { $contentType = "text/css" }
        elseif ($ext -eq ".js") { $contentType = "application/javascript" }
        elseif ($ext -eq ".json") { $contentType = "application/json" }
        elseif ($ext -eq ".png") { $contentType = "image/png" }
        elseif ($ext -eq ".jpg" -or $ext -eq ".jpeg") { $contentType = "image/jpeg" }
        elseif ($ext -eq ".svg") { $contentType = "image/svg+xml" }
        
        $response.ContentType = $contentType
        $response.ContentLength64 = $bytes.Length
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $response.StatusCode = 404
        $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
        $response.OutputStream.Write($msg, 0, $msg.Length)
    }
    
    $response.Close()
}
