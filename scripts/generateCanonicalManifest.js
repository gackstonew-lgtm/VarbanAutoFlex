import fs from 'fs';
import path from 'path';

console.log('Generating canonical vehicle image manifest with natural numeric sorting...');

const carImagesDir = path.resolve('public/Car Images');
const files = fs.readdirSync(carImagesDir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));

function toAscii(str) {
  let res = str.normalize('NFKD');
  let clean = '';
  for (const ch of res) {
    const cp = ch.codePointAt(0);
    if (cp >= 0x1F1E6 && cp <= 0x1F1FF) clean += String.fromCharCode(65 + cp - 0x1F1E6);
    else clean += ch;
  }
  return clean;
}

// Group files by prefix
const clusters = {};

files.forEach(filename => {
  const asciiFilename = toAscii(filename);
  const match = asciiFilename.match(/^([\s\S]+?)(?:\s*\(\d+\)|_\d+)?\.(jpg|jpeg|png|webp)$/i);
  const rawPrefix = match ? match[1].trim() : asciiFilename.replace(/\.(jpg|jpeg|png|webp)$/i, '').trim();
  const clusterId = 'cluster_' + rawPrefix.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

  if (!clusters[clusterId]) {
    clusters[clusterId] = {
      id: clusterId,
      name: rawPrefix.replace(/_/g, ' '),
      images: [],
      primaryImage: '',
      confidence: 0.99
    };
  }

  const webUrl = `/Car Images/${filename}`;
  clusters[clusterId].images.push(webUrl);
});

// Set primary image and natural numeric sort for each cluster
Object.keys(clusters).forEach(key => {
  const c = clusters[key];
  c.images.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  c.primaryImage = c.images[0];
});

// Deterministically sort cluster keys alphabetically by Brand -> Model
const sortedClusters = {};
Object.keys(clusters).sort((a, b) => a.localeCompare(b)).forEach(key => {
  sortedClusters[key] = clusters[key];
});

const tsContent = `// AUTOMATICALLY GENERATED CANONICAL VEHICLE IMAGE MANIFEST
// Source of truth: public/Car Images
// Total Files: ${files.length}

export interface VehicleCluster {
  id: string;
  name: string;
  images: string[];
  primaryImage: string;
  confidence: number;
}

export const AUTOMATIC_VEHICLE_CLUSTERS: Record<string, VehicleCluster> = ${JSON.stringify(sortedClusters, null, 2)};
`;

fs.writeFileSync(path.resolve('src/data/vehicleImageManifest.ts'), tsContent, 'utf-8');

console.log(`Manifest updated with ${Object.keys(sortedClusters).length} naturally ordered clusters and ${files.length} image files.`);
