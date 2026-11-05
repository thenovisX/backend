// Lanzador de «Restaurante · Mesas y cocina» para Windows.
// Arranca el PHP que va dentro de la app (php -S) con la web en modo local (SQLite) y la sirve a los móviles
// y tablets del mismo wifi. Se compila con el csc de .NET Framework 4 que trae Windows (ver build.ps1):
// por eso está escrito en C# 5 (sin $"", sin ?. ni => en métodos).
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.NetworkInformation;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Windows.Forms;
using Microsoft.Win32;

[assembly: System.Reflection.AssemblyTitle("Restaurante · Mesas y cocina")]
[assembly: System.Reflection.AssemblyProduct("Restaurante · Mesas y cocina")]
[assembly: System.Reflection.AssemblyVersion("1.0.0.0")]
[assembly: System.Reflection.AssemblyFileVersion("1.0.0.0")]

namespace RestauranteMesas
{
    static class Program
    {
        public const string AppName = "Restaurante · Mesas y cocina";
        public const string RunKey = @"Software\Microsoft\Windows\CurrentVersion\Run";
        public const string RunValue = "RestauranteMesasCocina";

        [STAThread]
        static void Main(string[] args)
        {
            bool created;
            using (var mutex = new Mutex(true, "Local\\RestauranteMesasCocina", out created))
            {
                if (!created)
                {
                    // Ya está abierta: se abre la página de inicio en el navegador y listo
                    var s = Settings.Load(Paths.SettingsFile);
                    try { Process.Start("http://127.0.0.1:" + s.Port + "/local/"); } catch { }
                    return;
                }
                Application.EnableVisualStyles();
                Application.SetCompatibleTextRenderingDefault(false);
                bool minimized = args.Any(a => a == "--minimizado");
                if (!File.Exists(Paths.ConfigPhp))
                {
                    using (var f = new SetupForm())
                    {
                        if (f.ShowDialog() != DialogResult.OK) return;
                    }
                    minimized = false;
                }
                Application.Run(new MainForm(minimized));
            }
        }
    }

    static class Paths
    {
        public static readonly string Root = AppDomain.CurrentDomain.BaseDirectory.TrimEnd('\\');
        public static readonly string Php = Path.Combine(Root, @"php\php.exe");
        public static readonly string PhpExt = Path.Combine(Root, @"php\ext");
        public static readonly string Web = Path.Combine(Root, "web");
        public static readonly string Escritorio = Path.Combine(Root, "escritorio");
        public static readonly string PhpIni = Path.Combine(Escritorio, "php.ini");
        public static readonly string Router = Path.Combine(Escritorio, "router.php");
        public static readonly string Setup = Path.Combine(Escritorio, "setup.php");
        public static readonly string ConfigPhp = Path.Combine(Web, "config.php");
        public static readonly string Data = Path.Combine(Web, "data");
        public static readonly string SettingsFile = Path.Combine(Data, "lanzador.txt");
        public static readonly string LogFile = Path.Combine(Data, "servidor.log");

        public static string PhpArgs(string extra)
        {
            return "-c " + Q(PhpIni) + " -d " + Q("extension_dir=" + PhpExt) + " -d " + Q("error_log=" + LogFile) + " " + extra;
        }

        public static string Q(string s) { return "\"" + s.Replace("\"", "") + "\""; }
    }

    /// <summary>Ajustes del lanzador (web\data\lanzador.txt, clave=valor).</summary>
    class Settings
    {
        public int Port = 8080;
        public string Address = "";   // vacío = la IP de este ordenador en el wifi (automática)

        public static Settings Load(string file)
        {
            var s = new Settings();
            try
            {
                if (!File.Exists(file)) return s;
                foreach (var line in File.ReadAllLines(file, Encoding.UTF8))
                {
                    int i = line.IndexOf('=');
                    if (i < 0) continue;
                    string k = line.Substring(0, i).Trim(), v = line.Substring(i + 1).Trim();
                    int p;
                    if (k == "puerto" && int.TryParse(v, out p) && p > 0 && p < 65536) s.Port = p;
                    if (k == "direccion") s.Address = v;
                }
            }
            catch { }
            return s;
        }

