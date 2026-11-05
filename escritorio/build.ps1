# Compila la app de escritorio «Restaurante · Mesas y cocina» en Windows.
#   powershell -ExecutionPolicy Bypass -File escritorio\build.ps1 [-Version 1.0.0]
# Necesita: Windows 10/11 (trae el compilador de C# de .NET Framework 4) e Inno Setup 6 para el instalador
#   (winget install --id JRSoftware.InnoSetup -e --scope user). Sin Inno Setup sale solo la versión portátil (.zip).
# Resultado en escritorio\dist\: Instalar-Restaurante-Mesas-<versión>.exe y Restaurante-Mesas-portatil-<versión>.zip
param([string]$Version = '1.0.0')
$ErrorActionPreference = 'Stop'

$here = $PSScriptRoot
$repo = Split-Path $here -Parent
$vendor = Join-Path $here 'vendor'
$dist = Join-Path $here 'dist'
$stage = Join-Path $dist 'app'

# PHP oficial de windows.php.net (NTS x64), comprobado con su SHA-256
$phpZip = 'php-8.4.27-1-nts-Win32-vs17-x64.zip'
$phpSha = 'dbae154a0a89791f36c3d48e68bae797878333e7d6cb5721e74617de59b63ab7'
$phpDir = Join-Path $vendor 'php'
if (-not (Test-Path (Join-Path $phpDir 'php.exe'))) {
    New-Item -ItemType Directory -Force $vendor | Out-Null
    $zip = Join-Path $vendor $phpZip
    Write-Host "Descargando $phpZip…"
    Invoke-WebRequest "https://windows.php.net/downloads/releases/$phpZip" -OutFile $zip
    if ((Get-FileHash $zip -Algorithm SHA256).Hash.ToLower() -ne $phpSha) { Remove-Item $zip; throw 'El PHP descargado no coincide con su SHA-256' }
    Expand-Archive $zip $phpDir -Force
    Remove-Item $zip
}

Write-Host 'Preparando la carpeta de la app…'
if (Test-Path $stage) { Remove-Item -Recurse -Force $stage }
New-Item -ItemType Directory -Force $stage, "$stage\escritorio" | Out-Null

# Web (sin datos ni configuración de este ordenador)
robocopy (Join-Path $repo 'web') "$stage\web" /E /NFL /NDL /NJH /NJS /NP /XF config.php *.sqlite *.sqlite-* lanzador.txt servidor.log* /XD sesiones limites cache | Out-Null
Get-ChildItem "$stage\web\uploads" -Exclude '.htaccess', '.gitkeep' -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force

# PHP: solo lo que hace falta (sin las extensiones de depuración ni el código de desarrollo)
robocopy $phpDir "$stage\php" /E /NFL /NDL /NJH /NJS /NP /XD dev extras /XF php-cgi.exe phpdbg.exe *.pdb php.ini-* | Out-Null
# Runtime de Visual C++ junto a php.exe, por si el ordenador no lo tiene instalado
foreach ($dll in 'vcruntime140.dll', 'vcruntime140_1.dll', 'msvcp140.dll') {
    $src = Join-Path $env:WINDIR "System32\$dll"
    if ((Test-Path $src) -and -not (Test-Path "$stage\php\$dll")) { Copy-Item $src "$stage\php\" }
}

foreach ($f in 'router.php', 'local.php', 'setup.php', 'php.ini', 'LEEME.txt') { Copy-Item (Join-Path $here $f) "$stage\escritorio\" }

# Icono (a partir del icono del panel): un .ico con el PNG dentro
$png = [IO.File]::ReadAllBytes((Join-Path $repo 'web\panel\icons\icon-192.png'))
$ico = Join-Path $stage 'escritorio\icono.ico'
$ms = New-Object IO.MemoryStream
$bw = New-Object IO.BinaryWriter($ms)
$bw.Write([UInt16]0); $bw.Write([UInt16]1); $bw.Write([UInt16]1)
$bw.Write([byte]192); $bw.Write([byte]192); $bw.Write([byte]0); $bw.Write([byte]0)
$bw.Write([UInt16]1); $bw.Write([UInt16]32); $bw.Write([UInt32]$png.Length); $bw.Write([UInt32]22)
$bw.Write($png); $bw.Flush()
[IO.File]::WriteAllBytes($ico, $ms.ToArray())

Write-Host 'Compilando el lanzador…'
$csc = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
if (-not (Test-Path $csc)) { throw "No encuentro $csc (.NET Framework 4)" }
$exe = Join-Path $stage 'Restaurante Mesas.exe'
& $csc /nologo /target:winexe /platform:x64 /optimize+ /codepage:65001 "/out:$exe" "/win32icon:$ico" `
    /reference:System.Windows.Forms.dll /reference:System.Drawing.dll /reference:System.Core.dll `
    (Join-Path $here 'lanzador\Lanzador.cs')
if ($LASTEXITCODE -ne 0) { throw 'No se pudo compilar el lanzador' }

# Versión portátil (.zip): se descomprime y se abre «Restaurante Mesas.exe»
$zipOut = Join-Path $dist "Restaurante-Mesas-portatil-$Version.zip"
if (Test-Path $zipOut) { Remove-Item $zipOut }
Compress-Archive -Path "$stage\*" -DestinationPath $zipOut
Write-Host "Portátil: $zipOut"

# Instalador
$iscc = @("$env:LOCALAPPDATA\Programs\Inno Setup 6\ISCC.exe", "${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe", "$env:ProgramFiles\Inno Setup 6\ISCC.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1
if ($iscc) {
    & $iscc /Q "/DAppVersion=$Version" "/DStage=$stage" "/DOutDir=$dist" (Join-Path $here 'instalador.iss')
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo crear el instalador' }
    Write-Host "Instalador: $(Join-Path $dist "Instalar-Restaurante-Mesas-$Version.exe")"
} else {
    Write-Host 'Inno Setup no está instalado: solo se ha creado la versión portátil.'
}
