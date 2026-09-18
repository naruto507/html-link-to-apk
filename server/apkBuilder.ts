import fs from 'fs/promises';
import { existsSync, createReadStream } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import crypto from 'crypto';
import JSZip from 'jszip';

const execAsync = util.promisify(exec);

export interface ApkBuildOptions {
  appName: string;
  packageName: string;
  versionName: string;
  versionCode: number;
  appMode?: 'html' | 'url';
  webUrl?: string;
  orientation?: 'unspecified' | 'portrait' | 'landscape';
  fullscreen?: boolean;
  pullToRefresh?: boolean;
  hardwareAccelerated?: boolean;
  zoomEnabled?: boolean;
  permissions?: string[];
  themeColor?: string;
  iconBase64?: string;
  monetizationAds?: boolean;
  html?: string;
  keystore?: {
    alias?: string;
    password?: string;
    organization?: string;
    country?: string;
  };
}

export interface ApkBuildResult {
  success: boolean;
  buildId: string;
  apkSize: number;
  apkFilename: string;
  signedWith: string;
  verifiedSchemes: {
    v1: boolean;
    v2: boolean;
    v3: boolean;
  };
  durationMs: number;
  error?: string;
  logs: string[];
}

// In-memory or on-disk registry of builds
const BUILDS_DIR = '/tmp/apk_builds';

export async function ensureBuildsDir() {
  await fs.mkdir(BUILDS_DIR, { recursive: true });
}

let isBootstrappingTools = false;
let toolsBootstrapPromise: Promise<void> | null = null;

export async function ensureSystemBuildTools(addLog?: (msg: string) => void): Promise<void> {
  if (toolsBootstrapPromise) {
    return toolsBootstrapPromise;
  }

  const checkTools = async () => {
    const requiredBinaries = ['aapt', 'javac', 'dx', 'zip', 'zipalign', 'apksigner', 'keytool'];
    let allPresent = true;
    for (const bin of requiredBinaries) {
      try {
        await execAsync(`which ${bin}`);
      } catch {
        allPresent = false;
        break;
      }
    }

    const hasAndroidJar = existsSync('/usr/lib/android-sdk/platforms/android-23/android.jar');
    if (allPresent && hasAndroidJar) {
      return;
    }

    addLog?.('Android compilation SDK build tools missing. Bootstrapping toolchain packages...');
    console.log('[SDK Bootstrap] Installing aapt, javac, dx, zipalign, apksigner, android.jar...');

    try {
      await execAsync('DEBIAN_FRONTEND=noninteractive apt-get update');
      await execAsync(
        'DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" aapt zipalign apksigner dalvik-exchange android-sdk-platform-23 default-jdk-headless zip unzip'
      );
      // Ensure dx is linked in /usr/bin if needed
      await execAsync('test -f /usr/bin/dx || (test -f /usr/lib/android-sdk/build-tools/debian/dx && ln -sf /usr/lib/android-sdk/build-tools/debian/dx /usr/bin/dx) || true');
      addLog?.('Android build tools successfully installed and configured.');
      console.log('[SDK Bootstrap] Toolchain installation completed successfully.');
    } catch (err: any) {
      console.error('[SDK Bootstrap] Installation error:', err);
      addLog?.(`[SDK Bootstrap Warning] ${err?.message || String(err)}`);
    }
  };

  toolsBootstrapPromise = checkTools().finally(() => {
    toolsBootstrapPromise = null;
  });

  return toolsBootstrapPromise;
}

function sanitizeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function cleanPackageName(pkg: string): string {
  const cleaned = pkg.trim().toLowerCase().replace(/[^a-z0-9_.]/g, '');
  const parts = cleaned.split('.').filter(p => p.length > 0 && /^[a-z][a-z0-9_]*$/.test(p));
  if (parts.length >= 2) {
    return parts.join('.');
  }
  return 'com.app.' + (parts[0] || 'mobileapp');
}

