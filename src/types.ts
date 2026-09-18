export interface AppConfig {
  appName: string;
  packageName: string;
  versionName: string;
  versionCode: number;
  appMode: 'html' | 'url';
  webUrl: string;
  orientation: 'unspecified' | 'portrait' | 'landscape';
  fullscreen: boolean;
  pullToRefresh: boolean;
  hardwareAccelerated: boolean;
  zoomEnabled: boolean;
  permissions: string[];
  themeColor: string;
  iconType: 'generator' | 'upload';
  iconEmoji: string;
  iconBg: string;
  iconBase64: string;
  keystore: {
    alias: string;
    password: string;
    organization: string;
    country: string;
  };
}

export interface UrlInspectionResult {
  success: boolean;
  url: string;
  originalUrl: string;
  reachable: boolean;
  statusCode?: number;
  statusText?: string;
  isHttps: boolean;
  responseTimeMs?: number;
  title?: string;
  description?: string;
  themeColor?: string;
  favicon?: string;
  faviconBase64?: string;
  allowsIframe: boolean;
  suggestedAppName: string;
  suggestedPackageName: string;
  error?: string;
}

export interface BuildResult {
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
  logs: string[];
  downloadUrl?: string;
  projectZipUrl?: string;
  keystoreUrl?: string;
  qrDataUrl?: string;
  error?: string;
}

export interface AppTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  appName: string;
  packageName: string;
  orientation: 'portrait' | 'landscape' | 'unspecified';
  themeColor: string;
  permissions: string[];
  html: string;
}

export const ANDROID_PERMISSIONS = [
  { id: 'android.permission.INTERNET', name: 'Internet Access', desc: 'Allows webapp to load online APIs, images, and remote resources.', recommended: true },
  { id: 'android.permission.ACCESS_NETWORK_STATE', name: 'Network State', desc: 'Allows app to detect WiFi, Cellular, and offline transitions.', recommended: true },
  { id: 'android.permission.CAMERA', name: 'Camera Access', desc: 'Allows HTML5 video/photo capture and barcode scanning via getUserMedia.', recommended: false },
  { id: 'android.permission.RECORD_AUDIO', name: 'Microphone & Audio', desc: 'Allows WebRTC voice calls and audio recording inside HTML.', recommended: false },
  { id: 'android.permission.ACCESS_FINE_LOCATION', name: 'GPS / Geolocation', desc: 'Allows navigator.geolocation for maps and accurate positioning.', recommended: false },
  { id: 'android.permission.VIBRATE', name: 'Haptic Vibration', desc: 'Enables navigator.vibrate() for game and button feedback.', recommended: true },
  { id: 'android.permission.READ_EXTERNAL_STORAGE', name: 'Storage / Files', desc: 'Required for file picking and uploading user documents.', recommended: false },
  { id: 'android.permission.WAKE_LOCK', name: 'Keep Screen Awake', desc: 'Prevents screen from dimming during gameplay or videos.', recommended: false },
];
