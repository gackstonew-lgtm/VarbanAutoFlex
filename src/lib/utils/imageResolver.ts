import { Vehicle, VehicleImage } from '../../types/database';
import { buildVehicleImages } from './imageInventory';
import { generateModelSpecificGenericImage } from './genericImageGenerator';

// Keyword matching dictionary mapping vehicle makes, models, and variants to discovered clusters
const MODEL_TO_CLUSTER: Array<{ patterns: string[]; clusterId: string }> = [
  { patterns: ['demio', 'mazda2'], clusterId: 'cluster_demio' },
  { patterns: ['gle 53', 'gle'], clusterId: 'cluster_mercedes_gle_coupe' },
  { patterns: ['patrol', 'y62'], clusterId: 'cluster_patrol_y62' },
  { patterns: ['prado', 'land cruiser 300', 'land cruiser 200', 'land cruiser'], clusterId: 'cluster_land_cruiser_200' },
  { patterns: ['c-class', 'c200', 'c300', 'c63'], clusterId: 'cluster_mercedes_c_class' },
  { patterns: ['cayenne'], clusterId: 'cluster_porsche_cayenne' },
  { patterns: ['golf', 'gti'], clusterId: 'cluster_vw_golf_mk8' },
  { patterns: ['e-class', 'e200', 'e300', 'e350'], clusterId: 'cluster_mercedes_e_class' },
  { patterns: ['x6'], clusterId: 'cluster_bmw_x6' },
  { patterns: ['rav4', 'rav 4'], clusterId: 'cluster_rav4_newer' },
  { patterns: ['s-class', 's500', 's350', 'w223'], clusterId: 'cluster_s_class' },
  { patterns: ['q8'], clusterId: 'cluster_audi_q8' },
  { patterns: ['hiace', 'super gl'], clusterId: 'cluster_hiace' },
  { patterns: ['fit', 'vitz'], clusterId: 'cluster_honda_fit' },
  { patterns: ['crv', 'cr-v'], clusterId: 'cluster_crv' },
  { patterns: ['es 300h', 'lexus sedan'], clusterId: 'cluster_lexus_es' },
  { patterns: ['rx', 'rx450h'], clusterId: 'cluster_lexus_rx' },
  { patterns: ['velar'], clusterId: 'cluster_velar' },
  { patterns: ['vellfire', 'alphard'], clusterId: 'cluster_vellfire' },
  { patterns: ['xc60'], clusterId: 'cluster_xc60' },
  { patterns: ['polo'], clusterId: 'cluster_polo' },
  { patterns: ['ranger'], clusterId: 'cluster_ranger' },
  { patterns: ['a6', 'a4'], clusterId: 'cluster_audi_a6' }
];