        public void Save(string file)
        {
            Directory.CreateDirectory(Path.GetDirectoryName(file));
            File.WriteAllText(file, "puerto=" + Port + "\r\ndireccion=" + Address + "\r\n", new UTF8Encoding(false));
        }
    }

    static class Net
    {
        /// <summary>IPv4 de este ordenador en las redes que están conectadas (primero las de casa/local: 192.168, 10., 172.16-31).</summary>
        public static List<string> LocalIPv4()
        {
            var list = new List<KeyValuePair<int, string>>();
            try
            {
                foreach (var ni in NetworkInterface.GetAllNetworkInterfaces())
                {
                    if (ni.OperationalStatus != OperationalStatus.Up) continue;
                    if (ni.NetworkInterfaceType == NetworkInterfaceType.Loopback || ni.NetworkInterfaceType == NetworkInterfaceType.Tunnel) continue;
                    string d = (ni.Description + " " + ni.Name).ToLowerInvariant();
                    bool virt = d.Contains("virtual") || d.Contains("vmware") || d.Contains("hyper-v") || d.Contains("vethernet") || d.Contains("wsl") || d.Contains("docker") || d.Contains("vpn") || d.Contains("tap-") || d.Contains("bluetooth");
                    var props = ni.GetIPProperties();
                    bool gw = props.GatewayAddresses.Any(g => g.Address.AddressFamily == AddressFamily.InterNetwork && !g.Address.Equals(IPAddress.Any));
                    foreach (var ua in props.UnicastAddresses)
                    {
                        if (ua.Address.AddressFamily != AddressFamily.InterNetwork) continue;
                        string ip = ua.Address.ToString();
                        if (ip.StartsWith("169.254.") || ip.StartsWith("127.")) continue;
                        int score = 0;
                        if (!IsPrivate(ip)) score += 10;
                        if (virt) score += 20;
                        if (!gw) score += 5;
                        if (ni.NetworkInterfaceType == NetworkInterfaceType.Wireless80211) score -= 1;
                        list.Add(new KeyValuePair<int, string>(score, ip));
                    }
                }
            }
            catch { }
            return list.OrderBy(p => p.Key).Select(p => p.Value).Distinct().ToList();
        }

        static bool IsPrivate(string ip)
        {
            if (ip.StartsWith("192.168.") || ip.StartsWith("10.")) return true;
            if (ip.StartsWith("172."))
            {
                int b;
                var parts = ip.Split('.');
                if (parts.Length > 1 && int.TryParse(parts[1], out b)) return b >= 16 && b <= 31;
            }
            return false;
        }

        public static bool PortFree(int port)
        {
            try
            {
                var l = new TcpListener(IPAddress.Any, port);
                l.Start();
                l.Stop();
                return true;
            }
            catch { return false; }
        }
    }

    /// <summary>El servidor PHP: lo arranca, lo vigila (si se cae lo vuelve a arrancar) y lo para.</summary>
    class Server
    {
        Process proc;
        volatile bool wanted;
        int restarts;
        DateTime lastStart;
        readonly object logLock = new object();
        public event Action<string> StatusChanged;
        public string BaseUrl = "";
        public int Port;

        public bool Running { get { return proc != null && !proc.HasExited; } }

        public string Start(int port, string baseUrl)
        {
            Stop();
            Port = port;
            BaseUrl = baseUrl;
            if (!File.Exists(Paths.Php)) return "No encuentro php\\php.exe. Vuelve a instalar la app.";
            KillOrphans();
            if (!Net.PortFree(port)) return "El puerto " + port + " lo está usando otro programa. Elige otro puerto en «Ajustes».";
            wanted = true;
            restarts = 0;
            return Launch();
        }

