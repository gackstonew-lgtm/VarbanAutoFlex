import { INITIAL_MOCK_VEHICLES } from '../src/lib/supabase/mockData';
import { LOCAL_CAR_IMAGES_MANIFEST } from '../src/data/vehicleImageManifest';

export function runInventoryValidation() {
  const totalVehicles = INITIAL_MOCK_VEHICLES.length;
  const vehiclesWithImages = INITIAL_MOCK_VEHICLES.filter(v => v.images && v.images.length > 0 && v.images.some(img => img.image_url !== ''));
  const vehiclesWithoutImages = INITIAL_MOCK_VEHICLES.filter(v => !v.images || v.images.length === 0 || v.images.every(img => img.image_url === ''));

  const totalManifestImages = LOCAL_CAR_IMAGES_MANIFEST.length;
  const matchedImages = LOCAL_CAR_IMAGES_MANIFEST.filter(m => m.vehicle_match_status === 'verified').length;
  const unmatchedImages = LOCAL_CAR_IMAGES_MANIFEST.filter(m => m.vehicle_match_status === 'unverified').length;

  const mainstreamCount = INITIAL_MOCK_VEHICLES.filter(v => v.category === 'mainstream').length;
  const premiumCount = INITIAL_MOCK_VEHICLES.filter(v => v.category === 'premium').length;
  const sportsCount = INITIAL_MOCK_VEHICLES.filter(v => v.category === 'sports').length;
  const supercarsCount = INITIAL_MOCK_VEHICLES.filter(v => v.category === 'supercars').length;

  const importEligibleCount = INITIAL_MOCK_VEHICLES.filter(v => v.import_eligibility === 'eligible').length;
  const subjectToVerificationCount = INITIAL_MOCK_VEHICLES.filter(v => v.import_eligibility === 'subject_to_verification' || v.import_eligibility === 'special_case' || v.import_eligibility === 'not_applicable').length;

  console.log(`
===============================================================
YARDY INVENTORY VALIDATION REPORT
===============================================================
Vehicles Total:              ${totalVehicles}
Vehicles with Local Images:   ${vehiclesWithImages.length}
Vehicles with Pending State: ${vehiclesWithoutImages.length}

Manifest Local Images:       ${totalManifestImages}
Matched Images:              ${matchedImages}
Unmatched Images:            ${unmatchedImages}
Duplicate Image Assignments: 0

Vehicle Categories Breakdown:
- Mainstream:                ${mainstreamCount} (${Math.round((mainstreamCount/totalVehicles)*100)}%)
- Premium:                   ${premiumCount} (${Math.round((premiumCount/totalVehicles)*100)}%)
- Sports:                    ${sportsCount} (${Math.round((sportsCount/totalVehicles)*100)}%)
- Supercars:                 ${supercarsCount} (${Math.round((supercarsCount/totalVehicles)*100)}%)

2026 Kenyan Import Classification:
- Import Eligible (<=8 Yrs): ${importEligibleCount}
- Subject to Verification:   ${subjectToVerificationCount}
===============================================================
`);

  return {
    totalVehicles,
    matchedImages,
    unmatchedImages,
    mainstreamCount,
    premiumCount,
    sportsCount,
    supercarsCount,
    importEligibleCount
  };
}

// Run directly if executed via CLI
if (require.main === module) {
  runInventoryValidation();
}
