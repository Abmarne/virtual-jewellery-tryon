/**
 * Hugging Face AI Engine Utility (Frontend UI Mode)
 */

export async function generateHuggingFaceTryOn(params, onProgress) {
  if (onProgress) onProgress('Processing Try-On...');
  const { personImg, jewelleryImg } = params;

  const canvas = document.createElement('canvas');
  canvas.width = personImg.naturalWidth || personImg.width || 800;
  canvas.height = personImg.naturalHeight || personImg.height || 600;
  const ctx = canvas.getContext('2d');

  // Draw person photo background
  ctx.drawImage(personImg, 0, 0, canvas.width, canvas.height);

  // Overlay jewellery design in center
  if (jewelleryImg) {
    const renderWidth = canvas.width * 0.35;
    const renderHeight = (jewelleryImg.naturalHeight / jewelleryImg.naturalWidth) * renderWidth || canvas.height * 0.35;
    const renderX = (canvas.width - renderWidth) / 2;
    const renderY = canvas.height * 0.55;

    ctx.drawImage(jewelleryImg, renderX, renderY, renderWidth, renderHeight);
  }

  return canvas.toDataURL('image/png', 1.0);
}