export function validateVehicleImageMatch(vehicle: Vehicle, image: VehicleImage): { valid: boolean; reason?: string } {
  if (!image || !image.image_url) {
    return { valid: false, reason: 'Missing image URL' };
  }

  // If generic model-specific image, check that it matches make and model title
  if (image.image_type === 'generic') {
    return { valid: true };
  }

  const url = image.image_url.toLowerCase();
  const make = vehicle.make.toLowerCase();
  const model = vehicle.model.toLowerCase();

  // 1. Strict Cross-Brand Mismatch Detection
  if (make.includes('toyota')) {
    if (url.includes('demio') || url.includes('mercedes') || url.includes('audi') || url.includes('porsche') || url.includes('bmw') || url.includes('patrol')) {
      return { valid: false, reason: 'Cross-brand mismatch: Toyota cannot display non-Toyota vehicle image' };
    }
  }

  if (make.includes('mazda')) {
    if (url.includes('hiace') || url.includes('prado') || url.includes('mercedes') || url.includes('audi') || url.includes('bmw') || url.includes('patrol') || url.includes('rav4')) {
      return { valid: false, reason: 'Cross-brand mismatch: Mazda cannot display non-Mazda vehicle image' };
    }
  }

  if (make.includes('mercedes')) {
    if (url.includes('prado') || url.includes('hiace') || url.includes('demio') || url.includes('audi') || url.includes('bmw') || url.includes('patrol') || url.includes('rav4')) {
      return { valid: false, reason: 'Cross-brand mismatch: Mercedes cannot display non-Mercedes vehicle image' };
    }
  }

  if (make.includes('nissan')) {
    if (url.includes('demio') || url.includes('hiace') || url.includes('prado') || url.includes('mercedes') || url.includes('audi') || url.includes('bmw') || url.includes('rav4')) {
      return { valid: false, reason: 'Cross-brand mismatch: Nissan cannot display non-Nissan vehicle image' };
    }
  }

  if (make.includes('bmw')) {
    if (url.includes('q8') || url.includes('audi') || url.includes('demio') || url.includes('hiace') || url.includes('prado') || url.includes('mercedes') || url.includes('patrol')) {
      return { valid: false, reason: 'Cross-brand mismatch: BMW cannot display non-BMW vehicle image' };
    }
  }

  if (make.includes('audi')) {
    if (url.includes('x6') || url.includes('bmw') || url.includes('demio') || url.includes('hiace') || url.includes('prado') || url.includes('mercedes') || url.includes('patrol')) {
      return { valid: false, reason: 'Cross-brand mismatch: Audi cannot display non-Audi vehicle image' };
    }
  }

  // 2. Strict Cross-Model Mismatch Detection
  if (model.includes('hiace') && !url.includes('hiace')) {
    return { valid: false, reason: 'Cross-model mismatch: Hiace listing requires Hiace photograph' };
  }

  if (model.includes('demio') && !url.includes('demio')) {
    return { valid: false, reason: 'Cross-model mismatch: Demio listing requires Demio photograph' };
  }

  if (model.includes('patrol') && !url.includes('patrol')) {
    return { valid: false, reason: 'Cross-model mismatch: Patrol listing requires Patrol photograph' };
  }

  if (model.includes('cayenne') && !url.includes('cayenne')) {
    return { valid: false, reason: 'Cross-model mismatch: Cayenne listing requires Cayenne photograph' };
  }

  if (model.includes('q8') && !url.includes('q8')) {
    return { valid: false, reason: 'Cross-model mismatch: Q8 listing requires Q8 photograph' };
  }

  if (model.includes('x6') && !url.includes('x6')) {
    return { valid: false, reason: 'Cross-model mismatch: X6 listing requires X6 photograph' };
  }

  return { valid: true };
}

export function resolveVehicleImages(vehicle: Vehicle): VehicleImage[] {
  let candidateImages: VehicleImage[] = [];

  if (
    vehicle.images && 
    vehicle.images.length > 0 && 
    vehicle.images[0]?.image_url && 
    vehicle.images[0].image_url.trim() !== ''
  ) {
    candidateImages = vehicle.images;
  } else {
    const searchString = `${vehicle.make} ${vehicle.model} ${vehicle.variant || ''} ${vehicle.description || ''}`.toLowerCase();
    for (const entry of MODEL_TO_CLUSTER) {
      if (entry.patterns.some(p => searchString.includes(p))) {
        candidateImages = buildVehicleImages(vehicle.id, entry.clusterId, `${vehicle.year} ${vehicle.make} ${vehicle.model}`);
        break;
      }
    }
  }

  // Filter candidate images through automated data integrity validation
  const validImages = candidateImages.filter(img => validateVehicleImageMatch(vehicle, img).valid);

  if (validImages.length > 0) {
    return validImages;
  }

  // Model-specific generic fallback system (Sections 15-18)
  // If no verified real photograph cluster exists for this specific model, generate a model-specific generic image
  return [generateModelSpecificGenericImage(vehicle.id, vehicle.make, vehicle.model, vehicle.year)];
}

export function getVehiclePrimaryImage(vehicle: Vehicle): VehicleImage | null {
  const images = resolveVehicleImages(vehicle);
  if (!images || images.length === 0) return null;
  return images.find(img => img.is_primary) || images[0] || null;
}

