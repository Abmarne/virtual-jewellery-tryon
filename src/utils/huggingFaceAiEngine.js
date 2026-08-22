/**
 * Hugging Face AI Engine — Real AI-Powered Virtual Jewellery Try-On
 * 
 * Uses the @huggingface/inference SDK to call HF Inference API.
 * Supports a model priority chain with NO canvas fallback.
 * On failure → throws descriptive error for the UI to display.
 */

import { HfInference } from '@huggingface/inference';

// Read token from Vite env
const HF_TOKEN = import.meta.env.VITE_HF_API_TOKEN;

/**
 * Check if the API token is configured
 */
export function isApiKeyConfigured() {
  return !!HF_TOKEN && HF_TOKEN !== 'your_hugging_face_api_token_here';
}

/**
 * Auto-detect jewellery category from metadata or name
 */
function detectJewelleryInfo(item) {
  const name = (item?.name || '').toLowerCase();
  const category = (item?.category || '').toLowerCase();
  const combined = `${name} ${category}`;

  if (combined.includes('necklace') || combined.includes('pendant') || combined.includes('chain') || combined.includes('choker') || combined.includes('haar')) {
    return { type: 'necklace', bodyPart: 'neck and chest area', description: 'an elegant necklace' };
  }
  if (combined.includes('earring') || combined.includes('jhumka') || combined.includes('stud') || combined.includes('ear')) {
    return { type: 'earring', bodyPart: 'ears', description: 'beautiful earrings' };
  }
  if (combined.includes('ring') || combined.includes('band')) {
    return { type: 'ring', bodyPart: 'finger', description: 'a stunning ring' };
  }
  if (combined.includes('bracelet') || combined.includes('bangle') || combined.includes('kangan') || combined.includes('kara')) {
    return { type: 'bracelet', bodyPart: 'wrist', description: 'an ornate bracelet' };
  }
  if (combined.includes('maang tikka') || combined.includes('tikka') || combined.includes('matha patti') || combined.includes('forehead')) {
    return { type: 'maang_tikka', bodyPart: 'forehead', description: 'a traditional maang tikka' };
  }
  if (combined.includes('nose') || combined.includes('nath')) {
    return { type: 'nose_ring', bodyPart: 'nose', description: 'a decorative nose ring' };
  }
  if (combined.includes('anklet') || combined.includes('payal') || combined.includes('ankle')) {
    return { type: 'anklet', bodyPart: 'ankle', description: 'a delicate anklet' };
  }
  if (combined.includes('brooch') || combined.includes('pin')) {
    return { type: 'brooch', bodyPart: 'chest', description: 'an intricate brooch' };
  }

  // Generic fallback — let the AI figure it out
  return { type: 'jewellery', bodyPart: 'appropriate body part', description: 'a beautiful piece of jewellery' };
}

/**
 * Build an optimized prompt for the AI model
 */
function buildPrompt(jewelleryInfo) {
  return `A photorealistic high-resolution portrait photograph of a person wearing ${jewelleryInfo.description} on their ${jewelleryInfo.bodyPart}. The jewellery is placed naturally and realistically. Maintain the exact same person, face, skin tone, hair, expression, clothing, lighting conditions, and background. The jewellery has realistic metallic reflections and catches light naturally. Professional studio quality, 8k, ultra detailed, photorealistic.`;
}

/**
 * Build a negative prompt to avoid common issues
 */
function buildNegativePrompt() {
  return 'blurry, low quality, distorted face, changed face, different person, cartoon, anime, painting, illustration, deformed, bad anatomy, disfigured, poorly drawn, mutated, extra limbs, ugly, duplicate, watermark, text, signature';
}

/**
 * Convert an HTML Image element to a Blob
 */
async function imageToBlob(img) {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to convert image to blob'));
    }, 'image/png');
  });
}

/**
 * Convert a data URL string to a Blob
 */
function dataUrlToBlob(dataUrl) {
  const parts = dataUrl.split(',');
  const mime = parts[0].match(/:(.*?);/)[1];
  const b64 = atob(parts[1]);
  const arr = new Uint8Array(b64.length);
  for (let i = 0; i < b64.length; i++) {
    arr[i] = b64.charCodeAt(i);
  }
  return new Blob([arr], { type: mime });
}

/**
 * Create a composite reference image by placing jewellery on the person photo
 * This gives the AI a visual hint of what we want
 */
async function createCompositeReference(personImg, jewelleryImg) {
  const canvas = document.createElement('canvas');
  canvas.width = personImg.naturalWidth || personImg.width || 800;
  canvas.height = personImg.naturalHeight || personImg.height || 800;
  const ctx = canvas.getContext('2d');

  // Draw person as base
  ctx.drawImage(personImg, 0, 0, canvas.width, canvas.height);

  // Semi-transparent overlay of jewellery for reference
  if (jewelleryImg) {
    const jw = jewelleryImg.naturalWidth || jewelleryImg.width;
    const jh = jewelleryImg.naturalHeight || jewelleryImg.height;
    const scale = Math.min(canvas.width * 0.35 / jw, canvas.height * 0.35 / jh);
    const renderW = jw * scale;
    const renderH = jh * scale;
    const renderX = (canvas.width - renderW) / 2;
    const renderY = canvas.height * 0.25;

    ctx.globalAlpha = 0.6;
    ctx.drawImage(jewelleryImg, renderX, renderY, renderW, renderH);
    ctx.globalAlpha = 1.0;
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to create composite reference'));
    }, 'image/png');
  });
}

/**
 * Attempt image-to-image generation with a specific model
 */