export async function buildApk(options: ApkBuildOptions): Promise<ApkBuildResult> {
  const startTime = Date.now();
  const buildId = crypto.randomUUID();
  const buildDir = path.join(BUILDS_DIR, buildId);
  const logs: string[] = [];

  const addLog = (msg: string) => {
    logs.push(`[${new Date().toISOString().substring(11, 19)}] ${msg}`);
  };

  try {
    // Ensure the system has Android build tools available
    await ensureSystemBuildTools(addLog);

    addLog('Initializing Android build workspace...');
    await fs.mkdir(buildDir, { recursive: true });

    const appName = options.appName.trim() || 'My Web App';
    const packageName = cleanPackageName(options.packageName || 'com.example.htmlapp');
    const versionName = options.versionName || '1.0.0';
    const versionCode = Math.max(1, parseInt(String(options.versionCode), 10) || 1);
    const orientation = options.orientation || 'portrait';
    const fullscreen = !!options.fullscreen;
    const permissions = Array.isArray(options.permissions) && options.permissions.length > 0
      ? options.permissions
      : ['android.permission.INTERNET', 'android.permission.ACCESS_NETWORK_STATE'];
    
    // Ensure INTERNET permission is always present for WebView network loading
    if (!permissions.includes('android.permission.INTERNET')) {
      permissions.push('android.permission.INTERNET');
    }
    if (!permissions.includes('android.permission.ACCESS_NETWORK_STATE')) {
      permissions.push('android.permission.ACCESS_NETWORK_STATE');
    }

    const packagePath = packageName.replace(/\./g, '/');
    const srcDir = path.join(buildDir, 'src', packagePath);
    const resValuesDir = path.join(buildDir, 'res', 'values');
    const resMipmapDir = path.join(buildDir, 'res', 'mipmap-hdpi');
    const assetsWwwDir = path.join(buildDir, 'assets', 'www');
    const binDir = path.join(buildDir, 'bin');

    await fs.mkdir(srcDir, { recursive: true });
    await fs.mkdir(resValuesDir, { recursive: true });
    await fs.mkdir(resMipmapDir, { recursive: true });
    await fs.mkdir(assetsWwwDir, { recursive: true });
    await fs.mkdir(binDir, { recursive: true });

    addLog(`Configured package ID: ${packageName} (v${versionName} - #${versionCode})`);

    // 1. AndroidManifest.xml
    const permissionsXml = permissions
      .map(p => `    <uses-permission android:name="${p}" />`)
      .join('\n');

    const themeStyle = fullscreen
      ? '@android:style/Theme.NoTitleBar.Fullscreen'
      : '@android:style/Theme.NoTitleBar';

    const screenOrientationAttr = orientation !== 'unspecified'
      ? `android:screenOrientation="${orientation}"`
      : '';

    const manifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${packageName}"
    android:versionCode="${versionCode}"
    android:versionName="${versionName}">

    <uses-sdk android:minSdkVersion="21" android:targetSdkVersion="33" />
${permissionsXml}

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:hardwareAccelerated="${options.hardwareAccelerated !== false}"
        android:usesCleartextTraffic="true"
        android:theme="${themeStyle}">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            ${screenOrientationAttr}
            android:configChanges="orientation|screenSize|keyboardHidden|smallestScreenSize|screenLayout">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

    await fs.writeFile(path.join(buildDir, 'AndroidManifest.xml'), manifestXml, 'utf-8');

    // 2. strings.xml & colors.xml
    const stringsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${sanitizeXml(appName)}</string>
</resources>`;
    await fs.writeFile(path.join(resValuesDir, 'strings.xml'), stringsXml, 'utf-8');

    const themeColor = options.themeColor || '#10b981';
    const colorsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="primary">${themeColor}</color>
    <color name="background">#ffffff</color>
</resources>`;
    await fs.writeFile(path.join(resValuesDir, 'colors.xml'), colorsXml, 'utf-8');

    // 3. Icon
    let iconBuffer: Buffer | null = null;
    if (options.iconBase64) {
      try {
        const rawBase64 = options.iconBase64.includes('base64,')
          ? options.iconBase64.split('base64,')[1]
          : options.iconBase64;
        iconBuffer = Buffer.from(rawBase64, 'base64');
      } catch (e) {
        console.warn('Failed to parse provided iconBase64, using default icon', e);
      }
    }

    if (!iconBuffer || iconBuffer.length < 50) {
      // 100% AAPT-validated 96x96 PNG Android Launcher Icon
      const valid96x96PngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAIAAABt+uBvAAAApElEQVR4nO3QQQ0AIBDAsJOAZWThDgd82aPJBCyddbYezfeDeIAAAQIEKBwgQIAAAQoHCBAgQIDCAQIECBCgcIAAAQIEKBwgQIAAAQoHCBAgQIDCAQIECBCgcIAAAQIEKBwgQIAAAQoHCBAgQIDCAQIECBCgcIAAAQIEKBwgQIAAAQoHCBAgQIDCAQIECBCgcIAAAQIEKBwgQIAAAQoHCBAgQD+7Z6lqs/UA9+QAAAAASUVORK5CYII=';
      iconBuffer = Buffer.from(valid96x96PngBase64, 'base64');
    }

    await fs.writeFile(path.join(resMipmapDir, 'ic_launcher.png'), iconBuffer);
    addLog('Installed application launcher icon (ic_launcher.png).');

    // 4. User's HTML and Assets
    const isUrlMode = options.appMode === 'url' && !!options.webUrl?.trim();
    const targetWebUrl = options.webUrl?.trim() || '';

    if (isUrlMode) {
      // Create splash / redirect HTML and offline fallback
      const splashHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${sanitizeXml(appName)}</title>
  <style>
    body { background: #0f172a; color: #94a3b8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .spinner { width: 38px; height: 38px; border: 3px solid rgba(14, 165, 233, 0.2); border-top-color: #0ea5e9; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .title { font-size: 1.1rem; color: #f8fafc; font-weight: 600; margin-bottom: 6px; }
    .url { font-size: 0.8rem; color: #64748b; font-family: monospace; }
  </style>
</head>
<body>
  <div class="spinner"></div>
  <div class="title">${sanitizeXml(appName)}</div>
  <div class="url">${sanitizeXml(targetWebUrl)}</div>
  <script>window.location.href = "${targetWebUrl.replace(/"/g, '\\"')}";</script>
</body>
</html>`;
      await fs.writeFile(path.join(assetsWwwDir, 'index.html'), splashHtml, 'utf-8');

      const offlineHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>Offline</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0f172a; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; text-align: center; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 24px; padding: 36px 24px; max-width: 380px; width: 100%; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
    .icon-box { width: 68px; height: 68px; border-radius: 20px; background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: #f87171; font-size: 30px; }
    h2 { font-size: 1.3rem; font-weight: 700; margin-bottom: 8px; color: #f8fafc; }
    p { font-size: 0.88rem; color: #94a3b8; line-height: 1.5; margin-bottom: 24px; }
    button { background: #0ea5e9; color: #ffffff; border: none; padding: 14px 28px; font-size: 1rem; font-weight: 600; border-radius: 14px; cursor: pointer; width: 100%; box-shadow: 0 4px 14px rgba(14, 165, 233, 0.35); }
    button:active { opacity: 0.85; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-box">⚡</div>
    <h2>Connection Offline</h2>
    <p>Unable to connect to the live website. Please check your mobile network or Wi-Fi connection and tap below to retry.</p>
    <button onclick="retry()">Retry Connection</button>
  </div>
  <script>
    function retry() {
      window.location.href = "${targetWebUrl.replace(/"/g, '\\"')}";
    }
  </script>
</body>
</html>`;
      await fs.writeFile(path.join(assetsWwwDir, 'offline.html'), offlineHtml, 'utf-8');
      addLog(`Configured Web Link target: ${targetWebUrl}`);
      addLog('Bundled offline resilience fallback screen into assets/www/offline.html');
    } else {
      let htmlContent = options.html || '<!DOCTYPE html><html><head><title>App</title></head><body><h1>Hello World</h1></body></html>';
      
      // If monetization ads are enabled and not yet present in HTML, inject them
      if (options.monetizationAds !== false && !htmlContent.includes('profitableratecpmnetwork.com')) {
        const adSnippet = `
<!-- Monetization: ProfitRate CPM Network Ads -->
<script src="https://pl31392604.profitableratecpmnetwork.com/11/d4/c4/11d4c4a5281a7c675463211e54b84b6f.js"></script>
<script async="async" data-cfasync="false" src="https://pl31392602.profitableratecpmnetwork.com/2a00ac83f8be7cfb21427eddd0b63e05/invoke.js"></script>
<div id="container-2a00ac83f8be7cfb21427eddd0b63e05" style="width:100%;text-align:center;margin:10px auto;"></div>
`;
        if (htmlContent.includes('</body>')) {
          htmlContent = htmlContent.replace('</body>', `${adSnippet}\n</body>`);
        } else {
          htmlContent += adSnippet;
        }
      }

      await fs.writeFile(path.join(assetsWwwDir, 'index.html'), htmlContent, 'utf-8');
      addLog('Packaged web document into assets/www/index.html');
    }

    // 5. MainActivity.java
    const mainActivityJava = `package ${packageName};

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.ConsoleMessage;
import android.webkit.CookieManager;
import android.webkit.GeolocationPermissions;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

public class MainActivity extends Activity {
    private WebView webView;
    private ValueCallback<Uri[]> filePathCallback;
    private final static int FILECHOOSER_RESULTCODE = 1001;
    ${isUrlMode ? `private static final String TARGET_URL = "${targetWebUrl.replace(/"/g, '\\"')}";` : ''}

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        
        ${fullscreen ? `
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_FULLSCREEN,
            WindowManager.LayoutParams.FLAG_FULLSCREEN
        );
        ` : ''}

        FrameLayout layout = new FrameLayout(this);
        layout.setBackgroundColor(0xFF101014);

        webView = new WebView(this);
        WebSettings settings = webView.getSettings();
        
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(true);
        settings.setSupportMultipleWindows(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setSupportZoom(${options.zoomEnabled ? 'true' : 'false'});
        settings.setBuiltInZoomControls(${options.zoomEnabled ? 'true' : 'false'});
        settings.setDisplayZoomControls(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
            cookieManager.setAcceptThirdPartyCookies(webView, true);
        }

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url == null) return false;
                if (url.startsWith("file:///android_asset/") || url.startsWith("data:")) {
                    return false;
                }

                try {
                    Uri uri = Uri.parse(url);
                    String scheme = uri.getScheme();
                    if (scheme != null && (
                        scheme.equalsIgnoreCase("tel") ||
                        scheme.equalsIgnoreCase("mailto") ||
                        scheme.equalsIgnoreCase("sms") ||
                        scheme.equalsIgnoreCase("whatsapp") ||
                        scheme.equalsIgnoreCase("geo") ||
                        scheme.equalsIgnoreCase("market")
                    )) {
                        Intent intent = new Intent(Intent.ACTION_VIEW, uri);
                        startActivity(intent);
                        return true;
                    }

                    ${isUrlMode ? `
                    // For Web Link mode, keep navigation within target domain inside WebView
                    Uri targetUri = Uri.parse(TARGET_URL);
                    if (uri.getHost() != null && targetUri.getHost() != null) {
                        String h1 = uri.getHost().toLowerCase();
                        String h2 = targetUri.getHost().toLowerCase();
                        if (h1.equals(h2) || h1.endsWith("." + h2) || h2.endsWith("." + h1)) {
                            return false;
                        }
                    }
                    ` : ''}

                    Intent intent = new Intent(Intent.ACTION_VIEW, uri);
                    startActivity(intent);
                    return true;
                } catch (Exception e) {
                    return false;
                }
            }

            ${isUrlMode ? `
            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                super.onReceivedError(view, errorCode, description, failingUrl);
                if (errorCode == ERROR_HOST_LOOKUP || errorCode == ERROR_CONNECT || errorCode == ERROR_TIMEOUT || errorCode == ERROR_FAILED_SSL_HANDSHAKE) {
                    view.loadUrl("file:///android_asset/www/offline.html");
                }
            }
            ` : ''}
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                callback.invoke(origin, true, false);
            }

            @Override
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                return super.onConsoleMessage(consoleMessage);
            }

            @Override
            public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, android.os.Message resultMsg) {
                WebView newWebView = new WebView(MainActivity.this);
                newWebView.setWebViewClient(new WebViewClient() {
                    @Override
                    public boolean shouldOverrideUrlLoading(WebView view, String url) {
                        try {
                            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                            startActivity(intent);
                        } catch (Exception ignored) {}
                        return true;
                    }
                });
                WebView.WebViewTransport transport = (WebView.WebViewTransport) resultMsg.obj;
                transport.setWebView(newWebView);
                resultMsg.sendToTarget();
                return true;
            }

            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, WebChromeClient.FileChooserParams fileChooserParams) {
                if (MainActivity.this.filePathCallback != null) {
                    MainActivity.this.filePathCallback.onReceiveValue(null);
                }
                MainActivity.this.filePathCallback = filePathCallback;

                Intent intent = fileChooserParams.createIntent();
                try {
                    startActivityForResult(intent, FILECHOOSER_RESULTCODE);
                } catch (Exception e) {
                    MainActivity.this.filePathCallback = null;
                    return false;
                }
                return true;
            }
        });

        layout.addView(webView);
        setContentView(layout);

        ${isUrlMode ? `webView.loadUrl(TARGET_URL);` : `webView.loadUrl("file:///android_asset/www/index.html");`}
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == FILECHOOSER_RESULTCODE) {
            if (filePathCallback != null) {
                Uri[] results = null;
                if (resultCode == Activity.RESULT_OK && data != null) {
                    String dataString = data.getDataString();
                    if (dataString != null) {
                        results = new Uri[]{Uri.parse(dataString)};
                    }
                }
                filePathCallback.onReceiveValue(results);
                filePathCallback = null;
            }
        } else {
            super.onActivityResult(requestCode, resultCode, data);
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) webView.onResume();
    }

    @Override
    protected void onPause() {
        if (webView != null) webView.onPause();
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
}
`;
    await fs.writeFile(path.join(srcDir, 'MainActivity.java'), mainActivityJava, 'utf-8');
    addLog('Generated native Android Activity with hardware-accelerated WebView engine.');

    const androidJar = '/usr/lib/android-sdk/platforms/android-23/android.jar';

    // Step 3: Run AAPT to generate R.java
    addLog('Compiling Android resources (aapt)...');
    await execAsync(`aapt package -m -J src -M AndroidManifest.xml -S res -I "${androidJar}"`, { cwd: buildDir });

    // Step 4: Compile Java classes
    addLog('Compiling Java classes (javac)...');
    await execAsync(`javac -source 8 -target 8 -bootclasspath "${androidJar}" -d bin $(find src -name "*.java")`, { cwd: buildDir });

    // Step 5: Convert bytecode to Dalvik DEX
    addLog('Translating bytecode into Dalvik executable format (dx)...');
    await execAsync(`dx --dex --output=bin/classes.dex bin`, { cwd: buildDir });

    // Step 6: Package APK with AAPT
    addLog('Packaging APK bundle with user assets and compiled resources...');
    await execAsync(`aapt package -f -M AndroidManifest.xml -S res -A assets -I "${androidJar}" -F app-unaligned.apk`, { cwd: buildDir });

    // Step 7: Inject classes.dex into APK
    await execAsync(`(cd bin && zip -u ../app-unaligned.apk classes.dex)`, { cwd: buildDir });

    // Step 8: Align APK (zipalign 4-byte boundaries)
    addLog('Aligning APK to 4-byte boundaries (zipalign)...');
    await execAsync(`zipalign -f -v 4 app-unaligned.apk app-aligned.apk`, { cwd: buildDir });

    // Step 9: Keystore generation
    const alias = options.keystore?.alias?.trim() || 'releasekey';
    const password = options.keystore?.password?.trim() || 'apkbuilder2026';
    const org = sanitizeXml(options.keystore?.organization?.trim() || appName);
    const country = (options.keystore?.country?.trim() || 'US').substring(0, 2).toUpperCase();
    const dname = `CN=${appName}, OU=AppDev, O=${org}, L=City, ST=State, C=${country}`;

    addLog(`Preparing RSA-2048 signing certificate (Alias: ${alias})...`);
    await execAsync(
      `keytool -genkeypair -v -keystore release.keystore -alias "${alias}" -keyalg RSA -keysize 2048 -validity 10000 -storepass "${password}" -keypass "${password}" -dname "${dname}"`,
      { cwd: buildDir }
    );

    // Step 10: Sign with apksigner (v1 + v2 + v3 schemes)
    addLog('Cryptographically signing APK with v1, v2, and v3 schemes (apksigner)...');
    await execAsync(
      `apksigner sign --ks release.keystore --ks-key-alias "${alias}" --ks-pass "pass:${password}" --key-pass "pass:${password}" --out app-release.apk app-aligned.apk`,
      { cwd: buildDir }
    );

    // Step 11: Verify signature
    addLog('Verifying cryptographic signature on APK...');
    const verifyOutput = await execAsync(`apksigner verify --verbose app-release.apk`, { cwd: buildDir });
    const verifyStdout = verifyOutput.stdout + verifyOutput.stderr;

    const v1Verified = verifyStdout.includes('Verified using v1 scheme (JAR signing): true');
    const v2Verified = verifyStdout.includes('Verified using v2 scheme (APK Signature Scheme v2): true');
    const v3Verified = verifyStdout.includes('Verified using v3 scheme (APK Signature Scheme v3): true');

    addLog(`Signature verification passed! (v1: ${v1Verified}, v2: ${v2Verified}, v3: ${v3Verified})`);

    // Step 12: Generate full Android Studio project ZIP for developers
    addLog('Generating complete Android Studio project bundle...');
    const projectZip = new JSZip();

    // Add build.gradle (root)
    projectZip.file('build.gradle', `// Top-level build file
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.2'
    }
}
allprojects {
    repositories {
        google()
        mavenCentral()
    }
}
`);
    projectZip.file('settings.gradle', `include ':app'\nrootProject.name = "${appName.replace(/[^a-zA-Z0-9_-]/g, '')}"\n`);
    projectZip.file('gradle.properties', 'android.useAndroidX=true\nandroid.enableJetifier=true\n');

    // Add app/build.gradle
    projectZip.file('app/build.gradle', `plugins {
    id 'com.android.application'
}