        string Launch()
        {
            try
            {
                Directory.CreateDirectory(Paths.Data);
                TrimLog();
                var psi = new ProcessStartInfo(Paths.Php, Paths.PhpArgs("-S 0.0.0.0:" + Port + " -t " + Paths.Q(Paths.Web) + " " + Paths.Q(Paths.Router)));
                psi.UseShellExecute = false;
                psi.CreateNoWindow = true;
                psi.WorkingDirectory = Path.GetDirectoryName(Paths.Php);
                psi.RedirectStandardError = true;
                psi.RedirectStandardOutput = true;
                psi.EnvironmentVariables["RESTAURANTE_BASE_URL"] = BaseUrl;
                psi.EnvironmentVariables["PHPRC"] = Paths.Escritorio;
                var p = new Process();
                p.StartInfo = psi;
                p.EnableRaisingEvents = true;
                p.OutputDataReceived += (s, e) => Log(e.Data);
                p.ErrorDataReceived += (s, e) => Log(e.Data);
                p.Exited += OnExited;
                p.Start();
                p.BeginErrorReadLine();
                p.BeginOutputReadLine();
                proc = p;
                lastStart = DateTime.Now;
                Log("--- Servidor arrancado en " + BaseUrl + " (puerto " + Port + ")");
                Fire("Funcionando");
                return null;
            }
            catch (Exception ex)
            {
                wanted = false;
                return "No se pudo arrancar el servidor: " + ex.Message;
            }
        }

        void OnExited(object sender, EventArgs e)
        {
            if (!wanted) return;
            Log("--- El servidor se ha parado solo (código " + SafeExit(sender as Process) + ")");
            // Se vuelve a arrancar solo; si se cae una y otra vez, se deja parado y se avisa
            if ((DateTime.Now - lastStart).TotalSeconds > 60) restarts = 0;
            if (++restarts > 5)
            {
                wanted = false;
                Fire("Parado: falla al arrancar (mira el registro)");
                return;
            }
            Thread.Sleep(1500);
            if (wanted) Launch();
        }

        /// <summary>Si la app se cerró de golpe, su PHP puede seguir vivo ocupando el puerto: se cierra.</summary>
        static void KillOrphans()
        {
            foreach (var p in Process.GetProcessesByName("php"))
            {
                try
                {
                    if (string.Equals(p.MainModule.FileName, Paths.Php, StringComparison.OrdinalIgnoreCase)) { p.Kill(); p.WaitForExit(3000); }
                }
                catch { }
                finally { p.Dispose(); }
            }
        }

        static string SafeExit(Process p)
        {
            try { return p == null ? "?" : p.ExitCode.ToString(); } catch { return "?"; }
        }

        public void Stop()
        {
            wanted = false;
            var p = proc;
            proc = null;
            if (p == null) return;
            try { if (!p.HasExited) { p.Kill(); p.WaitForExit(3000); } } catch { }
            try { p.Dispose(); } catch { }
            Log("--- Servidor parado");
            Fire("Parado");
        }

        void Fire(string s)
        {
            var h = StatusChanged;
            if (h != null) h(s);
        }

        void Log(string line)
        {
            if (line == null) return;
            // php -S apunta cada conexión («Accepted», «Closing»): no se guardan, solo las peticiones y los errores
            if (line.EndsWith(" Accepted") || line.EndsWith(" Closing")) return;
            lock (logLock)
            {
                try { File.AppendAllText(Paths.LogFile, line + "\r\n", Encoding.UTF8); } catch { }
            }
        }

        void TrimLog()
        {
            try
            {
                var fi = new FileInfo(Paths.LogFile);
                if (fi.Exists && fi.Length > 5 * 1024 * 1024)
                {
                    string old = Paths.LogFile + ".1";
                    if (File.Exists(old)) File.Delete(old);
                    File.Move(Paths.LogFile, old);
                }
            }
            catch { }
        }
    }

