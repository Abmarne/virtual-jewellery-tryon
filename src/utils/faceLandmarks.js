// 3D AI Face Mesh Landmark Geometry, Pose Estimation & Perspective Calculators

/**
 * Calculates 3D transform (x, y, scaleX, scaleY, angle, yaw, pitch, roll, shadowOffset)
 * @param {Array} landmarks - 468 3D landmark points from MediaPipe Face Mesh
 * @param {string} category - 'earrings' | 'necklace' | 'maang_tikka' | 'nose_ring'
 * @param {number} canvasWidth - Canvas width in pixels
 * @param {number} canvasHeight - Canvas height in pixels
 * @param {Object} fineTune - Fine tuning offsets { scale, offsetY, tilt, opacity }
 * @param {boolean} isMirrored - True if webcam mode (selfie camera)
 */
export function calculateJewelleryTransform(
  landmarks,
  category,
  canvasWidth,
  canvasHeight,
  fineTune = {},
  isMirrored = false
) {
  if (!landmarks || landmarks.length < 400) {
    return getFallbackTransform(category, canvasWidth, canvasHeight, fineTune);
  }

  const { scale: userScale = 1.0, offsetY: userOffsetY = 0, tilt: userTilt = 0 } = fineTune;

  // Helper to get 3D coords for a landmark index with mirror support
  const getPoint = (idx) => {
    const lm = landmarks[idx];
    const rawX = isMirrored ? (1 - lm.x) : lm.x;
    return {
      x: rawX * canvasWidth,
      y: lm.y * canvasHeight,
      z: (lm.z || 0) * canvasWidth // Z-depth in canvas pixel units
    };
  };

  // 1. Key Facial Reference Points
  const noseTip = getPoint(4);
  const foreheadTop = getPoint(10);
  const chin = getPoint(152);
  let leftEar = getPoint(177);  // Earlobe Left
  let rightEar = getPoint(401); // Earlobe Right
  let leftJaw = getPoint(172);
  let rightJaw = getPoint(397);

  if (isMirrored) {
    const tempEar = leftEar;
    leftEar = rightEar;
    rightEar = tempEar;

    const tempJaw = leftJaw;
    leftJaw = rightJaw;
    rightJaw = tempJaw;
  }

  // 2. Compute 3D Head Orientation (Yaw, Pitch, Roll)
  const dxEars = rightEar.x - leftEar.x;
  const dyEars = rightEar.y - leftEar.y;
  const dzEars = rightEar.z - leftEar.z;

  const roll = Math.atan2(dyEars, dxEars) + (userTilt * Math.PI / 180);
  const earDistance = Math.hypot(dxEars, dyEars);

  // Head Yaw (turn left/right)
  const faceCenterX = (leftEar.x + rightEar.x) / 2;
  const yaw = Math.sin((noseTip.x - faceCenterX) / (earDistance / 2));

  // Head Pitch (tilt up/down)
  const faceHeight = Math.hypot(chin.x - foreheadTop.x, chin.y - foreheadTop.y);
  const pitch = Math.sin((noseTip.y - ((foreheadTop.y + chin.y) / 2)) / (faceHeight / 2));

  // Perspective 3D Scale Factors
  const cosYaw = Math.max(0.4, Math.cos(yaw));
  const cosPitch = Math.max(0.5, Math.cos(pitch));

  const yShift = userOffsetY * (canvasHeight * 0.008);

  // 3. Category Specific 3D Perspective Anchoring

  if (category === 'earrings') {
    const baseScale = (earDistance / 175) * userScale;

    // Perspective depth offset: Far ear shrinks & hides behind jaw, near ear enlarges
    const leftScale = baseScale * (1 - yaw * 0.35);
    const rightScale = baseScale * (1 + yaw * 0.35);

    // Natural vertical drop below earlobes
    const earDropY = (faceHeight * 0.04);

    return {
      type: 'pair',
      yaw,
      pitch,
      roll,
      left: {
        x: leftEar.x - (yaw * 12),
        y: leftEar.y + earDropY + yShift,
        scaleX: leftScale * cosYaw,
        scaleY: leftScale * cosPitch,
        angle: roll,
        shadowBlur: 14 * leftScale,
        shadowOffsetY: 8 * leftScale
      },
      right: {
        x: rightEar.x - (yaw * 12),
        y: rightEar.y + earDropY + yShift,
        scaleX: rightScale * cosYaw,
        scaleY: rightScale * cosPitch,
        angle: roll,
        shadowBlur: 14 * rightScale,
        shadowOffsetY: 8 * rightScale
      },
      scale: baseScale
    };
  }

  if (category === 'necklace') {
    const jawWidth = Math.hypot(rightJaw.x - leftJaw.x, rightJaw.y - leftJaw.y);
    const baseScale = (jawWidth / 130) * userScale;

    // Position necklace curved below chin base on upper collarbone
    const necklaceX = chin.x;
    const necklaceY = chin.y + (jawWidth * 0.24) + (pitch * 25) + yShift;

    return {
      type: 'single',
      x: necklaceX,
      y: necklaceY,
      scaleX: baseScale * cosYaw,
      scaleY: baseScale * cosPitch,
      angle: roll,
      yaw,
      pitch,
      roll,
      shadowBlur: 18 * baseScale,
      shadowOffsetY: 10 * baseScale
    };
  }

  if (category === 'maang_tikka') {
    const tikkaX = foreheadTop.x;
    const tikkaY = foreheadTop.y + (pitch * 15) + yShift;
    const baseScale = (faceHeight / 190) * userScale;

    return {
      type: 'single',
      x: tikkaX,
      y: tikkaY,
      scaleX: baseScale * cosYaw,
      scaleY: baseScale * cosPitch,
      angle: roll,
      yaw,
      pitch,
      roll,
      shadowBlur: 10 * baseScale,
      shadowOffsetY: 5 * baseScale
    };
  }

  if (category === 'nose_ring') {
    let nostril = getPoint(242); // Left nostril
    let rightNostril = getPoint(462);

    if (isMirrored) {
      nostril = rightNostril;
    }

    const noseWidth = Math.hypot(rightNostril.x - nostril.x, rightNostril.y - nostril.y);
    const baseScale = (Math.max(noseWidth, 16) / 22) * userScale;

    const nathX = nostril.x;
    const nathY = nostril.y + yShift;

    return {
      type: 'single',
      x: nathX,
      y: nathY,
      scaleX: baseScale * cosYaw,
      scaleY: baseScale * cosPitch,
      angle: roll,
      yaw,
      pitch,
      roll,
      shadowBlur: 8 * baseScale,
      shadowOffsetY: 4 * baseScale
    };
  }

  return getFallbackTransform(category, canvasWidth, canvasHeight, fineTune);
}

