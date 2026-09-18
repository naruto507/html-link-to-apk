/**
 * Generates a crisp 512x512 Android launcher icon from an emoji or glyph with styling
 */
export function generateIconDataUrl(emoji: string, bgGradient: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  const gradient = ctx.createLinearGradient(0, 0, 512, 512);
  const colors = bgGradient.split(',');
  if (colors.length >= 2) {
    gradient.addColorStop(0, colors[0].trim());
    gradient.addColorStop(1, colors[1].trim());
  } else {
    gradient.addColorStop(0, '#0ea5e9');
    gradient.addColorStop(1, '#0284c7');
  }

  // Draw smooth squircle / rounded rect for launcher icon
  const r = 112; // Google Play corner radius standard
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(512 - r, 0);
  ctx.quadraticCurveTo(512, 0, 512, r);
  ctx.lineTo(512, 512 - r);
  ctx.quadraticCurveTo(512, 512, 512 - r, 512);
  ctx.lineTo(r, 512);
  ctx.quadraticCurveTo(0, 512, 0, 512 - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();

  ctx.fillStyle = gradient;
  ctx.fill();

  // Draw subtle inner glow
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.stroke();

  // Emoji or symbol in center
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '240px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
  ctx.fillText(emoji || '⚡', 256, 276);

  return canvas.toDataURL('image/png');
}
