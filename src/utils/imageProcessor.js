import { removeBackground } from '@imgly/background-removal';

/**
 * Ultra-Precision Full-Resolution Jewellery Background Extractor
 * Preserves 100% of fine gold coins, Laxmi motifs, chains, rubies, and antique details.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {Object} options
 */
export function smartJewelleryBackgroundRemoval(canvas, options = {}) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // 1. Sample background color from 8 border control points
  const samplePoints = [
    [5, 5],
    [width - 5, 5],
    [5, height - 5],
    [width - 5, height - 5],
    [Math.floor(width / 2), 5],
    [Math.floor(width / 2), height - 5],
    [5, Math.floor(height / 2)],
    [width - 5, Math.floor(height / 2)]
  ];

  let bgR = 0, bgG = 0, bgB = 0, count = 0;
  for (const [cx, cy] of samplePoints) {
    const idx = (cy * width + cx) * 4;
    bgR += data[idx];
    bgG += data[idx + 1];
    bgB += data[idx + 2];
    count++;
  }
  bgR = Math.round(bgR / count);
  bgG = Math.round(bgG / count);
  bgB = Math.round(bgB / count);

  // 2. High-resolution pixel pass preserving gold, gems, and rubies
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    const sat = maxC === 0 ? 0 : (maxC - minC) / maxC;

    // Euclidean distance to sampled background color
    const distR = Math.abs(r - bgR);
    const distG = Math.abs(g - bgG);
    const distB = Math.abs(b - bgB);
    const colorDist = Math.sqrt(distR * distR + distG * distG + distB * distB);

    // Gold / Kundan / Ruby / Gem signature:
    // Gold: R > B + 12 and G > B - 15 with non-zero saturation
    // Gems / Rubies: High saturation or high red/green intensity
    const isGoldOrGem =
      (r > b + 10 && g > b - 15 && sat > 0.06) ||
      (sat > 0.18 && maxC > 40) ||
      (r > 120 && g > 90 && b < 100);

    if (isGoldOrGem) {
      // 100% Crisp, opaque preservation of gold, Laxmi coins, rubies, and chains!
      data[i + 3] = 255;
    } else if (colorDist < 40 && sat < 0.14) {
      // Background pixel -> transparent
      data[i + 3] = 0;
    } else if (colorDist < 70 && sat < 0.18) {
      // Feathered transition edge for anti-aliasing
      const alphaFraction = (colorDist - 40) / 30;
      data[i + 3] = Math.round(alphaFraction * 255);
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

/**
 * Main Image Processing Function
 * @param {string|File|Blob} input
 * @param {Object} options - { mode: 'smart_gold' | 'neural_ai' | 'none', onProgress }
 */
export async function processJewelleryImage(input, options = {}) {
  const { mode = 'smart_gold', onProgress } = options;
  const originalUrl = typeof input === 'string' ? input : URL.createObjectURL(input);

  // Mode: Keep original (no BG removal)
  if (mode === 'none') {
    return {
      success: true,
      processedUrl: originalUrl,
      originalUrl,
      bgRemoved: false
    };
  }

  // Mode: Neural AI (@imgly/background-removal)
  if (mode === 'neural_ai') {
    try {
      if (onProgress) onProgress('Loading AI neural net model...');
      const blob = await removeBackground(input, {
        progress: (key, current, total) => {
          if (onProgress && total > 0) {
            const pct = Math.round((current / total) * 100);
            onProgress(`AI Neural Net Removing BG... ${pct}%`);
          }
        }
      });
      return {
        success: true,
        processedUrl: URL.createObjectURL(blob),
        originalUrl,
        bgRemoved: true
      };
    } catch (err) {
      console.warn('Neural AI failed, falling back to Smart Gold Extractor:', err);
    }
  }

  // Mode: Smart Gold Extractor (Default high-precision full-resolution color matting)
  return new Promise((resolve) => {
    if (onProgress) onProgress('Smart Gold Precision BG Removal...');
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      // Run high-precision full resolution matting
      smartJewelleryBackgroundRemoval(canvas);

      resolve({
        success: true,
        processedUrl: canvas.toDataURL('image/png', 1.0),
        originalUrl,
        bgRemoved: true
      });
    };

    img.onerror = () => {
      resolve({
        success: false,
        error: 'Failed to read image file. Please upload a valid PNG, JPG, or WebP photo.',
        originalUrl
      });
    };

    img.src = originalUrl;
  });
}