android {
    namespace '${packageName}'
    compileSdk 34

    defaultConfig {
        applicationId "${packageName}"
        minSdk 21
        targetSdk 34
        versionCode ${versionCode}
        versionName "${versionName}"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
}
`);
    projectZip.file('app/src/main/AndroidManifest.xml', manifestXml);
    projectZip.file('app/src/main/res/values/strings.xml', stringsXml);
    projectZip.file('app/src/main/res/values/colors.xml', colorsXml);
    projectZip.file(`app/src/main/java/${packagePath}/MainActivity.java`, mainActivityJava);
    try {
      const indexHtmlContent = await fs.readFile(path.join(assetsWwwDir, 'index.html'), 'utf-8');
      projectZip.file('app/src/main/assets/www/index.html', indexHtmlContent);
      if (isUrlMode) {
        const offlineHtmlContent = await fs.readFile(path.join(assetsWwwDir, 'offline.html'), 'utf-8');
        projectZip.file('app/src/main/assets/www/offline.html', offlineHtmlContent);
      }
    } catch {}

    // Read icon
    try {
      const iconBuffer = await fs.readFile(path.join(resMipmapDir, 'ic_launcher.png'));
      projectZip.file('app/src/main/res/mipmap-hdpi/ic_launcher.png', iconBuffer);
    } catch {}

    const projectZipBuffer = await projectZip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
    await fs.writeFile(path.join(buildDir, 'project-source.zip'), projectZipBuffer);

    // Save build metadata
    const apkStat = await fs.stat(path.join(buildDir, 'app-release.apk'));
    const safeAppFilename = `${appName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_v${versionName}.apk`;
    // Create copy with the user-facing descriptive filename
    await fs.copyFile(path.join(buildDir, 'app-release.apk'), path.join(buildDir, safeAppFilename));

    const meta = {
      buildId,
      appName,
      packageName,
      versionName,
      versionCode,
      createdAt: new Date().toISOString(),
      apkFilename: safeAppFilename,
      apkSize: apkStat.size,
      signedWith: `RSA-2048 (${alias})`,
      verifiedSchemes: { v1: v1Verified, v2: v2Verified, v3: v3Verified },
      durationMs: Date.now() - startTime,
      logs,
    };
    await fs.writeFile(path.join(buildDir, 'meta.json'), JSON.stringify(meta, null, 2), 'utf-8');

    addLog(`Build completed successfully in ${((Date.now() - startTime) / 1000).toFixed(2)}s! APK size: ${(apkStat.size / 1024).toFixed(1)} KB.`);

    return {
      success: true,
      buildId,
      apkSize: apkStat.size,
      apkFilename: safeAppFilename,
      signedWith: `RSA-2048 (${alias})`,
      verifiedSchemes: { v1: v1Verified, v2: v2Verified, v3: v3Verified },
      durationMs: Date.now() - startTime,
      logs,
    };
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    addLog(`Build failed: ${errorMsg}`);
    return {
      success: false,
      buildId,
      apkSize: 0,
      apkFilename: '',
      signedWith: '',
      verifiedSchemes: { v1: false, v2: false, v3: false },
      durationMs: Date.now() - startTime,
      error: errorMsg,
      logs,
    };
  }
}

export function getBuildArtifactPath(buildId: string, filename: string): string | null {
  const safeFilename = path.basename(filename);
  const targetDir = path.join(BUILDS_DIR, buildId);
  const fullPath = path.join(targetDir, safeFilename);

  if (existsSync(fullPath)) {
    return fullPath;
  }

  // Fallback for APK files
  if (safeFilename.endsWith('.apk')) {
    const defaultApk = path.join(targetDir, 'app-release.apk');
    if (existsSync(defaultApk)) return defaultApk;
  }

  return null;
}
