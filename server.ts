import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import QRCode from 'qrcode';
import { buildApk, getBuildArtifactPath, ensureBuildsDir, ensureSystemBuildTools, ApkBuildOptions } from './server/apkBuilder.ts';
import { APP_TEMPLATES } from './server/templates.ts';
import { inspectUrl } from './server/urlInspector.ts';

const PORT = 3000;

async function startServer() {
  await ensureBuildsDir();
  
  // Non-blocking background check for Android SDK compilation toolchain
  ensureSystemBuildTools().catch(err => {
    console.warn('[Toolchain Init Warning]', err?.message || err);
  });

  const app = express();

  // Support up to 50MB payloads for HTML/CSS/Images
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Get available pre-made templates
  app.get('/api/templates', (req, res) => {
    res.json(APP_TEMPLATES);
  });

  // Verify and Inspect Web URL
  app.post('/api/check-url', async (req, res) => {
    try {
      const { url } = req.body;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'URL parameter is required.'
        });
      }

      const result = await inspectUrl(url);
      return res.json(result);
    } catch (err: any) {
      console.error('URL inspection error:', err);
      return res.status(500).json({
        success: false,
        error: err?.message || 'Failed to inspect URL'
      });
    }
  });

  // Single-Click Build APK Endpoint
  app.post('/api/build', async (req, res) => {
    try {
      const options: ApkBuildOptions = req.body;
      if (!options) {
        return res.status(400).json({ success: false, error: 'Build parameters are required.' });
      }

      const isUrlMode = options.appMode === 'url';
      if (isUrlMode && !options.webUrl?.trim()) {
        return res.status(400).json({ success: false, error: 'Website URL is required for Link-to-App mode.' });
      }

      if (!isUrlMode && !options.html?.trim()) {
        return res.status(400).json({ success: false, error: 'HTML code is required to package an APK.' });
      }

      const result = await buildApk(options);
      
      // Determine host for mobile direct download URL
      const forwardedProto = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers['x-forwarded-host'] || req.headers.host;
      const baseUrl = process.env.APP_URL || `${forwardedProto}://${host}`;
      const downloadUrl = `${baseUrl}/api/download/${result.buildId}/${result.apkFilename || 'app.apk'}`;
      const projectZipUrl = `${baseUrl}/api/download/${result.buildId}/project-source.zip`;
      const keystoreUrl = `${baseUrl}/api/download/${result.buildId}/release.keystore`;

      let qrDataUrl = '';
      try {
        qrDataUrl = await QRCode.toDataURL(downloadUrl, {
          width: 280,
          margin: 1,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          }
        });
      } catch (qrErr) {
        console.warn('QR Code generation warning:', qrErr);
      }

      return res.json({
        ...result,
        downloadUrl,
        projectZipUrl,
        keystoreUrl,
        qrDataUrl
      });
    } catch (err: any) {
      console.error('APK build handler error:', err);
      return res.status(500).json({
        success: false,
        error: err?.message || 'Internal server error during APK compilation'
      });
    }
  });

  // Download artifact (APK, ZIP project, Keystore)
  app.get('/api/download/:buildId/:filename', (req, res) => {
    const { buildId, filename } = req.params;
    const artifactPath = getBuildArtifactPath(buildId, filename);

    if (!artifactPath) {
      return res.status(404).send('Artifact not found or expired.');
    }

    const ext = path.extname(filename).toLowerCase();
    if (ext === '.apk') {
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    } else if (ext === '.zip') {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    } else if (ext === '.keystore' || ext === '.jks') {
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    }

    res.sendFile(artifactPath);
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HTML to APK Builder server running on port ${PORT}`);
  });
}

startServer();
