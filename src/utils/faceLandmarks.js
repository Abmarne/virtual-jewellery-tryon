/**
 * 3D AI Face Mesh Landmark Geometry & Anatomical Jewellery Positioning
 * 
 * Calibrated to produce ChatGPT-quality placement:
 * - Necklaces sit at the base of the neck / upper chest (collarbone line)
 * - Width spans roughly from shoulder-to-shoulder (≈ 1.8x jaw width)
 * - Earrings dangle from earlobes with gravity
 * - Maang tikkas align with forehead center parting
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

  const getPoint = (idx) => {
    const lm = landmarks[idx];
    const rawX = isMirrored ? (1 - lm.x) : lm.x;
    return {
      x: rawX * canvasWidth,
      y: lm.y * canvasHeight,
      z: (lm.z || 0) * canvasWidth
    };
  };

  // Key landmarks
  const noseTip = getPoint(4);
  const foreheadTop = getPoint(10);
  const chin = getPoint(152);
  let leftEar = getPoint(177);
  let rightEar = getPoint(401);
  let leftJaw = getPoint(172);
  let rightJaw = getPoint(397);

  if (isMirrored) {
    [leftEar, rightEar] = [rightEar, leftEar];
    [leftJaw, rightJaw] = [rightJaw, leftJaw];
  }

  // 3D Pose angles
  const dxEars = rightEar.x - leftEar.x;
  const dyEars = rightEar.y - leftEar.y;
  const roll = Math.atan2(dyEars, dxEars) + (userTilt * Math.PI / 180);

  const earDistance = Math.hypot(dxEars, dyEars);
  const faceHeight = Math.hypot(chin.x - foreheadTop.x, chin.y - foreheadTop.y);

  const faceCenterX = (leftEar.x + rightEar.x) / 2;
  const yaw = Math.sin((noseTip.x - faceCenterX) / (earDistance / 2));

  const faceCenterY = (foreheadTop.y + chin.y) / 2;
  const pitch = Math.sin((noseTip.y - faceCenterY) / (faceHeight / 2));

  const cosYaw = Math.max(0.45, Math.cos(yaw));
  const cosPitch = Math.max(0.55, Math.cos(pitch));

  const yShift = userOffsetY * (canvasHeight * 0.006);

  // ─── NECKLACE ──────────────────────────────────────────────────────
  if (category === 'necklace') {
    const jawWidth = Math.hypot(rightJaw.x - leftJaw.x, rightJaw.y - leftJaw.y);

    // Scale: necklace render width ≈ 1.4x jaw width (fits collarbone span)
    // jawWidth / 160 gives baseScale ≈ 1.0 for a typical face
    const baseScale = (jawWidth / 160) * userScale;

    // Position: center at chin.y + 30% of faceHeight (collarbone/upper chest line)
    const neckCenterX = (leftJaw.x + rightJaw.x) / 2 + (yaw * jawWidth * 0.08);
    const necklaceY = chin.y + (faceHeight * 0.30) + (pitch * faceHeight * 0.05) + yShift;

    return {
      type: 'single',
      x: neckCenterX,
      y: necklaceY,
      scaleX: baseScale * cosYaw,
      scaleY: baseScale * cosPitch,
      angle: roll * 0.6,
      yaw,
      pitch,
      roll,
      shadowBlur: 12 * baseScale,
      shadowOffsetY: 5 * baseScale,
      contactShadowColor: 'rgba(25, 10, 0, 0.35)'
    };
  }

  // ─── EARRINGS ──────────────────────────────────────────────────────
  if (category === 'earrings') {
    const baseScale = (earDistance / 200) * userScale;
    const jhumkaAngle = roll * 0.35;
    const earDropY = faceHeight * 0.04;

    const leftYawFactor = 1 - (yaw * 0.4);
    const rightYawFactor = 1 + (yaw * 0.4);

    return {
      type: 'pair',
      yaw, pitch, roll,
      left: {
        x: leftEar.x - (yaw * 12),
        y: leftEar.y + earDropY + yShift,
        scaleX: baseScale * leftYawFactor * cosYaw,
        scaleY: baseScale * cosPitch,
        angle: jhumkaAngle,
        opacity: Math.max(0.2, Math.min(1.0, leftYawFactor)),
        shadowBlur: 10 * baseScale,
        shadowOffsetY: 6 * baseScale
      },
      right: {
        x: rightEar.x - (yaw * 12),
        y: rightEar.y + earDropY + yShift,
        scaleX: baseScale * rightYawFactor * cosYaw,
        scaleY: baseScale * cosPitch,
        angle: jhumkaAngle,
        opacity: Math.max(0.2, Math.min(1.0, rightYawFactor)),
        shadowBlur: 10 * baseScale,
        shadowOffsetY: 6 * baseScale
      },
      scale: baseScale
    };
  }

  // ─── MAANG TIKKA ───────────────────────────────────────────────────
  if (category === 'maang_tikka') {
    const baseScale = (faceHeight / 200) * userScale;
    return {
      type: 'single',
      x: foreheadTop.x,
      y: foreheadTop.y + (pitch * 8) + yShift,
      scaleX: baseScale * cosYaw,
      scaleY: baseScale * cosPitch,
      angle: roll,
      yaw, pitch, roll,
      shadowBlur: 8 * baseScale,
      shadowOffsetY: 4 * baseScale
    };
  }

  // ─── NOSE RING ─────────────────────────────────────────────────────
  if (category === 'nose_ring') {
    let nostril = getPoint(242);
    let rightNostril = getPoint(462);
    if (isMirrored) nostril = rightNostril;

    const noseWidth = Math.hypot(rightNostril.x - nostril.x, rightNostril.y - nostril.y);
    const baseScale = (Math.max(noseWidth, 16) / 24) * userScale;

    return {
      type: 'single',
      x: nostril.x,
      y: nostril.y + yShift,
      scaleX: baseScale * cosYaw,
      scaleY: baseScale * cosPitch,
      angle: roll,
      yaw, pitch, roll,
      shadowBlur: 5 * baseScale,
      shadowOffsetY: 2 * baseScale
    };
  }

  return getFallbackTransform(category, canvasWidth, canvasHeight, fineTune);
}

// ─── FALLBACK TRANSFORMS (no face detected) ─────────────────────────

function getFallbackTransform(category, width, height, fineTune = {}) {
  const { scale = 1.0, offsetY = 0, tilt = 0 } = fineTune;
  const rad = (tilt * Math.PI) / 180;

  if (category === 'earrings') {
    return {
      type: 'pair',
      left: {
        x: width * 0.35, y: height * 0.45 + offsetY,
        scaleX: 0.7 * scale, scaleY: 0.7 * scale,
        angle: rad, opacity: 1, shadowBlur: 8, shadowOffsetY: 5
      },
      right: {
        x: width * 0.65, y: height * 0.45 + offsetY,
        scaleX: 0.7 * scale, scaleY: 0.7 * scale,
        angle: rad, opacity: 1, shadowBlur: 8, shadowOffsetY: 5
      },
      scale: 0.7 * scale
    };
  }

  if (category === 'necklace') {
    return {
      type: 'single',
      x: width * 0.50,
      y: height * 0.58 + offsetY,
      scaleX: 0.55 * scale,
      scaleY: 0.55 * scale,
      angle: rad,
      shadowBlur: 10,
      shadowOffsetY: 5
    };
  }

  if (category === 'maang_tikka') {
    return {
      type: 'single',
      x: width * 0.50,
      y: height * 0.22 + offsetY,
      scaleX: 0.8 * scale,
      scaleY: 0.8 * scale,
      angle: rad,
      shadowBlur: 6,
      shadowOffsetY: 3
    };
  }

  if (category === 'nose_ring') {
    return {
      type: 'single',
      x: width * 0.46,
      y: height * 0.50 + offsetY,
      scaleX: 0.7 * scale,
      scaleY: 0.7 * scale,
      angle: rad,
      shadowBlur: 4,
      shadowOffsetY: 2
    };
  }

  return { type: 'single', x: width * 0.5, y: height * 0.5, scaleX: 1.0, scaleY: 1.0, angle: 0 };
}