    /// <summary>Primera vez: nombre del restaurante y usuario del dueño.</summary>
    class SetupForm : Form
    {
        TextBox name, user, pass, pass2;
        CheckBox sample;
        Button ok;
        Label err;

        public SetupForm()
        {
            Text = Program.AppName + " · Primera vez";
            FormBorderStyle = FormBorderStyle.FixedDialog;
            MaximizeBox = false;
            StartPosition = FormStartPosition.CenterScreen;
            Font = new Font("Segoe UI", 10f);
            ClientSize = new Size(460, 430);
            Icon = MainForm.AppIcon();

            var intro = new Label { Left = 20, Top = 16, Width = 420, Height = 64, Text = "Vamos a preparar la app en este ordenador. Los datos (carta, mesas, pedidos) se guardan aquí, cifrados, y no dependen de la web." };
            Controls.Add(intro);
            name = AddField("Nombre del restaurante", 84, false);
            user = AddField("Usuario (para el panel y para Sala y cocina)", 144, false);
            pass = AddField("Contraseña (mínimo 8 caracteres)", 204, true);
            pass2 = AddField("Repite la contraseña", 264, true);
            sample = new CheckBox { Left = 20, Top = 322, Width = 420, Text = "Poner una carta de ejemplo (luego se puede cambiar)", Checked = true };
            Controls.Add(sample);
            err = new Label { Left = 20, Top = 350, Width = 420, Height = 36, ForeColor = Color.Firebrick };
            Controls.Add(err);
            ok = new Button { Text = "Empezar", Left = 320, Top = 386, Width = 120, Height = 32 };
            ok.Click += OnOk;
            Controls.Add(ok);
            AcceptButton = ok;
        }

        TextBox AddField(string label, int top, bool password)
        {
            Controls.Add(new Label { Left = 20, Top = top, Width = 420, Text = label });
            var t = new TextBox { Left = 20, Top = top + 24, Width = 420, UseSystemPasswordChar = password };
            Controls.Add(t);
            return t;
        }

        void OnOk(object sender, EventArgs e)
        {
            err.Text = "";
            if (name.Text.Trim().Length == 0) { err.Text = "Escribe el nombre del restaurante."; return; }
            if (!System.Text.RegularExpressions.Regex.IsMatch(user.Text.Trim().ToLowerInvariant(), "^[a-z0-9._-]{3,40}$")) { err.Text = "El usuario: de 3 a 40 letras sin espacios (números, puntos y guiones valen)."; return; }
            if (pass.Text.Length < 8) { err.Text = "La contraseña necesita al menos 8 caracteres."; return; }
            if (pass.Text != pass2.Text) { err.Text = "Las dos contraseñas no coinciden."; return; }
            ok.Enabled = false;
            Cursor = Cursors.WaitCursor;
            string result;
            try
            {
                var psi = new ProcessStartInfo(Paths.Php, Paths.PhpArgs(Paths.Q(Paths.Setup)));
                psi.UseShellExecute = false;
                psi.CreateNoWindow = true;
                psi.RedirectStandardOutput = true;
                psi.RedirectStandardError = true;
                psi.StandardOutputEncoding = Encoding.UTF8;
                psi.WorkingDirectory = Path.GetDirectoryName(Paths.Php);
                psi.EnvironmentVariables["RM_WEB"] = Paths.Web;
                psi.EnvironmentVariables["RM_NAME"] = name.Text.Trim();
                psi.EnvironmentVariables["RM_USER"] = user.Text.Trim().ToLowerInvariant();
                psi.EnvironmentVariables["RM_PASS"] = pass.Text;
                psi.EnvironmentVariables["RM_SAMPLE"] = sample.Checked ? "1" : "0";
                using (var p = Process.Start(psi))
                {
                    string o = p.StandardOutput.ReadToEnd();
                    p.StandardError.ReadToEnd();
                    p.WaitForExit(60000);
                    result = p.ExitCode == 0 ? null : (o.Trim().Length > 0 ? o.Trim() : "No se pudo preparar la app.");
                }
            }
            catch (Exception ex) { result = "No se pudo preparar la app: " + ex.Message; }
            Cursor = Cursors.Default;
            ok.Enabled = true;
            if (result != null) { err.Text = result; return; }
            DialogResult = DialogResult.OK;
            Close();
        }
    }

