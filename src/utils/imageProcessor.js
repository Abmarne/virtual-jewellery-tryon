// High-Fidelity Image Processing Engine (Format Conversion & Sensitivity-Controlled BG Removal)

/**
 * Process uploaded jewellery image with custom tolerance parameter
 * @param {string|File} input - File or Data URL
 * @param {Object} options - { removeBg: true, tolerance: 35, maxDim: 2400 }
 */
export async function processJewelleryImage(input, options = {}) {
  const { removeBg = true, tolerance = 35, maxDim = 2400 } = options;

  return new Promise((resolve) => {
    const dataUrl = typeof input === 'string' ? input : URL.createObjectURL(input);
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width < 30 || height < 30) {
          resolve({
            success: false,
            error: 'Image resolution is too low (< 30px). Please upload a clearer photo.',
            originalUrl: dataUrl
          });
          return;
        }

        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw crisp original image
        ctx.drawImage(img, 0, 0, width, height);

        let bgRemoved = false;

        if (removeBg && !hasExistingAlphaTransparency(ctx, width, height)) {
          bgRemoved = removeBackgroundSmooth(ctx, width, height, tolerance);
        }

        const processedUrl = canvas.toDataURL('image/png', 1.0);

        resolve({
          success: true,
          processedUrl,
          originalUrl: dataUrl,
          bgRemoved
        });
      } catch (err) {
        console.error('Error processing image:', err);
        resolve({
          success: false,
          error: 'Failed to process image file.',
          originalUrl: dataUrl
        });
      }
    };

    img.onerror = () => {
      resolve({
        success: false,
        error: 'Failed to read image file. Please upload a valid image (PNG, JPG, WebP).',
        originalUrl: dataUrl
      });
    };

    img.src = dataUrl;
  });
}

function hasExistingAlphaTransparency(ctx, width, height) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  let transparentCount = 0;

  const step = Math.max(1, Math.floor(data.length / (4 * 200)));
  for (let i = 3; i < data.length; i += step * 4) {
    if (data[i] < 200) {
      transparentCount++;
    }
  }

  return transparentCount > 15;
}

/**
 * Parametric Background Removal with Custom Sensitivity Tolerance
 */
function removeBackgroundSmooth(ctx, width, height, tolerance = 35) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Sample corner pixel palette
  const corners = [
    getPixel(data, 0, 0, width),
    getPixel(data, width - 1, 0, width),
    getPixel(data, 0, height - 1, width),
    getPixel(data, width - 1, height - 1, width)
  ];

  let avgR = 0, avgG = 0, avgB = 0;
  corners.forEach(c => {
    avgR += c.r;
    avgG += c.g;
    avgB += c.b;
  });
  avgR = Math.round(avgR / corners.length);
  avgG = Math.round(avgG / corners.length);
  avgB = Math.round(avgB / corners.length);

  let pixelsRemoved = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const dist = Math.hypot(r - avgR, g - avgG, b - avgB);

    if (dist < tolerance) {
      data[i + 3] = 0;
      pixelsRemoved++;
    } else if (dist < tolerance + 16) {
      const factor = (dist - tolerance) / 16;
      data[i + 3] = Math.round(data[i + 3] * factor);
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return pixelsRemoved > (data.length / 4) * 0.03;
}

function getPixel(data, x, y, width) {
  const index = (y * width + x) * 4;
  return {
    r: data[index],
    g: data[index + 1],
    b: data[index + 2],
    a: data[index + 3]
  };
}
