/**
 * AI Realism Engine for Photorealistic Jewellery Try-On
 * Runs 100% client-side in browser using HTML5 Canvas Matting & 3D Parabolic Mesh Warping.
 */

const transparentCanvasCache = new WeakMap();

/**
 * Automatically removes solid backgrounds (white, gray, black, studio box) from jewellery images
 */
export function getTransparentJewelleryCanvas(img) {
  if (!img) return null;
  if (transparentCanvasCache.has(img)) {
    return transparentCanvasCache.get(img);
  }

  const width = img.naturalWidth || img.width || 400;
  const height = img.naturalHeight || img.height || 400;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);

  try {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    let transparentCount = 0;
    for (let i = 3; i < data.length; i += 16) {
      if (data[i] < 50) transparentCount++;
    }

    // If already has significant transparent background (>12%), cache & return
    if (transparentCount > (data.length / 16) * 0.12) {
      transparentCanvasCache.set(img, canvas);
      return canvas;
    }

    // Sample corner pixels to detect background color
    const corners = [
      [0, 0],
      [width - 1, 0],
      [0, height - 1],
      [width - 1, height - 1]
    ];

    let bgR = 0, bgG = 0, bgB = 0;
    corners.forEach(([x, y]) => {
      const idx = (y * width + x) * 4;
      bgR += data[idx];
      bgG += data[idx + 1];
      bgB += data[idx + 2];
    });
    bgR /= 4;
    bgG /= 4;
    bgB /= 4;

    const bgLum = 0.299 * bgR + 0.587 * bgG + 0.114 * bgB;
    const isLightBg = bgLum > 100;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      if (a < 10) continue;

      const dist = Math.hypot(r - bgR, g - bgG, b - bgB);
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      if (isLightBg) {
        if (dist < 50 || (lum > 200 && Math.abs(r - g) < 25 && Math.abs(g - b) < 25)) {
          data[i + 3] = 0;
        } else if (dist < 80) {
          const alphaFactor = (dist - 50) / 30;
          data[i + 3] = Math.round(a * alphaFactor);
        }
      } else {
        if (dist < 45 || (lum < 45 && Math.abs(r - g) < 25 && Math.abs(g - b) < 25)) {
          data[i + 3] = 0;
        } else if (dist < 75) {
          const alphaFactor = (dist - 45) / 30;
          data[i + 3] = Math.round(a * alphaFactor);
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
  } catch (e) {
    console.warn('Background matting notice:', e);
  }

  transparentCanvasCache.set(img, canvas);
  return canvas;
}

/**
 * Samples ambient color temperature, luminance, and contrast from user's skin/neck region
 */
export function sampleSkinEnvironment(ctx, neckX, neckY) {
  try {
    const sampleSize = 40;
    const startX = Math.max(0, Math.min(ctx.canvas.width - sampleSize, neckX - sampleSize / 2));
    const startY = Math.max(0, Math.min(ctx.canvas.height - sampleSize, neckY - sampleSize / 2));

    const imgData = ctx.getImageData(startX, startY, sampleSize, sampleSize);
    const data = imgData.data;

    let totalR = 0, totalG = 0, totalB = 0, count = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 100) { // ignore transparent
        totalR += data[i];
        totalG += data[i + 1];
        totalB += data[i + 2];
        count++;
      }
    }

    if (count === 0) return { avgR: 200, avgG: 170, avgB: 140, brightness: 0.7, warmthRatio: 1.2 };

    const avgR = totalR / count;
    const avgG = totalG / count;
    const avgB = totalB / count;

    const brightness = (0.299 * avgR + 0.587 * avgG + 0.114 * avgB) / 255;
    const warmthRatio = avgR / (avgB + 1);

    return { avgR, avgG, avgB, brightness, warmthRatio };
  } catch (e) {
    return { avgR: 200, avgG: 170, avgB: 140, brightness: 0.7, warmthRatio: 1.2 };
  }
}

