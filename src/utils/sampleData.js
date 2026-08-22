// Sample Jewellery Catalog & Model Avatars Dataset for Virtual Try-On

export const SAMPLE_MODELS = [
  {
    id: 'model-1',
    name: 'Ananya (Traditional)',
    type: 'bridal',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    description: 'Frontal studio portrait, ideal for bridal necklace & heavy maang tikka try-on'
  },
  {
    id: 'model-2',
    name: 'Priya (Festive)',
    type: 'festive',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    description: 'Warm lighting, perfect for golden Kundan earrings & chokers'
  },
  {
    id: 'model-3',
    name: 'Kavya (Modern Ethnic)',
    type: 'casual',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    description: 'Clean background portrait, great for subtle nose rings & light necklace sets'
  },
  {
    id: 'model-4',
    name: 'Riya (Royal Gold)',
    type: 'bridal',
    imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    description: 'High contrast portrait for intricate temple & polki jewellery'
  }
];

// Helper to generate SVG data URIs for pristine transparent jewellery assets
export function createJewellerySVGDataURI(type, style = 'kundan') {
  let svgString = '';

  if (type === 'earrings') {
    // Elegant Kundan Jhumka Earring pair
    svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300" width="200" height="300">
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFDF73" />
          <stop offset="50%" stop-color="#D4AF37" />
          <stop offset="100%" stop-color="#AA771C" />
        </linearGradient>
        <radialGradient id="ruby" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#FF4D6D" />
          <stop offset="100%" stop-color="#800020" />
        </radialGradient>
        <radialGradient id="pearl" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#FFFFFF" />
          <stop offset="100%" stop-color="#E2D8C3" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- LEFT EARRING -->
      <g transform="translate(45, 20)">
        <!-- Top Stud -->
        <circle cx="20" cy="20" r="14" fill="url(#goldGrad)" stroke="#B38728" stroke-width="1.5" filter="url(#glow)" />
        <polygon points="20,10 27,20 20,30 13,20" fill="url(#ruby)" />
        <circle cx="20" cy="20" r="4" fill="url(#pearl)" />
        
        <!-- Connecting Ring -->
        <circle cx="20" cy="38" r="4" fill="none" stroke="url(#goldGrad)" stroke-width="2" />
        
        <!-- Jhumka Dome -->
        <path d="M 2 55 Q 20 38 38 55 Q 38 72 20 75 Q 2 72 2 55 Z" fill="url(#goldGrad)" stroke="#AA771C" stroke-width="1.5" />
        <!-- Intricate lines on dome -->
        <path d="M 10 50 Q 20 62 30 50" fill="none" stroke="#800020" stroke-width="1.5" />
        <circle cx="20" cy="55" r="3" fill="url(#ruby)" />
        
        <!-- Hanging Pearl Droplets -->
        <g fill="url(#pearl)">
          <circle cx="6" cy="80" r="3" />
          <circle cx="13" cy="84" r="3" />
          <circle cx="20" cy="86" r="3.5" />
          <circle cx="27" cy="84" r="3" />
          <circle cx="34" cy="80" r="3" />
        </g>
      </g>

      <!-- RIGHT EARRING -->
      <g transform="translate(115, 20)">
        <!-- Top Stud -->
        <circle cx="20" cy="20" r="14" fill="url(#goldGrad)" stroke="#B38728" stroke-width="1.5" filter="url(#glow)" />
        <polygon points="20,10 27,20 20,30 13,20" fill="url(#ruby)" />
        <circle cx="20" cy="20" r="4" fill="url(#pearl)" />
        
        <!-- Connecting Ring -->
        <circle cx="20" cy="38" r="4" fill="none" stroke="url(#goldGrad)" stroke-width="2" />
        
        <!-- Jhumka Dome -->
        <path d="M 2 55 Q 20 38 38 55 Q 38 72 20 75 Q 2 72 2 55 Z" fill="url(#goldGrad)" stroke="#AA771C" stroke-width="1.5" />
        <path d="M 10 50 Q 20 62 30 50" fill="none" stroke="#800020" stroke-width="1.5" />
        <circle cx="20" cy="55" r="3" fill="url(#ruby)" />
        
        <!-- Hanging Pearl Droplets -->
        <g fill="url(#pearl)">
          <circle cx="6" cy="80" r="3" />
          <circle cx="13" cy="84" r="3" />
          <circle cx="20" cy="86" r="3.5" />
          <circle cx="27" cy="84" r="3" />
          <circle cx="34" cy="80" r="3" />
        </g>
      </g>
    </svg>`;
  } else if (type === 'necklace') {
    // Royal Kundan & Ruby Choker Necklace
    svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 300" width="500" height="300">
      <defs>
        <linearGradient id="goldGradN" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFE58F" />
          <stop offset="50%" stop-color="#D4AF37" />
          <stop offset="100%" stop-color="#997A15" />
        </linearGradient>
        <radialGradient id="emerald" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#52B788" />
          <stop offset="100%" stop-color="#081C15" />
        </radialGradient>
        <radialGradient id="rubyN" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#FF4D6D" />
          <stop offset="100%" stop-color="#590012" />
        </radialGradient>
        <radialGradient id="pearlN" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#FFFFFF" />
          <stop offset="100%" stop-color="#D8C8B8" />
        </radialGradient>
      </defs>

      <g transform="translate(0, 20)">
        <!-- Main Curved Necklace Band -->
        <path d="M 50 40 Q 250 160 450 40 Q 250 240 50 40 Z" fill="url(#goldGradN)" stroke="#805B10" stroke-width="2" />
        <path d="M 70 50 Q 250 150 430 50" fill="none" stroke="#FF4D6D" stroke-width="4" stroke-dasharray="8 4" />
        
        <!-- Centered Royal Pendant -->
        <g transform="translate(250, 140)">
          <!-- Outer Gold Flower -->
          <circle cx="0" cy="0" r="32" fill="url(#goldGradN)" stroke="#AA771C" stroke-width="2" />
          <!-- Inner Emerald Center -->
          <circle cx="0" cy="0" r="18" fill="url(#emerald)" />
          <polygon points="0,-12 10,0 0,12 -10,0" fill="url(#goldGradN)" />
          <!-- Hanging Main Drop -->
          <path d="M 0 32 L 14 55 Q 0 75 -14 55 Z" fill="url(#rubyN)" stroke="url(#goldGradN)" stroke-width="2" />
          <circle cx="0" cy="80" r="5" fill="url(#pearlN)" />
        </g>

        <!-- Left Flanking Gems -->
        <g transform="translate(180, 115)">
          <circle cx="0" cy="0" r="20" fill="url(#goldGradN)" />
          <circle cx="0" cy="0" r="11" fill="url(#rubyN)" />
          <path d="M 0 20 L 8 36 Q 0 48 -8 36 Z" fill="url(#emerald)" stroke="url(#goldGradN)" stroke-width="1.5" />
          <circle cx="0" cy="52" r="4" fill="url(#pearlN)" />
        </g>

        <g transform="translate(120, 80)">
          <circle cx="0" cy="0" r="16" fill="url(#goldGradN)" />
          <circle cx="0" cy="0" r="9" fill="url(#emerald)" />
          <circle cx="0" cy="24" r="3.5" fill="url(#pearlN)" />
        </g>

        <!-- Right Flanking Gems -->
        <g transform="translate(320, 115)">
          <circle cx="0" cy="0" r="20" fill="url(#goldGradN)" />
          <circle cx="0" cy="0" r="11" fill="url(#rubyN)" />
          <path d="M 0 20 L 8 36 Q 0 48 -8 36 Z" fill="url(#emerald)" stroke="url(#goldGradN)" stroke-width="1.5" />
          <circle cx="0" cy="52" r="4" fill="url(#pearlN)" />
        </g>

        <g transform="translate(380, 80)">
          <circle cx="0" cy="0" r="16" fill="url(#goldGradN)" />
          <circle cx="0" cy="0" r="9" fill="url(#emerald)" />
          <circle cx="0" cy="24" r="3.5" fill="url(#pearlN)" />
        </g>
      </g>
    </svg>`;
  } else if (type === 'maang_tikka') {
    // Bridal Kundan Maang Tikka
    svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 260" width="160" height="260">
      <defs>
        <linearGradient id="goldTikka" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFF0A5" />
          <stop offset="50%" stop-color="#D4AF37" />
          <stop offset="100%" stop-color="#805B10" />
        </linearGradient>
        <radialGradient id="rubyT" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#FF3366" />
          <stop offset="100%" stop-color="#660019" />
        </radialGradient>
        <radialGradient id="pearlT" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#FFFFFF" />
          <stop offset="100%" stop-color="#E5D9C5" />
        </radialGradient>
      </defs>

      <!-- Vertical Chain (Matha Chain) -->
      <line x1="80" y1="10" x2="80" y2="130" stroke="url(#goldTikka)" stroke-width="3" stroke-dasharray="5 3" />
      <circle cx="80" cy="15" r="4" fill="url(#rubyT)" />
      <circle cx="80" cy="45" r="3" fill="url(#pearlT)" />
      <circle cx="80" cy="75" r="3" fill="url(#pearlT)" />
      <circle cx="80" cy="105" r="3" fill="url(#pearlT)" />

      <!-- Center Main Tikka Ornament -->
      <g transform="translate(80, 160)">
        <!-- Flower Base -->
        <circle cx="0" cy="0" r="28" fill="url(#goldTikka)" stroke="#AA771C" stroke-width="1.5" />
        <polygon points="0,-22 14,-7 22,10 7,22 -10,22 -22,7 -14,-14" fill="url(#rubyT)" />
        <circle cx="0" cy="0" r="10" fill="url(#goldTikka)" />
        <circle cx="0" cy="0" r="6" fill="url(#pearlT)" />

        <!-- Bottom Hanging Pearls -->
        <g fill="url(#pearlT)">
          <circle cx="-16" cy="30" r="3.5" />
          <circle cx="-8" cy="36" r="4" />
          <circle cx="0" cy="40" r="5" />
          <circle cx="8" cy="36" r="4" />
          <circle cx="16" cy="30" r="3.5" />
        </g>
      </g>
    </svg>`;
  } else if (type === 'nose_ring') {
    // Royal Maharashtrian / North Indian Nath (Nose Ring)
    svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 180" width="140" height="180">
      <defs>
        <linearGradient id="goldNath" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFE07D" />
          <stop offset="60%" stop-color="#D4AF37" />
          <stop offset="100%" stop-color="#8F6A10" />
        </linearGradient>
        <radialGradient id="rubyNath" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#FF2E63" />
          <stop offset="100%" stop-color="#79021F" />
        </radialGradient>
        <radialGradient id="pearlNath" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#FFFFFF" />
          <stop offset="100%" stop-color="#DDD1C1" />
        </radialGradient>
      </defs>

      <!-- Main Hoop Ring -->
      <circle cx="50" cy="50" r="32" fill="none" stroke="url(#goldNath)" stroke-width="2.5" />
      
      <!-- Cluster of Pearls and Ruby -->
      <g transform="translate(30, 72)">
        <circle cx="0" cy="0" r="6" fill="url(#rubyNath)" />
        <circle cx="10" cy="4" r="5" fill="url(#pearlNath)" />
        <circle cx="20" cy="2" r="5" fill="url(#goldNath)" />
        <circle cx="30" cy="-4" r="5" fill="url(#pearlNath)" />
        <circle cx="38" cy="-12" r="6" fill="url(#rubyNath)" />
      </g>

      <!-- Hair Chain (Ear Connector) -->
      <path d="M 75 35 Q 110 50 135 120" fill="none" stroke="url(#goldNath)" stroke-width="1.5" stroke-dasharray="3 2" />
      <circle cx="135" cy="120" r="3" fill="url(#pearlNath)" />
    </svg>`;
  }

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svgString);
}