    class MainForm : Form
    {
        readonly Server server = new Server();
        Settings settings;
        Label status, url, hint;
        Button btnHome, btnSala, btnPanel, btnStartStop, btnFirewall, btnLog, btnData;
        ComboBox address;
        NumericUpDown port;
        CheckBox autostart;
        NotifyIcon tray;
        bool quitting;
        readonly bool startHidden;

        public static Icon AppIcon()
        {
            try { return Icon.ExtractAssociatedIcon(Application.ExecutablePath); } catch { return SystemIcons.Application; }
        }

        public MainForm(bool minimized)
        {
            startHidden = minimized;
            settings = Settings.Load(Paths.SettingsFile);
            Text = Program.AppName;
            Icon = AppIcon();
            Font = new Font("Segoe UI", 10f);
            FormBorderStyle = FormBorderStyle.FixedSingle;
            MaximizeBox = false;
            StartPosition = FormStartPosition.CenterScreen;
            ClientSize = new Size(560, 470);

            Controls.Add(new Label { Left = 20, Top = 14, Width = 520, Height = 28, Text = Program.AppName, Font = new Font("Segoe UI Semibold", 14f) });
            status = new Label { Left = 20, Top = 46, Width = 520, Height = 24, Text = "Arrancando…", Font = new Font("Segoe UI Semibold", 10.5f) };
            Controls.Add(status);
            Controls.Add(new Label { Left = 20, Top = 76, Width = 520, Height = 22, Text = "Dirección para los móviles y tablets del mismo wifi:" });
            url = new Label { Left = 20, Top = 100, Width = 520, Height = 30, Font = new Font("Consolas", 13f, FontStyle.Bold), ForeColor = Color.FromArgb(20, 49, 63) };
            Controls.Add(url);

            btnHome = AddButton("Ver las direcciones y los QR", 20, 140, 255, (s, e) => OpenLocal("/local/"));
            btnSala = AddButton("Abrir Sala y cocina", 285, 140, 255, (s, e) => OpenLocal("/sala/"));
            btnPanel = AddButton("Abrir el panel (carta, cuentas)", 20, 182, 255, (s, e) => OpenLocal("/panel/"));
            btnStartStop = AddButton("Parar el servidor", 285, 182, 255, (s, e) => ToggleServer());

            var box = new GroupBox { Left = 20, Top = 230, Width = 520, Height = 150, Text = "Ajustes" };
            Controls.Add(box);
            box.Controls.Add(new Label { Left = 14, Top = 28, Width = 150, Text = "Dirección (IP):" });
            address = new ComboBox { Left = 170, Top = 25, Width = 220, DropDownStyle = ComboBoxStyle.DropDown };
            box.Controls.Add(address);
            box.Controls.Add(new Label { Left = 400, Top = 28, Width = 50, Text = "Puerto:" });
            port = new NumericUpDown { Left = 452, Top = 25, Width = 56, Minimum = 1024, Maximum = 65535, Value = settings.Port };
            box.Controls.Add(port);
            var apply = new Button { Left = 170, Top = 58, Width = 220, Height = 28, Text = "Guardar y reiniciar" };
            apply.Click += (s, e) => ApplySettings();
            box.Controls.Add(apply);
            autostart = new CheckBox { Left = 14, Top = 94, Width = 490, Text = "Arrancar sola al encender el ordenador (minimizada)", Checked = IsAutostart() };
            autostart.CheckedChanged += (s, e) => SetAutostart(autostart.Checked);
            box.Controls.Add(autostart);
            hint = new Label { Left = 14, Top = 120, Width = 495, Height = 22, ForeColor = Color.DimGray, Font = new Font("Segoe UI", 8.5f), Text = "Déjala en «automática» salvo que el router reserve siempre la misma IP a este PC." };
            box.Controls.Add(hint);

            btnFirewall = AddButton("Permitir en el firewall", 20, 392, 170, (s, e) => AllowFirewall());
            btnLog = AddButton("Ver el registro", 200, 392, 160, (s, e) => OpenFile(Paths.LogFile));
            btnData = AddButton("Carpeta de datos", 370, 392, 170, (s, e) => OpenFile(Paths.Data));
            Controls.Add(new Label { Left = 20, Top = 434, Width = 520, Height = 30, ForeColor = Color.DimGray, Font = new Font("Segoe UI", 8.5f), Text = "Al cerrar esta ventana la app sigue funcionando junto al reloj. Para salir del todo: botón derecho en el icono → Salir." });

            tray = new NotifyIcon { Icon = Icon, Text = "Restaurante · Mesas y cocina", Visible = true };
            var menu = new ContextMenuStrip();
            menu.Items.Add("Abrir", null, (s, e) => ShowWindow());
            menu.Items.Add("Ver las direcciones y los QR", null, (s, e) => OpenLocal("/local/"));
            menu.Items.Add("Abrir Sala y cocina", null, (s, e) => OpenLocal("/sala/"));
            menu.Items.Add(new ToolStripSeparator());
            menu.Items.Add("Salir (para el servidor)", null, (s, e) => Quit());
            tray.ContextMenuStrip = menu;
            tray.DoubleClick += (s, e) => ShowWindow();

            server.StatusChanged += st => BeginInvokeSafe(() => SetStatus(st));
            FillAddresses();
            StartServer();
        }

