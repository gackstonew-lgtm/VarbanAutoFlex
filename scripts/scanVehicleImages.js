import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CAR_IMAGES_DIR = path.join(__dirname, '../public/Car Images');
const MANIFEST_PATH = path.join(__dirname, '../src/data/vehicleImageManifest.ts');

function getFileHash(filepath) {
  const fileBuffer = fs.readFileSync(filepath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

function scanImages() {
  if (!fs.existsSync(CAR_IMAGES_DIR)) {
    console.error('Car Images directory not found:', CAR_IMAGES_DIR);
    return;
  }

  const files = fs.readdirSync(CAR_IMAGES_DIR).filter(file => {
    const ext = path.extname(file).toLowerCase();
    const isFile = fs.statSync(path.join(CAR_IMAGES_DIR, file)).isFile();
    return isFile && ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
  });

  console.log(`Found ${files.length} image files directly in public/Car Images.`);

  // Detect exact duplicates via SHA-256 binary hash
  const hashHashMap = new Map();
  const uniqueFiles = [];
  let duplicateCount = 0;

  for (const filename of files) {
    const fullPath = path.join(CAR_IMAGES_DIR, filename);
    const hash = getFileHash(fullPath);
    if (hashHashMap.has(hash)) {
      duplicateCount++;
    } else {
      hashHashMap.set(hash, filename);
      uniqueFiles.push(filename);
    }
  }

  console.log(`Unique images: ${uniqueFiles.length}, Exact duplicates removed: ${duplicateCount}`);

  // Sort files by timestamp string
  uniqueFiles.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  const clusterMap = new Map();

  for (const filename of uniqueFiles) {
    // Extract timestamp string e.g. "09.46.24"
    const match = filename.match(/at (\d{2}\.\d{2}\.\d{2})/);
    const timeStr = match ? match[1] : '';

    let clusterId = 'cluster_general';
    if (timeStr === '09.46.11') clusterId = 'cluster_honda_fit';
    else if (timeStr === '09.46.13') clusterId = 'cluster_crv';
    else if (timeStr === '09.46.14') clusterId = 'cluster_lexus_es';
    else if (timeStr === '09.46.15') clusterId = 'cluster_lexus_rx';
    else if (timeStr === '09.46.16') clusterId = 'cluster_velar';
    else if (timeStr === '09.46.17') clusterId = 'cluster_vellfire';
    else if (timeStr === '09.46.18') clusterId = 'cluster_xc60';
    else if (timeStr === '09.46.19') clusterId = 'cluster_polo';
    else if (timeStr === '09.46.20') clusterId = 'cluster_ranger';
    else if (timeStr === '09.46.21') clusterId = 'cluster_audi_a6';
    else if (timeStr >= '09.46.24' && timeStr <= '09.46.33') clusterId = 'cluster_mercedes_c_class';
    else if (timeStr >= '09.46.34' && timeStr <= '09.46.45') clusterId = 'cluster_land_cruiser_200';
    else if (timeStr >= '09.46.46' && timeStr <= '09.46.49') clusterId = 'cluster_mercedes_gle_coupe';
    else if (timeStr >= '09.46.50' && timeStr <= '09.46.57') clusterId = 'cluster_porsche_cayenne';
    else if (timeStr >= '09.46.58' && timeStr <= '09.47.06') clusterId = 'cluster_vw_golf_mk8';
    else if (timeStr >= '09.47.07' && timeStr <= '09.47.17') clusterId = 'cluster_mercedes_e_class';
    else if (timeStr >= '09.47.18' && timeStr <= '09.47.23') clusterId = 'cluster_bmw_x6';
    else if (timeStr >= '09.47.24' && timeStr <= '09.47.29') clusterId = 'cluster_rav4_older';
    else if (timeStr >= '09.47.30' && timeStr <= '09.47.34') clusterId = 'cluster_rav4_newer';
    else if (timeStr >= '09.47.35' && timeStr <= '09.47.41') clusterId = 'cluster_hiace';
    else if (timeStr >= '09.47.42' && timeStr <= '09.47.46') clusterId = 'cluster_demio';
    else if (timeStr >= '09.47.47' && timeStr <= '09.47.51') clusterId = 'cluster_patrol_y62';
    else if (timeStr >= '09.47.52' && timeStr <= '09.47.54') clusterId = 'cluster_s_class';
    else if (timeStr >= '09.47.55' && timeStr <= '09.47.57') clusterId = 'cluster_audi_q8';

    if (!clusterMap.has(clusterId)) {
      clusterMap.set(clusterId, {
        id: clusterId,
        images: [],
        primaryImage: null,
        confidence: 0.98
      });
    }

    const publicUrl = `/Car Images/${filename}`;
    clusterMap.get(clusterId).images.push(publicUrl);
  }

  const clusters = Array.from(clusterMap.values());
  for (const c of clusters) {
    c.primaryImage = c.images[0] || null;
  }

  const outputCode = `// AUTOMATICALLY GENERATED VEHICLE IMAGE MANIFEST
// Canonical source: public/Car Images
// Total Usable Images: ${uniqueFiles.length}

export interface VehicleCluster {
  id: string;
  images: string[];
  primaryImage: string;
  confidence: number;
}

export const AUTOMATIC_VEHICLE_CLUSTERS: Record<string, VehicleCluster> = ${JSON.stringify(
    clusters.reduce((acc, c) => {
      acc[c.id] = c;
      return acc;
    }, {}),
    null,
    2
  )};
`;

  fs.writeFileSync(MANIFEST_PATH, outputCode, 'utf8');
  console.log(`Generated manifest at ${MANIFEST_PATH} with ${clusters.length} vehicle clusters.`);
}

scanImages();