// Initial Catalog Items
export const INITIAL_JEWELLERY_CATALOG = [
  // EARRINGS
  {
    id: 'ear-1',
    name: 'Kundan Pearl Jhumka',
    category: 'earrings',
    tag: 'Bridal Bestseller',
    imageUrl: createJewellerySVGDataURI('earrings', 'kundan'),
    defaultScale: 1.0,
    defaultOffsetY: 0,
    description: 'Traditional gold plated Kundan Jhumka with ruby center and hanging white pearls.'
  },
  {
    id: 'ear-2',
    name: 'Royal Ruby Dangle Earrings',
    category: 'earrings',
    tag: 'Festive',
    imageUrl: createJewellerySVGDataURI('earrings', 'ruby'),
    defaultScale: 1.1,
    defaultOffsetY: 5,
    description: 'Intricate drop earrings adorned with deep ruby crystal accents.'
  },

  // NECKLACES
  {
    id: 'neck-1',
    name: 'Royal Heritage Kundan Choker',
    category: 'necklace',
    tag: 'Royal Collection',
    imageUrl: createJewellerySVGDataURI('necklace', 'kundan'),
    defaultScale: 1.0,
    defaultOffsetY: 0,
    description: 'Grand royal choker set featuring emerald center stone and pearl drops.'
  },

  // MAANG TIKKA
  {
    id: 'tikka-1',
    name: 'Bridal Floral Maang Tikka',
    category: 'maang_tikka',
    tag: 'Bridal',
    imageUrl: createJewellerySVGDataURI('maang_tikka', 'kundan'),
    defaultScale: 1.0,
    defaultOffsetY: 0,
    description: 'Classic beaded chain matha tikka with vibrant ruby centerpiece.'
  },

  // NOSE RINGS
  {
    id: 'nath-1',
    name: 'Royal Pearl Nath (Nose Ring)',
    category: 'nose_ring',
    tag: 'Traditional',
    imageUrl: createJewellerySVGDataURI('nose_ring', 'pearl'),
    defaultScale: 1.0,
    defaultOffsetY: 0,
    description: 'Elegant golden nose ring featuring pearl cluster and hair connector chain.'
  }
];
