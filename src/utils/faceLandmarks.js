// AI Face Mesh Landmark Geometry & Position Calculators for Jewellery Overlay

/**
 * Calculates transform (x, y, scale, angleInRadians) for selected jewellery category
 * @param {Array} landmarks - 468 3D landmark points from MediaPipe Face Mesh [{x, y, z}, ...]
 * @param {string} category - 'earrings' | 'necklace' | 'maang_tikka' | 'nose_ring'
 * @param {number} canvasWidth - Canvas width in pixels
 * @param {number} canvasHeight - Canvas height in pixels
 * @param {Object} fineTune - Fine tuning offsets { scale, offsetY, opacity, tilt }
 */
export function calculateJewelleryTransform(landmarks, category, canvasWidth, canvasHeight, fineTune = {}) {
  if (!landmarks || landmarks.length < 400) {
    // Fallback default positioning if no face landmarks detected yet
    return getFallbackTransform(category, canvasWidth, canvasHeight, fineTune);
  }

  const { scale: userScale = 1.0, offsetY: userOffsetY = 0, tilt: userTilt = 0 } = fineTune;

  // Helper to get pixel coords for a landmark index
  const getPoint = (idx) => ({
    x: landmarks[idx].x * canvasWidth,
    y: landmarks[idx].y * canvasHeight,
    z: landmarks[idx].z || 0
  });

  if (category === 'earrings') {
    // Left earlobe: index 177 / 234, Right earlobe: index 401 / 454
    const leftEar = getPoint(177);
    const rightEar = getPoint(401);

    // Distance between ears
    const dx = rightEar.x - leftEar.x;
    const dy = rightEar.y - leftEar.y;
    const earDistance = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx) + (userTilt * Math.PI / 180);

    // Center point between ears
    const centerX = (leftEar.x + rightEar.x) / 2;
    const centerY = (leftEar.y + rightEar.y) / 2 + (userOffsetY * canvasHeight * 0.01);

    // Base scale proportional to head width
    const baseScale = (earDistance / 180) * userScale;

    return {
      type: 'pair',
      left: {
        x: leftEar.x,
        y: leftEar.y + (userOffsetY * canvasHeight * 0.01),
        scale: baseScale,
        angle: angle
      },
      right: {
        x: rightEar.x,
        y: rightEar.y + (userOffsetY * canvasHeight * 0.01),
        scale: baseScale,
        angle: angle
      },
      center: { x: centerX, y: centerY },
      scale: baseScale,
      angle
    };
  } 
  
  if (category === 'necklace') {
    // Chin bottom: 152, Neck/throat: 200, Jaw corners: 172 & 397
    const chin = getPoint(152);
    const leftJaw = getPoint(172);
    const rightJaw = getPoint(397);

    const jawWidth = Math.hypot(rightJaw.x - leftJaw.x, rightJaw.y - leftJaw.y);
    const angle = Math.atan2(rightJaw.y - leftJaw.y, rightJaw.x - leftJaw.x) + (userTilt * Math.PI / 180);

    // Position necklace slightly below chin bottom
    const necklaceX = chin.x;
    const necklaceY = chin.y + (jawWidth * 0.22) + (userOffsetY * canvasHeight * 0.01);

    const baseScale = (jawWidth / 140) * userScale;

    return {
      type: 'single',
      x: necklaceX,
      y: necklaceY,
      scale: baseScale,
      angle: angle
    };
  }

  if (category === 'maang_tikka') {
    // Forehead hairline center: 10, Mid forehead: 151, Nose bridge: 9
    const foreheadTop = getPoint(10);
    const foreheadMid = getPoint(151);
    const noseBridge = getPoint(9);

    const headHeight = Math.hypot(noseBridge.x - foreheadTop.x, noseBridge.y - foreheadTop.y);
    const angle = Math.atan2(noseBridge.y - foreheadTop.y, noseBridge.x - foreheadTop.x) - (Math.PI / 2) + (userTilt * Math.PI / 180);

    // Position at top of forehead cascading down
    const tikkaX = foreheadTop.x;
    const tikkaY = foreheadTop.y + (userOffsetY * canvasHeight * 0.01);

    const baseScale = (headHeight / 70) * userScale;

    return {
      type: 'single',
      x: tikkaX,
      y: tikkaY,
      scale: baseScale,
      angle: angle
    };
  }

  if (category === 'nose_ring') {
    // Left nostril: 242, Right nostril: 462, Nose tip: 4
    const leftNostril = getPoint(242);
    const rightNostril = getPoint(462);
    const noseTip = getPoint(4);

    const noseWidth = Math.hypot(rightNostril.x - leftNostril.x, rightNostril.y - leftNostril.y);
    const angle = Math.atan2(rightNostril.y - leftNostril.y, rightNostril.x - leftNostril.x) + (userTilt * Math.PI / 180);

    // Position on left nostril by default
    const nathX = leftNostril.x;
    const nathY = leftNostril.y + (userOffsetY * canvasHeight * 0.01);

    const baseScale = (Math.max(noseWidth, 20) / 25) * userScale;

    return {
      type: 'single',
      x: nathX,
      y: nathY,
      scale: baseScale,
      angle: angle
    };
  }

  return getFallbackTransform(category, canvasWidth, canvasHeight, fineTune);
}

// Fallback transform if AI scan is initializing or face is partially obscured
function getFallbackTransform(category, width, height, fineTune = {}) {
  const { scale = 1.0, offsetY = 0, tilt = 0 } = fineTune;
  const rad = (tilt * Math.PI) / 180;

  if (category === 'earrings') {
    return {
      type: 'pair',
      left: { x: width * 0.38, y: height * 0.48 + offsetY, scale: 0.9 * scale, angle: rad },
      right: { x: width * 0.62, y: height * 0.48 + offsetY, scale: 0.9 * scale, angle: rad },
      scale: 0.9 * scale,
      angle: rad
    };
  }
  if (category === 'necklace') {
    return {
      type: 'single',
      x: width * 0.50,
      y: height * 0.72 + offsetY,
      scale: 1.0 * scale,
      angle: rad
    };
  }
  if (category === 'maang_tikka') {
    return {
      type: 'single',
      x: width * 0.50,
      y: height * 0.24 + offsetY,
      scale: 1.0 * scale,
      angle: rad
    };
  }
  if (category === 'nose_ring') {
    return {
      type: 'single',
      x: width * 0.44,
      y: height * 0.52 + offsetY,
      scale: 0.9 * scale,
      angle: rad
    };
  }

  return { type: 'single', x: width * 0.5, y: height * 0.5, scale: 1.0, angle: 0 };
}