        Button AddButton(string text, int x, int y, int w, EventHandler click)
        {
            var b = new Button { Text = text, Left = x, Top = y, Width = w, Height = 34 };
            b.Click += click;
            Controls.Add(b);
            return b;
        }

        protected override void SetVisibleCore(bool value)
        {
            if (startHidden && !IsHandleCreated) { CreateHandle(); value = false; }
            base.SetVisibleCore(value);
        }

        void BeginInvokeSafe(Action a)
        {
            try { if (IsHandleCreated) BeginInvoke(a); } catch { }
        }

        void FillAddresses()
        {
            address.Items.Clear();
            address.Items.Add("automática");
            foreach (var ip in Net.LocalIPv4()) address.Items.Add(ip);
            address.Text = settings.Address == "" ? "automática" : settings.Address;
        }

        string CurrentHost()
        {
            if (settings.Address != "") return settings.Address;
            var ips = Net.LocalIPv4();
            return ips.Count > 0 ? ips[0] : "127.0.0.1";
        }

        string BaseUrl()
        {
            return "http://" + CurrentHost() + ":" + settings.Port;
        }

        void StartServer()
        {
            string err = server.Start(settings.Port, BaseUrl());
            url.Text = BaseUrl() + "/sala/";
            SetStatus(server.Running ? "Funcionando" : "Parado");
            if (err != null)
            {
                SetStatus("Parado");
                MessageBox.Show(this, err, Program.AppName, MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
            if (CurrentHost() == "127.0.0.1")
                hint.Text = "No hay red: conecta el ordenador al wifi del local para que entren los móviles.";
        }

        void SetStatus(string st)
        {
            bool on = server.Running;
            status.Text = (on ? "● " : "○ ") + st;
            status.ForeColor = on ? Color.ForestGreen : Color.Firebrick;
            btnStartStop.Text = on ? "Parar el servidor" : "Arrancar el servidor";
            tray.Text = "Restaurante · " + (on ? "funcionando" : "parado");
        }

        void ToggleServer()
        {
            if (server.Running) server.Stop(); else StartServer();
        }

        void ApplySettings()
        {
            string a = address.Text.Trim();
            if (a == "automática" || a == "") a = "";
            else if (!System.Text.RegularExpressions.Regex.IsMatch(a, @"^[A-Za-z0-9.-]{1,253}$"))
            {
                MessageBox.Show(this, "Escribe una IP (por ejemplo 192.168.1.20) o un nombre sin http:// ni barras.", Program.AppName);
                return;
            }
            settings.Address = a;
            settings.Port = (int)port.Value;
            settings.Save(Paths.SettingsFile);
            server.Stop();
            StartServer();
            MessageBox.Show(this, "Hecho. Si ya habías impreso los QR de las mesas y ha cambiado la dirección, vuelve a imprimirlos.", Program.AppName);
        }

        void OpenLocal(string path)
        {
            try { Process.Start("http://127.0.0.1:" + settings.Port + path); } catch { }
        }

        void OpenFile(string path)
        {
            try
            {
                if (!File.Exists(path) && !Directory.Exists(path)) { MessageBox.Show(this, "Todavía no hay nada que ver.", Program.AppName); return; }
                Process.Start(path);
            }
            catch { }
        }

        void AllowFirewall()
        {
            // Regla de entrada para el PHP de la app, solo desde la red local (cualquier perfil: muchos wifi salen como «Público»)
            string rule = "Restaurante Mesas y cocina";
            string cmd = "/c netsh advfirewall firewall delete rule name=\"" + rule + "\" >nul 2>&1 & netsh advfirewall firewall add rule name=\"" + rule + "\" dir=in action=allow program=\"" + Paths.Php + "\" enable=yes profile=any remoteip=localsubnet protocol=tcp";
            try
            {
                var psi = new ProcessStartInfo("cmd.exe", cmd);
                psi.Verb = "runas";
                psi.UseShellExecute = true;
                psi.WindowStyle = ProcessWindowStyle.Hidden;
                using (var p = Process.Start(psi)) { p.WaitForExit(20000); }
                MessageBox.Show(this, "Listo: los móviles del wifi ya pueden entrar.", Program.AppName);
            }
            catch (Exception ex)
            {
                MessageBox.Show(this, "No se pudo cambiar el firewall (hace falta aceptar el aviso de Windows). " + ex.Message, Program.AppName);
            }
        }

        static bool IsAutostart()
        {
            try { using (var k = Registry.CurrentUser.OpenSubKey(Program.RunKey)) { return k != null && k.GetValue(Program.RunValue) != null; } } catch { return false; }
        }

        static void SetAutostart(bool on)
        {
            try
            {
                using (var k = Registry.CurrentUser.CreateSubKey(Program.RunKey))
                {
                    if (on) k.SetValue(Program.RunValue, "\"" + Application.ExecutablePath + "\" --minimizado");
                    else k.DeleteValue(Program.RunValue, false);
                }
            }
            catch { }
        }

        void ShowWindow()
        {
            Show();
            WindowState = FormWindowState.Normal;
            Activate();
        }

        void Quit()
        {
            var r = MessageBox.Show(this, "Si sales, los móviles y la cocina dejarán de funcionar hasta que vuelvas a abrir la app. ¿Salir?", Program.AppName, MessageBoxButtons.YesNo, MessageBoxIcon.Question);
            if (r != DialogResult.Yes) return;
            quitting = true;
            server.Stop();
            tray.Visible = false;
            Application.Exit();
        }

        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            if (!quitting && e.CloseReason == CloseReason.UserClosing)
            {
                e.Cancel = true;
                Hide();
                tray.ShowBalloonTip(3000, Program.AppName, "Sigue funcionando aquí. Botón derecho → Salir para cerrarla.", ToolTipIcon.Info);
                return;
            }
            server.Stop();
            tray.Visible = false;
            base.OnFormClosing(e);
        }
    }
}
