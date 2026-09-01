import fs from 'fs';
import path from 'path';

console.log('Generating canonical vehicle image manifest with natural numeric sorting...');

const carImagesDir = path.resolve('public/Car Images');
const files = fs.readdirSync(carImagesDir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));

// Group files by prefix (up to the trailing number _01.jpeg)
const clusters = {};

files.forEach(filename => {
  const match = filename.match(/^(.*?)_\d+\.(jpg|jpeg|png|webp)$/i);
  const prefix = match ? match[1] : filename.replace(/\.(jpg|jpeg|png|webp)$/i, '');
  const clusterId = `cluster_${prefix.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;

  if (!clusters[clusterId]) {
    clusters[clusterId] = {
      id: clusterId,
      name: prefix.replace(/_/g, ' '),
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
