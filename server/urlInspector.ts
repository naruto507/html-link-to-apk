import { URL } from 'url';

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

export async function inspectUrl(inputUrl: string): Promise<UrlInspectionResult> {
  let normalized = inputUrl.trim();
  if (!normalized) {
    return {
      success: false,
      url: '',
      originalUrl: inputUrl,
      reachable: false,
      isHttps: false,
      allowsIframe: false,
      suggestedAppName: '',
      suggestedPackageName: '',
      error: 'Please enter a valid website URL.',
    };
  }

  if (!/^https?:\/\//i.test(normalized)) {
    normalized = 'https://' + normalized;
  }

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    return {
      success: false,
      url: normalized,
      originalUrl: inputUrl,
      reachable: false,
      isHttps: false,
      allowsIframe: false,
      suggestedAppName: '',
      suggestedPackageName: '',
      error: 'Invalid URL format. Please check the address.',
    };
  }

  const isHttps = parsed.protocol === 'https:';
  const hostname = parsed.hostname;
  
  // Clean hostname for suggested app name and package name
  const hostParts = hostname.replace(/^www\./, '').split('.');
  const rawMainName = (hostParts[0] || 'myweb').replace(/[^a-z0-9]/gi, '').toLowerCase();
  const cleanAppName = rawMainName.charAt(0).toUpperCase() + rawMainName.slice(1);
  const suggestedPackageName = `com.${rawMainName || 'webapp'}.app`;

  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const response = await fetch(parsed.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeoutId);
    const responseTimeMs = Date.now() - startTime;

    const statusCode = response.status;
    const statusText = response.statusText;
    const finalUrl = response.url || parsed.toString();

    // Check iframe headers
    const xFrame = response.headers.get('x-frame-options');
    const csp = response.headers.get('content-security-policy') || '';
    const allowsIframe = !xFrame && !csp.includes('frame-ancestors');

    const htmlText = await response.text();

    // Extract title
    let title = '';
    const titleMatch = htmlText.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].trim()
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
    }

    // Extract description
    let description = '';
    const descMatch = htmlText.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)
      || htmlText.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
    if (descMatch && descMatch[1]) {
      description = descMatch[1].trim();
    }

    // Extract theme color
    let themeColor = '';
    const themeMatch = htmlText.match(/<meta\s+name=["']theme-color["']\s+content=["']([^"']+)["']/i);
    if (themeMatch && themeMatch[1]) {
      themeColor = themeMatch[1].trim();
    }

    // Extract favicon
    let faviconUrl = '';
    const appleIconMatch = htmlText.match(/<link\s+[^>]*rel=["'](?:apple-touch-icon|icon|shortcut icon)["'][^>]*href=["']([^"']+)["']/i);
    if (appleIconMatch && appleIconMatch[1]) {
      faviconUrl = appleIconMatch[1].trim();
    } else {
      faviconUrl = '/favicon.ico';
    }

    // Resolve relative favicon URL
    try {
      faviconUrl = new URL(faviconUrl, finalUrl).toString();
    } catch {
      faviconUrl = new URL('/favicon.ico', finalUrl).toString();
    }

    // Attempt to download favicon and convert to base64
    let faviconBase64 = '';
    try {
      const favController = new AbortController();
      const favTimeout = setTimeout(() => favController.abort(), 3000);
      const favRes = await fetch(faviconUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: favController.signal,
      });
      clearTimeout(favTimeout);

      if (favRes.ok) {
        const contentType = favRes.headers.get('content-type') || 'image/png';
        const buffer = await favRes.arrayBuffer();
        if (buffer.byteLength > 40 && buffer.byteLength < 500000) {
          const b64 = Buffer.from(buffer).toString('base64');
          faviconBase64 = `data:${contentType.split(';')[0]};base64,${b64}`;
        }
      }
    } catch {
      // Favicon fetch failure is non-fatal
    }

    // Derive concise app name from title or fallback to clean domain
    let finalAppName = cleanAppName;
    if (title) {
      // Split on common delimiters like " - ", " | ", " • ", " :: "
      const parts = title.split(/\s+[-|•:»~]\s+/);
      const shortestPart = parts.reduce((a, b) => (a.length <= b.length ? a : b), parts[0]);
      if (shortestPart.length > 1 && shortestPart.length <= 30) {
        finalAppName = shortestPart.trim();
      } else if (parts[0] && parts[0].length <= 30) {
        finalAppName = parts[0].trim();
      }
    }

    return {
      success: true,
      url: finalUrl,
      originalUrl: inputUrl,
      reachable: statusCode >= 200 && statusCode < 400,
      statusCode,
      statusText,
      isHttps,
      responseTimeMs,
      title: title || cleanAppName,
      description,
      themeColor: themeColor || '#0ea5e9',
      favicon: faviconUrl,
      faviconBase64,
      allowsIframe,
      suggestedAppName: finalAppName,
      suggestedPackageName,
    };
  } catch (err: any) {
    const isTimeout = err.name === 'AbortError';
    return {
      success: false,
      url: normalized,
      originalUrl: inputUrl,
      reachable: false,
      isHttps,
      allowsIframe: false,
      suggestedAppName: cleanAppName,
      suggestedPackageName,
      error: isTimeout
        ? 'Connection timed out while checking the website (took > 7s). The site may be slow or blocking automated checks.'
        : `Could not reach ${hostname}: ${err.message || 'Network error'}`,
    };
  }
}
