// 3D AI Face Mesh Landmark Geometry, Pose Estimation & Realistic Body Anchoring

/**
 * Calculates realistic 3D transform for wearing jewellery naturally on skin
 * @param {Array} landmarks - 468 3D landmark points from MediaPipe Face Mesh
 * @param {string} category - 'earrings' | 'necklace' | 'maang_tikka' | 'nose_ring'
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 * @param {Object} fineTune - Fine tuning offsets { scale, offsetY, tilt, opacity }
 * @param {boolean} isMirrored - True if selfie camera mode
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

  // Helper to retrieve 3D coordinates in canvas pixel space
  const getPoint = (idx) => {
    const lm = landmarks[idx];
    const rawX = isMirrored ? (1 - lm.x) : lm.x;
    return {
      x: rawX * canvasWidth,
      y: lm.y * canvasHeight,
      z: (lm.z || 0) * canvasWidth
    };
  };

  // Key Facial & Structural Landmarks
  const noseTip = getPoint(4);
  const foreheadTop = getPoint(10);
  const chin = getPoint(152);
  let leftEar = getPoint(177);  // Left Earlobe
  let rightEar = getPoint(401); // Right Earlobe
  let leftJaw = getPoint(172);  // Left Jawline
  let rightJaw = getPoint(397); // Right Jawline

  if (isMirrored) {
    const tempEar = leftEar;
    leftEar = rightEar;
    rightEar = tempEar;

    const tempJaw = leftJaw;
    leftJaw = rightJaw;
    rightJaw = tempJaw;
  }

  // 1. 3D Pose Angles (Roll, Yaw, Pitch)
  const dxEars = rightEar.x - leftEar.x;
  const dyEars = rightEar.y - leftEar.y;
  const roll = Math.atan2(dyEars, dxEars) + (userTilt * Math.PI / 180);

  const earDistance = Math.hypot(dxEars, dyEars);
  const faceHeight = Math.hypot(chin.x - foreheadTop.x, chin.y - foreheadTop.y);

  // Yaw: Left/Right head turn (-1 to +1)
  const faceCenterX = (leftEar.x + rightEar.x) / 2;
  const yaw = Math.sin((noseTip.x - faceCenterX) / (earDistance / 2));

  // Pitch: Up/Down head tilt (-1 to +1)
  const faceCenterY = (foreheadTop.y + chin.y) / 2;
  const pitch = Math.sin((noseTip.y - faceCenterY) / (faceHeight / 2));

  // 3D Perspective Scale Compressions
  const cosYaw = Math.max(0.45, Math.cos(yaw));
  const cosPitch = Math.max(0.55, Math.cos(pitch));

  const yShift = userOffsetY * (canvasHeight * 0.008);

  // 2. Realistic Anchoring by Jewellery Category

  if (category === 'necklace') {
    const jawWidth = Math.hypot(rightJaw.x - leftJaw.x, rightJaw.y - leftJaw.y);
    const baseScale = (jawWidth / 210) * userScale;

    // ANATOMICAL NECK FIT:
    // Necklaces rest right below the chin line at upper collarbones (chin.y + 0.15 * faceHeight)
    const neckCenterX = chin.x + (yaw * jawWidth * 0.1) + (fineTune.offsetX || 0);
    const necklaceY = chin.y + (faceHeight * 0.15) + (pitch * faceHeight * 0.05) + yShift;

    return {
      type: 'single',
      x: neckCenterX,
      y: necklaceY,
      scaleX: baseScale * cosYaw,
      scaleY: baseScale * cosPitch,
      angle: roll * 0.75,
      yaw,
      pitch,
      roll,
      shadowBlur: 14 * baseScale,
      shadowOffsetY: 6 * baseScale,
      contactShadowColor: 'rgba(25, 10, 0, 0.45)'
    };
  }

  if (category === 'earrings') {
    const baseScale = (earDistance / 175) * userScale;

    // Gravity Dangle Effect: Heavy jhumkas hang vertically with damped roll angle
    const jhumkaAngle = roll * 0.4;
    const earDropY = (faceHeight * 0.045);

    const leftYawFactor = 1 - (yaw * 0.45);
    const rightYawFactor = 1 + (yaw * 0.45);

    const leftOpacity = Math.max(0.15, Math.min(1.0, leftYawFactor));
    const rightOpacity = Math.max(0.15, Math.min(1.0, rightYawFactor));

    return {
      type: 'pair',
      yaw,
      pitch,
      roll,
      left: {
        x: leftEar.x - (yaw * 14),
        y: leftEar.y + earDropY + yShift,
        scaleX: baseScale * leftYawFactor * cosYaw,
        scaleY: baseScale * cosPitch,
        angle: jhumkaAngle,
        opacity: leftOpacity,
        shadowBlur: 14 * baseScale,
        shadowOffsetY: 8 * baseScale
      },
      right: {
        x: rightEar.x - (yaw * 14),
        y: rightEar.y + earDropY + yShift,
        scaleX: baseScale * rightYawFactor * cosYaw,
        scaleY: baseScale * cosPitch,
        angle: jhumkaAngle,
        opacity: rightOpacity,
        shadowBlur: 14 * baseScale,
        shadowOffsetY: 8 * baseScale
      },
      scale: baseScale
    };
  }

  if (category === 'maang_tikka') {
    const tikkaX = foreheadTop.x;
    const tikkaY = foreheadTop.y + (pitch * 10) + yShift;
    const baseScale = (faceHeight / 195) * userScale;

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
    let nostril = getPoint(242);
    let rightNostril = getPoint(462);

    if (isMirrored) nostril = rightNostril;

    const noseWidth = Math.hypot(rightNostril.x - nostril.x, rightNostril.y - nostril.y);
    const baseScale = (Math.max(noseWidth, 16) / 22) * userScale;

    return {
      type: 'single',
      x: nostril.x,
      y: nostril.y + yShift,
      scaleX: baseScale * cosYaw,
      scaleY: baseScale * cosPitch,
      angle: roll,
      yaw,
      pitch,
      roll,
      shadowBlur: 6 * baseScale,
      shadowOffsetY: 3 * baseScale
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
      left: { x: width * 0.38, y: height * 0.48 + offsetY, scaleX: 0.9 * scale, scaleY: 0.9 * scale, angle: rad, opacity: 1, shadowBlur: 10, shadowOffsetY: 6 },
      right: { x: width * 0.62, y: height * 0.48 + offsetY, scaleX: 0.9 * scale, scaleY: 0.9 * scale, angle: rad, opacity: 1, shadowBlur: 10, shadowOffsetY: 6 },
      scale: 0.9 * scale
    };
  }
  if (category === 'necklace') {
    return {
      type: 'single',
      x: width * 0.50 + (fineTune.offsetX || 0),
      y: height * 0.52 + offsetY,
      scaleX: 0.42 * scale,
      scaleY: 0.42 * scale,
      angle: rad,
      shadowBlur: 12,
      shadowOffsetY: 6
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