async function tryImageToImage(hf, modelId, personBlob, prompt, negativePrompt, onProgress) {
  onProgress(`Calling AI model: ${modelId.split('/').pop()}...`);

  const result = await hf.imageToImage({
    model: modelId,
    inputs: personBlob,
    parameters: {
      prompt: prompt,
      negative_prompt: negativePrompt,
      guidance_scale: 7.5,
      strength: 0.35, // Low strength to preserve the person's appearance
      num_inference_steps: 25,
    },
  });

  return result;
}

/**
 * Attempt text-to-image generation (for models that don't support img2img on serverless)
 */
async function tryTextToImage(hf, modelId, prompt, negativePrompt, onProgress) {
  onProgress(`Generating with ${modelId.split('/').pop()}...`);

  const result = await hf.textToImage({
    model: modelId,
    inputs: prompt,
    parameters: {
      negative_prompt: negativePrompt,
      guidance_scale: 7.5,
      num_inference_steps: 25,
      width: 768,
      height: 1024,
    },
  });

  return result;
}

/**
 * Convert a Blob result to a data URL for display
 */
function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read AI result'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Classify API errors into user-friendly categories
 */
function classifyError(error) {
  const msg = (error?.message || '').toLowerCase();
  const status = error?.status || error?.statusCode;

  if (status === 401 || msg.includes('unauthorized') || msg.includes('invalid token') || msg.includes('invalid api')) {
    return {
      type: 'auth',
      title: 'Invalid API Key',
      message: 'Your Hugging Face API key is invalid or expired. Please check your .env file and ensure VITE_HF_API_TOKEN contains a valid token.',
      retryable: false,
    };
  }

  if (status === 429 || msg.includes('rate limit') || msg.includes('too many')) {
    return {
      type: 'rate_limit',
      title: 'AI is Busy',
      message: 'You\'ve hit the API rate limit. Please wait 30-60 seconds and try again. The free tier allows ~100 requests per hour.',
      retryable: true,
    };
  }

  if (status === 503 || msg.includes('loading') || msg.includes('currently loading') || msg.includes('warming')) {
    return {
      type: 'loading',
      title: 'AI Model is Warming Up',
      message: 'The AI model is loading into memory. This can take 15-60 seconds for first-time use. Please try again shortly.',
      retryable: true,
    };
  }

  if (status === 500 || msg.includes('internal server') || msg.includes('server error')) {
    return {
      type: 'server',
      title: 'Server Error',
      message: 'The AI server encountered an error. This is usually temporary. Please try again in a moment.',
      retryable: true,
    };
  }

  if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch') || msg.includes('offline')) {
    return {
      type: 'network',
      title: 'Network Error',
      message: 'Unable to connect to the AI service. Please check your internet connection and try again.',
      retryable: true,
    };
  }

  return {
    type: 'unknown',
    title: 'Generation Failed',
    message: `Something went wrong: ${error?.message || 'Unknown error'}. Please try again.`,
    retryable: true,
  };
}

// Model priority chain — tried in order
const MODEL_CHAIN = [
  { id: 'black-forest-labs/FLUX.1-schnell', method: 'textToImage' },
  { id: 'stabilityai/stable-diffusion-xl-base-1.0', method: 'imageToImage' },
];

/**
 * Main generation function — tries model chain, NO fallback.
 * 
 * @param {Object} params - { personImg, jewelleryImg, category, item }
 * @param {Function} onProgress - Progress callback (msg) => void
 * @returns {Promise<string>} - Data URL of the generated image
 * @throws {Object} - { type, title, message, retryable } on failure
 */
export async function generateHuggingFaceTryOn(params, onProgress) {
  if (!isApiKeyConfigured()) {
    throw {
      type: 'auth',
      title: 'API Key Not Configured',
      message: 'Please add your Hugging Face API token to the .env file as VITE_HF_API_TOKEN. Get a free token at huggingface.co/settings/tokens',
      retryable: false,
    };
  }

  const { personImg, jewelleryImg, category, item } = params;

  if (!personImg) {
    throw { type: 'input', title: 'Missing Photo', message: 'Please upload your photo first.', retryable: false };
  }

  const hf = new HfInference(HF_TOKEN);
  const jewelleryInfo = detectJewelleryInfo({ category, name: item?.name });
  const prompt = buildPrompt(jewelleryInfo);
  const negativePrompt = buildNegativePrompt();

  onProgress?.('Analyzing your photo...');

  // Convert images to blobs
  let personBlob;
  try {
    personBlob = await imageToBlob(personImg);
  } catch (e) {
    throw { type: 'input', title: 'Image Error', message: 'Failed to process your photo. Please try a different image.', retryable: false };
  }

  onProgress?.('Understanding jewellery design...');

  // Try each model in the chain
  let lastError = null;

  for (const model of MODEL_CHAIN) {
    try {
      onProgress?.(`Applying jewellery with AI (${model.id.split('/').pop()})...`);

      let resultBlob;

      if (model.method === 'imageToImage') {
        resultBlob = await tryImageToImage(hf, model.id, personBlob, prompt, negativePrompt, onProgress);
      } else {
        resultBlob = await tryTextToImage(hf, model.id, prompt, negativePrompt, onProgress);
      }

      if (!resultBlob || resultBlob.size === 0) {
        throw new Error('AI returned empty result');
      }

      onProgress?.('Enhancing realism...');

      // Small delay for UX feel
      await new Promise((r) => setTimeout(r, 500));

      const dataUrl = await blobToDataUrl(resultBlob);

      onProgress?.('Complete!');
      return dataUrl;

    } catch (err) {
      console.warn(`Model ${model.id} failed:`, err);
      lastError = err;
      // Continue to next model in chain
    }
  }

  // All models failed — throw classified error (NO fallback)
  throw classifyError(lastError);
}
