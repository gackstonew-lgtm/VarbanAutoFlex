import { Vehicle, VehicleImage } from '../../types/database';
import { buildVehicleImages } from './imageInventory';
import { generateModelSpecificGenericImage } from './genericImageGenerator';

// Keyword matching dictionary mapping vehicle makes, models, and variants to discovered clusters
const MODEL_TO_CLUSTER: Array<{ patterns: string[]; clusterId: string }> = [
  { patterns: ['glc250', 'glc 250'], clusterId: 'cluster_mercedes_benz_glc250_4matic' },
  { patterns: ['is300 2016', 'is300'], clusterId: 'cluster_lexus_is300_2016' },
  { patterns: ['rx 300', 'rx300'], clusterId: 'cluster_lexus_rx_300' },
  { patterns: ['sq5 3.0t', 'sq5'], clusterId: 'cluster_2018_audi_sq5_3_0t_v6' },
  { patterns: ['mark x premium', 'mark x'], clusterId: 'cluster_toyota_mark_x_premium' },
  { patterns: ['s400h lwb', 's400h', 's400'], clusterId: 'cluster_2014_mercedes_benz_s400h_lwb' },
  { patterns: ['defender 110 d350', 'd350', '75th limited edition'], clusterId: 'cluster_2023_land_rover_defender_110_d350' },
  { patterns: ['cx5 xdl', 'cx5 2020'], clusterId: 'cluster_mazda_cx5_xdl_2020' },
  { patterns: ['audi s5', 's5 2015'], clusterId: 'cluster_audi_s5' },
  { patterns: ['mazda 3 premium', 'mazda 3 2019'], clusterId: 'cluster_mazda_3_premium_grade' },
  { patterns: ['probox silver', 'probox 2017'], clusterId: 'cluster_toyota_probox_silver' },
  { patterns: ['mazda 6 2020', 'mazda 6'], clusterId: 'cluster_mazda_6' },
  { patterns: ['ranger raptor 3.0', 'ranger raptor'], clusterId: 'cluster_2023_ford_ranger_raptor_3_0_double_cab_petrol' },
  { patterns: ['mustang 2020', 'mustang'], clusterId: 'cluster_ford_mustang_2020' },
  { patterns: ['gle 400d coupe', 'gle 400d'], clusterId: 'cluster_2020_mercedes_benz_gle_400d_coupe' },
  { patterns: ['atenza 2.2d', 'atenza'], clusterId: 'cluster_2018_mazda_atenza_2_2d' },
  { patterns: ['320d m sport', '320d'], clusterId: 'cluster_bmw_320d_m_sport_2013' },
  { patterns: ['landrover defender', 'defender 2009'], clusterId: 'cluster_landrover_defender' },
  { patterns: ['evoque r-dynamic', 'evoque r dynamic'], clusterId: 'cluster_range_rover_evoque' },
  { patterns: ['lamborghini urus', 'urus'], clusterId: 'cluster_lamborghini_urus_2020' },
  { patterns: ['lx570', 'lx 570'], clusterId: 'cluster_2019_lexus_lx570' },
  { patterns: ['bmw z4 convertible', 'sdrive 20i', 'z4 2020'], clusterId: 'cluster_bmw_z4_convertible_sdrive_20i' },
  { patterns: ['rolls royce ghost', 'ghost series i'], clusterId: 'cluster_2015_rolls_royce_ghost_series_i' },
  { patterns: ['f10 520i', '520i m sport', 'f10'], clusterId: 'cluster_bmw_f10_520i_m_sport' },
  { patterns: ['cbr 650r', 'cbr650r', 'cbr'], clusterId: 'cluster_honda_cbr_650r' },
  { patterns: ['hilux gr sport', 'hilux gr', 'hilux'], clusterId: 'cluster_2024_toyota_hilux_gr_sport' },
  { patterns: ['e46 318i', 'e46'], clusterId: 'cluster_bmw_e46_318i' },
  { patterns: ['accord ex-l', 'accord'], clusterId: 'cluster_2014_honda_accord_ex_l' },
  { patterns: ['crown rs', 's220', 'crown 15th'], clusterId: 'cluster_2018_toyota_crown_rs_s220_15th_gen' },
  { patterns: ['fuso canter', 'canter'], clusterId: 'cluster_2015_mitsubishi_fuso_canter' },
  { patterns: ['fit rs'], clusterId: 'cluster_honda_fit_rs' },
  { patterns: ['2018 e200', 'e200 2018'], clusterId: 'cluster_2018_mercedes_e200' },
  { patterns: ['forester xt', 'forester x', 'forester'], clusterId: 'cluster_subaru_forester_x' },
  { patterns: ['xc60 t5', 'xc60 inscription', 'xc60'], clusterId: 'cluster_2017_volvo_xc60_t5_inscription' },
  { patterns: ['a5 s-line', 'a5 b9', 'a5'], clusterId: 'cluster_audi_a5_s_line_b9' },
  { patterns: ['x6 35d', 'x6 30d', 'x6'], clusterId: 'cluster_2020_bmw_x6_35d' },
  { patterns: ['golf r', 'mk7.5', 'golf'], clusterId: 'cluster_2016_vw_golf_r_mk7_5' },
  { patterns: ['jincheng 150', 'jincheng'], clusterId: 'cluster_jincheng_150' },
  { patterns: ['demio', 'mazda2'], clusterId: 'cluster_mazda_demio' },
  { patterns: ['gle 53', 'gle'], clusterId: 'cluster_mercedes_amg_gle_53_coupe' },
  { patterns: ['patrol', 'y62'], clusterId: 'cluster_nissan_patrol_y62' },
  { patterns: ['prado', 'land cruiser 300', 'land cruiser 200', 'land cruiser'], clusterId: 'cluster_toyota_land_cruiser_200' },
  { patterns: ['c-class', 'c200', 'c300', 'c63'], clusterId: 'cluster_mercedes_benz_c_class' },
  { patterns: ['cayenne'], clusterId: 'cluster_porsche_cayenne' },
  { patterns: ['e-class', 'e200', 'e300', 'e350'], clusterId: 'cluster_mercedes_benz_e_class' },
  { patterns: ['rav4', 'rav 4'], clusterId: 'cluster_toyota_rav4_newer' },
  { patterns: ['s-class', 's500', 's350', 'w223'], clusterId: 'cluster_mercedes_benz_s_class' },
  { patterns: ['q8'], clusterId: 'cluster_audi_q8' },
  { patterns: ['hiace', 'super gl'], clusterId: 'cluster_toyota_hiace' },
  { patterns: ['fit', 'vitz'], clusterId: 'cluster_honda_fit' },
  { patterns: ['crv', 'cr-v'], clusterId: 'cluster_honda_cr_v' },
  { patterns: ['es 300h', 'lexus sedan'], clusterId: 'cluster_lexus_es' },
  { patterns: ['rx', 'rx450h'], clusterId: 'cluster_lexus_rx' },
  { patterns: ['velar'], clusterId: 'cluster_range_rover_velar' },
  { patterns: ['vellfire', 'alphard'], clusterId: 'cluster_toyota_vellfire' },
  { patterns: ['polo'], clusterId: 'cluster_volkswagen_polo' },
  { patterns: ['ranger'], clusterId: 'cluster_ford_ranger' },
  { patterns: ['a6', 'a4'], clusterId: 'cluster_audi_a6' }
];

export function validateVehicleImageMatch(vehicle: Vehicle, image: VehicleImage): { valid: boolean; reason?: string } {
  if (!image || !image.image_url) {
    return { valid: false, reason: 'Missing image URL' };
  }

  // Any user/admin uploaded image, Supabase Storage URL, or non-demo image is always valid
  if (
    image.image_type === 'generic' || 
    image.image_url.startsWith('data:') || 
    image.image_url.startsWith('blob:') ||
    image.image_url.startsWith('http://') ||
    image.image_url.startsWith('https://') ||
    (image.image_url.startsWith('/') && !image.image_url.includes('cluster_'))
  ) {
    if (!image.image_url.includes('cluster_')) {
      return { valid: true };
    }
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
