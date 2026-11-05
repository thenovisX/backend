; Instalador de «Restaurante · Mesas y cocina» (Inno Setup 6). Lo compila build.ps1:
;   ISCC.exe /DAppVersion=1.0.0 /DStage=<carpeta preparada> /DOutDir=<salida> instalador.iss
; Se instala para el usuario (sin permisos de administrador) en %LOCALAPPDATA%\Programs, porque la app guarda
; sus datos junto al programa (web\config.php, web\data, web\uploads). Al actualizar no se tocan esos datos.

#ifndef AppVersion
  #define AppVersion "1.0.0"
#endif
#define AppName "Restaurante · Mesas y cocina"
#define AppExe "Restaurante Mesas.exe"

[Setup]
AppId={{6E1C2F4B-8A7D-4C1E-9B3A-52D7E0F4A9C1}
AppName={#AppName}
AppVersion={#AppVersion}
AppPublisher=thenovisX
DefaultDirName={localappdata}\Programs\Restaurante Mesas
DefaultGroupName={#AppName}
DisableProgramGroupPage=yes
PrivilegesRequired=lowest
OutputDir={#OutDir}
OutputBaseFilename=Instalar-Restaurante-Mesas-{#AppVersion}
SetupIconFile={#Stage}\escritorio\icono.ico
UninstallDisplayIcon={app}\{#AppExe}
Compression=lzma2/max
SolidCompression=yes
WizardStyle=modern
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
CloseApplications=force
RestartApplications=no

[Languages]
Name: "es"; MessagesFile: "compiler:Languages\Spanish.isl"

[Tasks]
Name: "desktopicon"; Description: "Crear un acceso directo en el escritorio"; GroupDescription: "Accesos directos:"
Name: "autostart"; Description: "Arrancar sola al encender el ordenador"; GroupDescription: "Al encender:"
Name: "firewall"; Description: "Dejar entrar a los móviles del wifi (regla del firewall; Windows pedirá permiso)"; GroupDescription: "Red:"

[Files]
Source: "{#Stage}\*"; DestDir: "{app}"; Flags: recursesubdirs createallsubdirs ignoreversion

[Dirs]
Name: "{app}\web\data"
Name: "{app}\web\uploads"

[Icons]
Name: "{group}\{#AppName}"; Filename: "{app}\{#AppExe}"
Name: "{group}\Desinstalar"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#AppName}"; Filename: "{app}\{#AppExe}"; Tasks: desktopicon

[Registry]
Root: HKCU; Subkey: "Software\Microsoft\Windows\CurrentVersion\Run"; ValueType: string; ValueName: "RestauranteMesasCocina"; ValueData: """{app}\{#AppExe}"" --minimizado"; Tasks: autostart; Flags: uninsdeletevalue

[Run]
Filename: "{cmd}"; Parameters: "/c netsh advfirewall firewall delete rule name=""Restaurante Mesas y cocina"" >nul 2>&1 & netsh advfirewall firewall add rule name=""Restaurante Mesas y cocina"" dir=in action=allow program=""{app}\php\php.exe"" enable=yes profile=any remoteip=localsubnet protocol=tcp"; Flags: shellexec runhidden waituntilterminated; Verb: runas; Tasks: firewall; StatusMsg: "Configurando el firewall…"
Filename: "{app}\{#AppExe}"; Description: "Abrir {#AppName}"; Flags: nowait postinstall skipifsilent

[UninstallRun]
Filename: "powershell.exe"; Parameters: "-NoProfile -Command ""Get-Process 'Restaurante Mesas','php' -ErrorAction SilentlyContinue | Where-Object {{ $_.Path -like '{app}\*' } | Stop-Process -Force"""; Flags: runhidden waituntilterminated; RunOnceId: "CerrarApp"

[UninstallDelete]
; Los datos (web\data, web\config.php, web\uploads) se quedan por si se vuelve a instalar.
; Para borrarlos del todo, borra la carpeta a mano después de desinstalar.
Type: filesandordirs; Name: "{app}\web\data\limites"
Type: files; Name: "{app}\web\data\servidor.log*"
