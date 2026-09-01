import { VehicleImage } from '../../types/database';
import { AUTOMATIC_VEHICLE_CLUSTERS, VehicleCluster } from '../../data/vehicleImageManifest';

export function buildVehicleImages(vehicleId: string, clusterId: string, altTitle: string): VehicleImage[] {
  const cluster: VehicleCluster | undefined = AUTOMATIC_VEHICLE_CLUSTERS[clusterId];
  if (!cluster || !cluster.images || cluster.images.length === 0) return [];

  return cluster.images.map((url, index) => ({
    id: `img-${vehicleId.slice(-4)}-${index + 1}`,
    vehicle_id: vehicleId,
    image_url: url,
    thumbnail_url: url,
    alt_text: `${altTitle} - ${index === 0 ? 'Front Exterior Hero' : index < 4 ? 'Exterior View' : 'Interior & Features'}`,
    display_order: index + 1,
    is_primary: index === 0,
    source_type: 'local_image_library',
    license_status: 'authorized',
    created_at: new Date().toISOString()
  }));
}
