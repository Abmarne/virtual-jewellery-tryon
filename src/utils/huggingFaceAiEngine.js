/**
 * AI Realism Engine for High-Fidelity Jewellery Try-On
 * Preserves 100% exact user photo and 100% exact jewellery design.
 * Composites the jewellery seamlessly with 3D landmark tracking, curve warping,
 * contact shadow synthesis, and room lighting harmonization.
 */

import { calculateJewelleryTransform } from './faceLandmarks';
import { drawWarpedJewelleryWithRealism, sampleSkinEnvironment } from './aiRealismEngine';

/**
 * Check if API is configured (always true for high-fidelity landmark engine)
 */
export function isApiKeyConfigured() {
  return true;
}

/**
 * Dynamically loads MediaPipe FaceMesh
 */
async function loadFaceMesh() {
  if (window.FaceMesh) return window.FaceMesh;
  if (!window.FaceMesh && !window.facemesh) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js';
    script.async = true;
    document.head.appendChild(script);
    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
    });
  }
  return window.FaceMesh;
}

/**
 * Detects 3D facial landmarks on an image using MediaPipe
 */
async function detectLandmarksOnImage(img) {
  try {
    const FaceMeshClass = await loadFaceMesh();
    if (!FaceMeshClass) return null;

    return new Promise((resolve) => {
      let resolved = false;
      const fm = new FaceMeshClass({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      });
      fm.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(null);
        }
      }, 3500);

      fm.onResults((results) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            resolve(results.multiFaceLandmarks[0]);
          } else {
            resolve(null);
          }
        }
      });

      fm.send({ image: img }).catch((e) => {
        console.warn('FaceMesh send warning:', e);
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          resolve(null);
        }
      });
    });
  } catch (err) {
    console.warn('Landmark detection warning:', err);
    return null;
  }
}

/**
 * Main AI Try-On Generation function
 * Preserves exact user photo and exact jewellery item with realistic physics.
 * 
 * @param {Object} params - { personImg, jewelleryImg, category, item }
 * @param {Function} onProgress - Progress callback (msg) => void
 * @returns {Promise<string>} - Data URL of the composite result image
 */
export async function generateHuggingFaceTryOn(params, onProgress) {
  const { personImg, jewelleryImg, category, item } = params;

  if (!personImg) {
    throw { type: 'input', title: 'Missing Photo', message: 'Please upload your photo first.', retryable: false };
  }
  if (!jewelleryImg) {
    throw { type: 'input', title: 'Missing Design', message: 'Please select a jewellery design first.', retryable: false };
  }

  onProgress?.('Analyzing your photo & facial structure...');

  const width = personImg.naturalWidth || personImg.width || 1280;
  const height = personImg.naturalHeight || personImg.height || 960;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Step 1: Draw the EXACT user portrait photo as the base layer (100% untouched)
  ctx.drawImage(personImg, 0, 0, width, height);

  onProgress?.('Calculating 3D face & neck landmarks...');

  // Step 2: Detect 3D landmarks for anatomical accuracy
  const landmarks = await detectLandmarksOnImage(personImg);

  onProgress?.('Matching room lighting & skin tone...');

  // Step 3: Compute exact 3D transform positioning for jewellery category
  const jewelleryCategory = (category || item?.category || 'necklace').toLowerCase();
  const transform = calculateJewelleryTransform(landmarks, jewelleryCategory, width, height, { scale: 1.0, offsetY: 0, tilt: 0 }, false);

  // Step 4: Sample ambient skin environment
  const neckX = transform.type === 'pair' ? transform.left.x : transform.x;
  const neckY = transform.type === 'pair' ? transform.left.y : transform.y;
  const skinEnv = sampleSkinEnvironment(ctx, neckX, neckY);

  onProgress?.('Applying 3D curve warping & contact shadows...');

  // Step 5: Render the EXACT jewellery piece with photorealistic blending
  if (transform.type === 'pair') {
    drawWarpedJewelleryWithRealism(ctx, jewelleryImg, transform.left, { curveDepth: 0.35, lightingMatch: 0.65, shadowDepth: 0.6 }, skinEnv);
    drawWarpedJewelleryWithRealism(ctx, jewelleryImg, transform.right, { curveDepth: 0.35, lightingMatch: 0.65, shadowDepth: 0.6 }, skinEnv);
  } else {
    drawWarpedJewelleryWithRealism(ctx, jewelleryImg, transform, { curveDepth: 0.5, lightingMatch: 0.7, shadowDepth: 0.65 }, skinEnv);
  }

  onProgress?.('Finalizing photorealistic output...');

  await new Promise((r) => setTimeout(r, 300));

  const dataUrl = canvas.toDataURL('image/png', 1.0);
  onProgress?.('Complete!');

  return dataUrl;
}