/**
 * 3D Neck Curve Warping & Realistic Rendering
 */
export function drawWarpedJewelleryWithRealism(ctx, rawImg, transform, options = {}, skinEnv = {}) {
  if (!rawImg || !transform) return;

  const img = getTransparentJewelleryCanvas(rawImg) || rawImg;

  const {
    curveDepth = 0.5,
    lightingMatch = 0.7,
    shadowDepth = 0.6,
    opacity = 1.0
  } = options;

  const {
    x, y,
    scaleX = 1.0, scaleY = 1.0,
    angle = 0,
    yaw = 0
  } = transform;

  const imgWidth = img.width || img.naturalWidth || 200;
  const imgHeight = img.height || img.naturalHeight || 200;
  const renderWidth = imgWidth * scaleX * 0.55;
  const renderHeight = imgHeight * scaleY * 0.55;

  const slices = 18;
  const sliceWidth = renderWidth / slices;
  const origSliceWidth = imgWidth / slices;

  ctx.save();
  ctx.globalAlpha = opacity;

  // Center coordinate system at neck anchor
  ctx.translate(x, y);
  ctx.rotate(angle);

  // STAGE 1: Soft Directional Skin Contact Shadow
  if (shadowDepth > 0.05) {
    ctx.save();
    ctx.globalAlpha = opacity * shadowDepth * 0.5;
    ctx.shadowColor = `rgba(${Math.round((skinEnv.avgR || 200) * 0.15)}, ${Math.round((skinEnv.avgG || 170) * 0.1)}, 0, 0.8)`;
    ctx.shadowBlur = 16 + shadowDepth * 10;
    ctx.shadowOffsetY = 6 + shadowDepth * 6;

    ctx.drawImage(img, -renderWidth / 2, -renderHeight / 2, renderWidth, renderHeight);
    ctx.restore();
  }

  // STAGE 2: Color Temperature & Room Lighting Matching Pass
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = imgWidth;
  tempCanvas.height = imgHeight;
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.drawImage(img, 0, 0);

  if (lightingMatch > 0.05 && skinEnv.brightness) {
    try {
      const imgData = tempCtx.getImageData(0, 0, imgWidth, imgHeight);
      const data = imgData.data;

      const targetLum = Math.max(0.4, Math.min(1.2, skinEnv.brightness / 0.65));
      const warmthMult = Math.max(0.85, Math.min(1.25, (skinEnv.warmthRatio || 1.2) / 1.15));
      const blendFactor = lightingMatch * 0.4;

      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] > 10) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          let newR = r * ((1 - blendFactor) + blendFactor * targetLum * warmthMult);
          let newG = g * ((1 - blendFactor) + blendFactor * targetLum);
          let newB = b * ((1 - blendFactor) + blendFactor * targetLum / warmthMult);

          data[i] = Math.max(0, Math.min(255, newR));
          data[i + 1] = Math.max(0, Math.min(255, newG));
          data[i + 2] = Math.max(0, Math.min(255, newB));
        }
      }
      tempCtx.putImageData(imgData, 0, 0);
    } catch (e) {
      // ignore
    }
  }

  // STAGE 3: 3D Parabolic Cylindrical Neck Curve Rendering
  const halfSlices = slices / 2;
  for (let i = 0; i < slices; i++) {
    const normalizedPos = (i - halfSlices) / halfSlices;
    const curveOffset = Math.pow(normalizedPos, 2) * (renderHeight * 0.12) * curveDepth;
    const slicePerspectiveScale = 1 - (normalizedPos * yaw * 0.2);

    const sliceX = -renderWidth / 2 + i * sliceWidth;
    const sliceY = -renderHeight / 2 + curveOffset;

    ctx.drawImage(
      tempCanvas,
      i * origSliceWidth, 0, origSliceWidth, imgHeight,
      sliceX, sliceY, sliceWidth * 1.02, renderHeight * slicePerspectiveScale
    );
  }

  ctx.restore();
}
