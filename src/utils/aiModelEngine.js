/**
 * AI Model Engine Utility (Frontend UI Mode)
 */

export async function generateAITryOnResult(params, onProgress) {
  const { personImg } = params;
  const canvas = document.createElement('canvas');
  canvas.width = personImg.naturalWidth || personImg.width || 800;
  canvas.height = personImg.naturalHeight || personImg.height || 600;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(personImg, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/png');
}
