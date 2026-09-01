import { VehicleImage } from '../../types/database';

export function generateModelSpecificGenericImage(
  vehicleId: string,
  make: string,
  model: string,
  year: number
): VehicleImage {
  const title = `${year} ${make} ${model}`;
  const cleanMake = make.toUpperCase();
  const cleanModel = model.toUpperCase();
  
  // Model-specific SVG data URL illustration
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0F172A"/>
        <stop offset="40%" stop-color="#1E293B"/>
        <stop offset="100%" stop-color="#0F172A"/>
      </linearGradient>
      <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#1769E0"/>
        <stop offset="50%" stop-color="#2D8CFF"/>
        <stop offset="100%" stop-color="#0038BC"/>
      </linearGradient>
      <linearGradient id="carBody" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#334155"/>
        <stop offset="50%" stop-color="#64748B"/>
        <stop offset="100%" stop-color="#334155"/>
      </linearGradient>
    </defs>
    
    <!-- Background -->
    <rect width="800" height="500" fill="url(#bg)"/>
    <circle cx="400" cy="200" r="280" fill="#1E293B" opacity="0.4"/>
    
    <!-- Grid pattern -->
    <path d="M0 400 H800 M0 430 H800 M0 455 H800 M0 475 H800" stroke="#334155" stroke-width="1" opacity="0.3"/>
    
    <!-- Silhouette Body Curve -->
    <path d="M 120,340 C 180,340 220,330 260,270 C 300,210 380,180 500,180 C 580,180 640,220 680,270 C 710,300 730,340 730,340 Z" fill="url(#carBody)" opacity="0.85"/>
    
    <!-- Headlight glow -->
    <ellipse cx="140" cy="330" rx="20" ry="10" fill="#60A5FA" opacity="0.6"/>
    <ellipse cx="135" cy="330" rx="10" ry="5" fill="#FFFFFF"/>
    
    <!-- Wheels -->
    <circle cx="230" cy="340" r="45" fill="#0F172A" stroke="#94A3B8" stroke-width="8"/>
    <circle cx="230" cy="340" r="20" fill="#475569"/>
    <circle cx="610" cy="340" r="45" fill="#0F172A" stroke="#94A3B8" stroke-width="8"/>
    <circle cx="610" cy="340" r="20" fill="#475569"/>

    <!-- Speed Accent Line -->
    <path d="M 80,360 L 720,360" stroke="url(#accent)" stroke-width="4" stroke-linecap="round"/>

    <!-- YARDLY Model Badge Box -->
    <rect x="200" y="45" width="400" height="90" rx="16" fill="#0F172A" stroke="#334155" stroke-width="2" opacity="0.9"/>
    
    <text x="400" y="78" fill="#94A3B8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="800" letter-spacing="3" text-anchor="middle">
      YARDLY VERIFIED MODEL SPEC
    </text>
    
    <text x="400" y="112" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="900" letter-spacing="1" text-anchor="middle">
      ${cleanMake} ${cleanModel}
    </text>

    <!-- Generic Spec Badge -->
    <rect x="280" y="415" width="240" height="30" rx="15" fill="url(#accent)"/>
    <text x="400" y="435" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="800" letter-spacing="1" text-anchor="middle">
      MODEL SPECIFIC ILLUSTRATION
    </text>
  </svg>`;

  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  return {
    id: `generic-${vehicleId}`,
    vehicle_id: vehicleId,
    image_url: dataUrl,
    thumbnail_url: dataUrl,
    alt_text: `${title} Model-Specific Visual Representation`,
    display_order: 1,
    is_primary: true,
    source_type: 'demo',
    license_status: 'authorized',
    image_type: 'generic',
    created_at: new Date().toISOString()
  };
}
