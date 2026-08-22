/**
 * AI Realism Engine for Photorealistic Jewellery Try-On
 * Runs 100% client-side in browser ($0 cost) using WebGL / HTML5 Canvas Matting.
 */

/**
 * Samples ambient color temperature, luminance, and contrast from user's skin/neck region
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} neckX
 * @param {number} neckY
 * @returns {Object} { avgR, avgG, avgB, brightness, warmthRatio, contrast }
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
 * 3D Neck Curve Warping: Distorts jewellery along a cylindrical grid to conform naturally to the curve of the neck/collarbones.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLImageElement} img
 * @param {Object} transform - { x, y, scaleX, scaleY, angle, yaw, pitch, roll }
 * @param {Object} options - { curveDepth, lightingMatch, shadowDepth, opacity }
 * @param {Object} skinEnv - Ambient skin environment sample
 */
export function drawWarpedJewelleryWithRealism(ctx, img, transform, options = {}, skinEnv = {}) {
  if (!img || !transform) return;

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

  const imgWidth = img.naturalWidth || img.width || 200;
  const imgHeight = img.naturalHeight || img.height || 200;
  const renderWidth = imgWidth * scaleX * 0.68;
  const renderHeight = imgHeight * scaleY * 0.68;

  const slices = 18; // 18 vertical slices for smooth cylindrical warping
  const sliceWidth = renderWidth / slices;
  const origSliceWidth = imgWidth / slices;

  ctx.save();
  ctx.globalAlpha = opacity;

  // Center coordinate system at neck anchor
  ctx.translate(x, y);
  ctx.rotate(angle);

  // --- STAGE 1: Soft Directional Skin Contact Shadow Synthesis ---
  if (shadowDepth > 0.05) {
    ctx.save();
    ctx.globalAlpha = opacity * shadowDepth * 0.55;
    ctx.shadowColor = `rgba(${Math.round(skinEnv.avgR * 0.2 || 20)}, ${Math.round(skinEnv.avgG * 0.1 || 10)}, 0, 0.85)`;
    ctx.shadowBlur = 18 + shadowDepth * 12;
    ctx.shadowOffsetY = 8 + shadowDepth * 8;

    ctx.drawImage(img, -renderWidth / 2, -renderHeight / 2, renderWidth, renderHeight);
    ctx.restore();
  }

  // --- STAGE 2: 3D Cylindrical Neck Curve Warping & Lighting Harmonization ---
  // Create offscreen canvas for color matched jewellery
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = imgWidth;
  tempCanvas.height = imgHeight;
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.drawImage(img, 0, 0);

  // Ambient Lighting & Color Temperature Harmonization Pass
  if (lightingMatch > 0.05 && skinEnv.brightness) {
    const imgData = tempCtx.getImageData(0, 0, imgWidth, imgHeight);
    const data = imgData.data;

    // Target brightness & warmth from user's skin photo
    const targetLum = Math.max(0.4, Math.min(1.2, skinEnv.brightness / 0.65));
    const warmthMult = Math.max(0.85, Math.min(1.25, skinEnv.warmthRatio / 1.15));

    const blendFactor = lightingMatch * 0.45;

    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 10) { // Non-transparent pixel
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Apply room brightness matching
        let newR = r * ((1 - blendFactor) + blendFactor * targetLum * warmthMult);
        let newG = g * ((1 - blendFactor) + blendFactor * targetLum);
        let newB = b * ((1 - blendFactor) + blendFactor * targetLum / warmthMult);

        data[i] = Math.max(0, Math.min(255, newR));
        data[i + 1] = Math.max(0, Math.min(255, newG));
        data[i + 2] = Math.max(0, Math.min(255, newB));
      }
    }
    tempCtx.putImageData(imgData, 0, 0);
  }

  // Render 18-slice parabolic warp along neck cylinder
  const halfSlices = slices / 2;
  for (let i = 0; i < slices; i++) {
    // Parabolic neck curve displacement formula
    const normalizedPos = (i - halfSlices) / halfSlices; // -1 to +1
    const curveOffset = Math.pow(normalizedPos, 2) * (renderHeight * 0.15) * curveDepth;

    // 3D Perspective foreshortening based on head yaw
    const slicePerspectiveScale = 1 - (normalizedPos * yaw * 0.2);

    const sliceX = -renderWidth / 2 + i * sliceWidth;
    const sliceY = -renderHeight / 2 + curveOffset;

    ctx.drawImage(
      tempCanvas,
      i * origSliceWidth, 0, origSliceWidth, imgHeight,
      sliceX, sliceY, sliceWidth * 1.02, renderHeight * slicePerspectiveScale
    );
  }

  // --- STAGE 3: Ambient Skin Reflective Highlight ---
  if (skinEnv.avgR) {
    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    ctx.globalAlpha = opacity * 0.18 * lightingMatch;
    ctx.fillStyle = `rgb(${Math.round(skinEnv.avgR)}, ${Math.round(skinEnv.avgG)}, ${Math.round(skinEnv.avgB)})`;
    ctx.fillRect(-renderWidth / 2, -renderHeight / 2, renderWidth, renderHeight);
    ctx.restore();
  }

  ctx.restore();
}