function getFallbackTransform(category, width, height, fineTune = {}) {
  const { scale = 1.0, offsetY = 0, tilt = 0 } = fineTune;
  const rad = (tilt * Math.PI) / 180;

  if (category === 'earrings') {
    return {
      type: 'pair',
      left: { x: width * 0.38, y: height * 0.48 + offsetY, scaleX: 0.9 * scale, scaleY: 0.9 * scale, angle: rad, shadowBlur: 10, shadowOffsetY: 6 },
      right: { x: width * 0.62, y: height * 0.48 + offsetY, scaleX: 0.9 * scale, scaleY: 0.9 * scale, angle: rad, shadowBlur: 10, shadowOffsetY: 6 },
      scale: 0.9 * scale
    };
  }
  if (category === 'necklace') {
    return {
      type: 'single',
      x: width * 0.50,
      y: height * 0.72 + offsetY,
      scaleX: 1.0 * scale,
      scaleY: 1.0 * scale,
      angle: rad,
      shadowBlur: 14,
      shadowOffsetY: 8
    };
  }
  if (category === 'maang_tikka') {
    return {
      type: 'single',
      x: width * 0.50,
      y: height * 0.24 + offsetY,
      scaleX: 1.0 * scale,
      scaleY: 1.0 * scale,
      angle: rad,
      shadowBlur: 8,
      shadowOffsetY: 4
    };
  }
  if (category === 'nose_ring') {
    return {
      type: 'single',
      x: width * 0.44,
      y: height * 0.52 + offsetY,
      scaleX: 0.9 * scale,
      scaleY: 0.9 * scale,
      angle: rad,
      shadowBlur: 6,
      shadowOffsetY: 3
    };
  }

  return { type: 'single', x: width * 0.5, y: height * 0.5, scaleX: 1.0, scaleY: 1.0, angle: 0 };
}
